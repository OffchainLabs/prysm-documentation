---
id: fallbackbeaconnodes
title: Enhance validator reliability with fallback beacon nodes
sidebar_label: Add fallback beacon nodes
---

Prysm's validator client supports multiple beacon node endpoints for redundancy and load balancing. How those endpoints are used depends on the protocol:

- **gRPC (default)** uses an **active-passive** scheme: one endpoint is active at a time, and the validator client fails over to the next endpoint in the list when the active one becomes unresponsive or unsynced.
- **REST** uses an **active-active** scheme: the validator client listens to the event stream of *every* configured beacon node and queries all of them, keeping the best-suited response.

### Prerequisites

- Prysm installed (via official release binaries or built from source).
- At least two beacon nodes running and accessible from the machine running the validator client.
- Validator keys and a wallet already created (e.g., via `prysm validator wallet create`).

### Connecting with gRPC (default)

Use `--beacon-rpc-provider` on the **validator client** with a comma-separated list of `host:port` pairs. The gRPC port defaults to **4000**.

```
./prysm.sh validator \
  --wallet-dir=/path/to/wallet \
  --beacon-rpc-provider=localhost:4000,remote-beacon.example.com:4000,another-beacon:4000 \
  --datadir=/path/to/validator/data \
  --mainnet \
  --suggested-fee-recipient=0xYourEthereumAddressForFees
```

:::note gRPC deprecation

gRPC will remain the default and fully supported through v8 (expected in 2026) but will eventually be removed in favor of the REST API.

:::

### Connecting with REST

Use `--beacon-rest-api-provider` on the **validator client** with a comma-separated list of HTTP URLs. Also pass `--enable-beacon-rest-api` on the **validator client** to switch it from gRPC to REST when communicating with the beacon node. The beacon node's REST API is served on port **3500** by default (controlled on the beacon node side by `--http-port`, alias `--grpc-gateway-port`).

Unlike gRPC, the order of the REST endpoints does not define a priority; all listed nodes are used simultaneously.

```
./prysm.sh validator \
  --wallet-dir=/path/to/wallet \
  --beacon-rest-api-provider=http://localhost:3500,http://remote-beacon.example.com:3500,http://another-beacon:3500 \
  --enable-beacon-rest-api \
  --datadir=/path/to/validator/data \
  --mainnet \
  --suggested-fee-recipient=0xYourEthereumAddressForFees
```

:::caution REST is experimental

The REST API path (`--enable-beacon-rest-api`) is experimental and not recommended for Mainnet. Use gRPC for production validators.

:::

All flags in both examples go on the **validator client** binary. The beacon node does not require any additional flags to serve its HTTP API — it is enabled by default on port 3500.

### Fallback behavior with gRPC (active-passive)

gRPC uses sync-status-aware failover logic:

- The validator checks that each candidate endpoint is reachable **and** fully synced before using it.
- If the active endpoint becomes unhealthy or unsynced, the validator tries each remaining endpoint in order and stops at the first healthy one. Failover wraps back to the first endpoint after the last.

Only the active endpoint is used for event subscriptions and requests; the others stay idle until a failover happens.

### Fallback behavior with REST (active-active)

With REST, there is no active endpoint and therefore no failover step: every configured beacon node is used all the time.

- The validator client subscribes to the event stream of **all** configured beacon nodes, merges those streams into one, and drops duplicate events.
- It tracks the most advanced head announced by *any* connected node, and uses it as the expected head.
- When it needs attestation data, a block root for sync committee duties, or payload attestation data, it queries all nodes concurrently, retries until one of them answers with data matching the expected head, and keeps that response. If the duty deadline is reached without a match, it falls back to the first usable response received, so the validator still votes rather than skipping the duty.
- When it needs a block to propose, it likewise queries all nodes concurrently and prefers the block built on top of the expected head.

This mainly helps when one node lags behind. If a single beacon node fails to import a block within the attestation deadline, but another connected node imported it in time, the validator client learns about the new head from that node and requests fresh attestation data from it, so the head, source, and target votes stay correct.

If a beacon node goes offline, its event stream and requests simply stop contributing; the remaining nodes continue serving the validator client, and the offline node is reconnected automatically once it is back.

:::note Active-active replaces active-passive for REST

The REST validator client previously used the same active-passive failover scheme as gRPC. Because `--enable-beacon-rest-api` is still experimental, the active-passive scheme was replaced by active-active rather than being offered as an option. No configuration change is required: keep passing a comma-separated list to `--beacon-rest-api-provider`.

:::

### Health checks and `--max-health-checks`

The `--max-health-checks` flag (on the **validator client**) controls how many consecutive failed health checks are tolerated before the validator shuts down gracefully. With REST, a health check fails only when **none** of the connected beacon nodes is ready, so a single node being down or syncing does not count as a failure.

| Value | Behavior |
|-------|----------|
| `0` (default) | Indefinite — the validator never times out due to health check failures and keeps retrying forever. |
| Positive integer (e.g., `10`) | The validator shuts down after that many consecutive failed checks, allowing a process manager to restart it. |

Example with a finite limit:

```
./prysm.sh validator \
  --wallet-dir=/path/to/wallet \
  --beacon-rpc-provider=localhost:4000,remote-beacon.example.com:4000 \
  --max-health-checks=10 \
  --datadir=/path/to/validator/data \
  --mainnet
```

While health checks are failing, the validator logs:

```
Failed health check, beacon node is unresponsive  fails=X maxFails=Y url=...
```

When the limit is reached:

```
Maximum health checks reached. Stopping health check routine  maxFails=Y url=...
```

With REST and several beacon nodes, the `url` field of these logs lists every configured endpoint (comma-separated) rather than a single active one, since the health check covers all of them.

### Monitoring and testing

- Monitor logs for `Failed health check` and `Health status changed` messages.
- Use [Prometheus and Grafana](/monitoring-alerts-metrics/grafana-dashboard.md) (enabled via `--monitoring-port=8081`) to track validator performance.
- Test fallbacks by shutting down one beacon node and confirming the validator continues attesting and proposing via the remaining endpoints. With REST, shut down all but one node—whichever one you keep, the validator client should keep performing its duties.

### Other common flags

- `--graffiti="YourCustomGraffiti"`: Optional [custom block graffiti](/manage-validator/add-graffiti.md).
- `--wallet-password-file=/path/to/password.txt`: For non-interactive runs.
- `--enable-doppelganger`: Enables doppelganger protection. If the primary node is down at startup, this may delay the validator — test in a dev environment before enabling on Mainnet.
- `--tls-cert` / `--tls-key`: For encrypted gRPC connections.
- `--mainnet`, `--holesky`, or `--sepolia`: Network selection flag.

If you encounter issues, join the [Prysm Discord](https://discord.com/invite/prysm) community for support.
