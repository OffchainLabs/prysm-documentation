---
id: fallbackbeaconnodes
title: Enhance validator reliability with fallback beacon nodes
sidebar_label: Add fallback beacon nodes
---

To configure a validator using Prysm with fallback beacon nodes, you can leverage Prysm's built-in support for multiple beacon node endpoints. The fallback provides load balancing and redundancy—if one beacon node becomes unresponsive, the validator client will automatically fall back to the others. The configuration uses the `--beacon-rpc-provider` with comma-separated gRPC endpoints (e.g., `host:port` pairs) or the `--beacon-rest-api-provider` flag with with comma-separated HTTP URLs (e.g., `http://localhost:3500,http://remote:3500`).

### Prerequisites

- Ensure you have Prysm installed (e.g., via binaries from the official releases or built from source).
- Set up at least two beacon nodes (local or remote) that your validator can connect to. Each beacon node should be running and exposing its gRPC port (default: 4000).
- Generate or import your validator keys and wallet (e.g., using `prysm validator wallet create`).

### Step-by-Step Configuration

1. **Run the Validator Client with Fallback Endpoints**:
   - Start the validator client, specifying multiple beacon node endpoints for fallback. Use the `--beacon-rpc-provider` flag with comma-separated values. For example:
     ```
     ./prysm.sh validator \
       --wallet-dir=/path/to/wallet \
       --beacon-rpc-provider=localhost:4000,remote-beacon.example.com:4000,another-beacon:4000 \
       --datadir=/path/to/validator/data \
       --mainnet \
       --suggested-fee-recipient=0xYourEthereumAddressForFees
     ```
     - **Explanation**:
       - `--beacon-rpc-provider`: Lists the gRPC endpoints of your beacon nodes. The validator client will distribute requests across them and fall back if one fails (e.g., due to network issues or downtime).
       - Add more endpoints as needed for additional redundancy.
       - If using HTTP-based beacon APIs (supported in newer Prysm versions or forks), you can instead use `--beacon-rest-api-provider` with comma-separated HTTP URLs (e.g., `http://localhost:3500,http://remote:3500`). Note: When using `--beacon-rest-api-provider`, you must also enable `--enable-beacon-rest-api` on your beacon node(s).
       - **Other common flags**:
         - `--graffiti="YourCustomGraffiti"`: Optional, for [custom block graffiti](/manage-validator/add-graffiti.md).
         - `--wallet-password-file=/path/to/password.txt`: For non-interactive runs.
         - `--enable-doppelganger`: Enables doppelganger protection but may interfere with fallbacks in some cases (e.g., if the primary node is down during startup—test this in a dev environment).

:::caution Caution

- **gRPC**: If you provide multiple hosts and it connects to the first, it will fall back to the second. If the second host attempt fails, it will fall back to the first host. However, if the first host doesn't work again, it will not attempt the second again.
- **REST**: It will continually round-robin between hosts, until all retries are exhausted (if set to 0, it will attempt indefinitely).

:::

2. **Incorporate Health Checks (Including `maxHealthChecks` from [PR #15401](https://github.com/OffchainLabs/prysm/pull/15401))**:
   - In the OffchainLabs/prysm fork, [Pull Request #15401](https://github.com/OffchainLabs/prysm/pull/15401) introduces enhancements for safe validator shutdowns and restarts based on health checks of the connected beacon nodes. This health check is instrumental in fallback setups, handling scenarios where all beacon nodes become unhealthy.
   - (**Optional**) The key addition is the `--max-health-checks` flag, which controls the maximum number of consecutive failed health checks before the validator client times out and shuts down gracefully (allowing for restarts or manual intervention).
     - **Usage**: Add it to your validator command, e.g.:
       ```
       ./prysm.sh validator \
         --wallet-dir=/path/to/wallet \
         --beacon-rpc-provider=localhost:4000,remote-beacon.example.com:4000 \
         --max-health-checks=10 \
         --datadir=/path/to/validator/data \
         --mainnet
       ```
     - **Explanation of `maxHealthChecks`**:
       - **Value**: An integer specifying the max failed checks (e.g., `10`). The validator will log warnings, such as "Failed health check, beacon node is unresponsive (fails=X maxFails=Y)" during issues.
       - **Special value**: `0` for indefinite checks (no timeout, keeps retrying forever).
       - Default: Not specified in the PR (check your build's flags with `--help`), but typically finite to prevent indefinite hangs.
       - This flag works alongside fallbacks: If all endpoints fail health checks (e.g., syncing issues or connectivity loss), the counter increments until reaching the limit, triggering a shutdown. Its design is to improve reliability in multi-node setups, with compatibility for gRPC load balancing and multiple beacon node HTTP resolvers.

3. **Monitoring and Testing**:
   - Monitor logs for health check messages or fallback switches (e.g., "Switching to fallback beacon node").
   - Use tools like [Prometheus and Grafana](/monitoring-alerts-metrics/grafana-dashboard.md) (enabled via `--monitoring-port=8081`) to track validator performance.
   - **Test fallbacks**: Shut down one beacon node and verify the validator continues attesting/proposing via the others.
   - If enabling features like MEV-Boost, add `--http-mev-relay=http://mev-relay.example.com` for external builders, with automatic fallback to local execution if needed.

### Potential Issues and Tips

- **Doppelganger Protection**: If enabled, it might prevent quick fallbacks during startup if the primary node is down. Disable it temporarily for testing.
- **Network-Specific Flags**: Use `--mainnet`, `--holesky`, or `--sepolia` depending on your chain.
- **Security**: Expose gRPC/HTTP ports securely (e.g., via TLS with `--tls-cert` and `--tls-key`).
- For advanced setups (e.g., Kubernetes), use environment variables like `BEACON_RPC_PROVIDER` instead of flags.

This setup ensures high availability for your validator. If you encounter errors, join the [Prysm Discord](https://discord.com/invite/prysm) community for support.
