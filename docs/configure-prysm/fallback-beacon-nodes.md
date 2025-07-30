---
id: fallbackbeaconnodes
title: Enhance validator reliability with fallback beacon nodes
sidebar_label: Add fallback beacon nodes
---

To configure a validator using Prysm with fallback beacon nodes, you can leverage Prysm's built-in support for multiple beacon node endpoints. The fallback provides load balancing and redundancy—if one beacon node becomes unresponsive, the validator client will automatically fall back to the others. The configuration uses the `--beacon-rpc-provider` with comma-separated gRPC endpoints (e.g., `host:port` pairs) or the `--beacon-rest-api-provider` flag with with comma-separated HTTP URLs (e.g., `http://localhost:3500,http://remote:3500`).

<!-- Fallbacks are essential for ensuring the reliability, security, and performance of Ethereum staking operations. Here's a breakdown of their key importance:

### 1. **Redundancy and Fault Tolerance**
- Beacon nodes can experience downtime due to network issues, hardware failures, software bugs, or maintenance. Without fallbacks, a single point of failure in the primary beacon node could render your validator unable to attest or propose blocks, resulting in missed duties.
- By specifying multiple endpoints via flags like `--beacon-rpc-provider`, Prysm automatically load-balances requests and switches to a healthy fallback if the primary becomes unresponsive, which minimizes disruptions and keeps your validator online.

### 2. **Preventing Financial Penalties**
- In Ethereum's proof-of-stake system, validators are penalized for inactivity (e.g., missed attestations reduce your effective balance over time, and prolonged offline periods trigger the inactivity leak mechanism, which can lead to slashing in extreme cases).
- Fallbacks help maintain high uptime (ideally >99%), ensuring consistent participation and maximizing rewards while avoiding losses. For instance, during events such as chain forks or client bugs, fallbacks enable seamless continuation.

### 3. **Load Balancing and Performance Optimization**
- Distributing API calls (e.g., gRPC requests for chain data) across multiple beacon nodes reduces load on any single node, improving response times and scalability.
- This is particularly useful in resource-constrained setups, such as remote or cloud-based nodes, where one node might sync slowly or handle high traffic poorly.

### 4. **Enhanced Security and Diversity**
- Relying on a single beacon node increases vulnerability to targeted attacks or client-specific vulnerabilities. Fallbacks enable client diversity (e.g., mixing Prysm with Lighthouse or other consensus clients) for better network health and reduced correlated failure risks.
- In setups like MEV (Maximal Extractable Value) configurations, fallbacks provide a safety net, reverting to local execution if external relays fail, preventing proposal delays.

### 5. **Operational Flexibility**
- Fallbacks support maintenance windows (e.g., updating one node while others handle traffic) and integration with third-party services like Infura, though compatibility checks are needed.
- Features like health checks (e.g., `--max-health-checks` in specific Prysm forks) complement fallbacks by monitoring node status and triggering graceful shutdowns if all endpoints fail, allowing automated restarts. -->



## How It Works Under the Hood

The `maxHealthChecks` logic is present in the validator's health monitoring loop:
1. **Initialization**: When starting the validator (e.g., via `bazel run //cmd/validator:validator`), the flag value is parsed and assigned to `maxHealthChecks`.
2. **Health Monitoring**: The new `healthMonitor` component runs in the background, performing periodic checks (e.g., via gRPC or HTTP endpoints) on the beacon node's status.

:::caution Caution

- **gRPC**: If you provide multiple hosts and it connects to the first, it will fall back to the second. If the second host attempt fails, it will fall back to the first host. However, if the first host doesn't work again, it will not attempt the second again.
- **REST**: It will continually round-robin between hosts, until all retries are exhausted (if set to 0, it will attempt indefinitely).

:::

3. **Counter Management**: Each failed check increments `healthCheckCounter`. Successful checks reset it.
4. **Threshold Check**: If the counter hits the `maxHealthChecks` limit (and it's not 0), the monitor triggers a shutdown by canceling the validator's context.
5. **Recovery**: Post-shutdown, operators can restart the validator, which will attempt reconnection. Tests in the PR confirm that upon beacon node recovery, the validator resumes duties seamlessly.

This mechanism is non-disruptive during regular operation and only activates in the event of prolonged issues, ensuring minimal impact on performance.

### Prerequisites
- Ensure you have Prysm installed (e.g., via binaries from the official releases or built from source).
- Set up at least two beacon nodes (local or remote) that your validator can connect to. Each beacon node should be running and exposing its gRPC port (default: 4000).
- Generate or import your validator keys and wallet (e.g., using `prysm validator wallet create`).
- If using the OffchainLabs/prysm fork (as referenced in your linked PR), build from their repository to access custom features like `--max-health-checks`.

### Step-by-Step Configuration
1. **Prepare Your Validator Wallet and Keys**:
   - If you haven't already, create a wallet and import your validator keys:
     ```
     ./prysm.sh validator wallet create --wallet-dir=/path/to/wallet --mainnet
     ```
     Follow the prompts to set a password and import keystores.

2. **Run the Validator Client with Fallback Endpoints**:
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
       - If using HTTP-based beacon APIs (supported in newer Prysm versions or forks), you can instead use `--beacon-rest-api-provider` with comma-separated HTTP URLs (e.g., `http://localhost:3500,http://remote:3500`). 
       - **Other common flags**:
         - `--graffiti="YourCustomGraffiti"`: Optional, for [custom block graffiti](/manage-validator/add-graffiti.md).
         - `--wallet-password-file=/path/to/password.txt`: For non-interactive runs.
         - `--enable-doppelganger`: Enables doppelganger protection but may interfere with fallbacks in some cases (e.g., if the primary node is down during startup—test this in a dev environment).

3. **Incorporate Health Checks (Including maxHealthChecks from [PR #15401](https://github.com/OffchainLabs/prysm/pull/15401))**:
   - In the OffchainLabs/prysm fork, [Pull Request #15401](https://github.com/OffchainLabs/prysm/pull/15401) introduces enhancements for safe validator shutdowns and restarts based on health checks of the connected beacon nodes. This health check is instrumental in fallback setups, handling scenarios where all beacon nodes become unhealthy.
   - The key addition is the `--max-health-checks` flag, which controls the maximum number of consecutive failed health checks before the validator client times out and shuts down gracefully (allowing for restarts or manual intervention).
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
       - **Value**: An integer specifying the max failed checks (e.g., 10). The validator will log warnings, such as "Failed health check, beacon node is unresponsive (fails=X maxFails=Y)" during issues.
       - **Special value**: 0 for indefinite checks (no timeout, keeps retrying forever).
       - Default: Not specified in the PR (check your build's flags with `--help`), but typically finite to prevent indefinite hangs.
       - This flag works alongside fallbacks: If all endpoints fail health checks (e.g., syncing issues or connectivity loss), the counter increments until reaching the limit, triggering a shutdown. Its design is to improve reliability in multi-node setups, with compatibility for gRPC load balancing and multiple beacon node HTTP resolvers.

4. **Monitoring and Testing**:
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











<!-- ### Step 1: Configure the Beacon Node
The `maxHealthChecks` flag is a beacon node configuration option. You can set it via command-line flags, a configuration file, or environment variables.

#### Option 1: Command-Line Flag
1. Start the beacon node with the `--max-health-checks` flag:
   ```bash
   ./bazel-bin/cmd/beacon-chain/beacon-chain --max-health-checks=10
   ```
   - Replace `10` with your desired number of consecutive failed health checks (e.g., `3` for stricter reconnection or `20` for more tolerance).
   - This flag applies to both gRPC and REST connections managed by the beacon node.

2. If using Docker, add the flag to the Docker run command:
   ```bash
   docker run -it -v $HOME/prysm-data:/data -p 4000:4000 -p 13000:13000 gcr.io/offchainlabs/prysm-beacon-chain:latest --max-health-checks=10
   ```

#### Option 2: Configuration File
1. Create or edit a Prysm configuration file (e.g., `config.yml`):
   ```yaml
   max-health-checks: 10
   ```
2. Start the beacon node with the configuration file:
   ```bash
   ./bazel-bin/cmd/beacon-chain/beacon-chain --config-file=config.yml
   ```
   Or with Docker:
   ```bash
   docker run -it -v $HOME/prysm-data:/data -v $HOME/config.yml:/config.yml gcr.io/offchainlabs/prysm-beacon-chain:latest --config-file=/config.yml
   ```

#### Option 3: Environment Variable
1. Set the environment variable for `maxHealthChecks`:
   ```bash
   export MAX_HEALTH_CHECKS=10
   ```
2. Start the beacon node:
   ```bash
   ./bazel-bin/cmd/beacon-chain/beacon-chain
   ```
   Or with Docker:
   ```bash
   docker run -it -e MAX_HEALTH_CHECKS=10 -v $HOME/prysm-data:/data gcr.io/offchainlabs/prysm-beacon-chain:latest
   ```


### Step 2: Configuration
#### Configure for gRPC
- **Default Behavior**: Prysm uses gRPC for communication between the beacon node and validator client unless REST mode is explicitly enabled.
- **Steps**:
  1. Ensure the beacon node is running with the `--max-health-checks` flag or configuration as set above.
  2. Start the validator client, connecting to the beacon node:
     ```bash
     ./bazel-bin/cmd/validator/validator --beacon-rpc-provider=localhost:4000
     ```
     Or with Docker:
     ```bash
     docker run -it -v $HOME/prysm-data:/data gcr.io/offchainlabs/prysm-validator:latest --beacon-rpc-provider=localhost:4000
     ```
  3. The `maxHealthChecks` setting on the beacon node will govern how many failed gRPC health checks (e.g., to `localhost:4000`) are allowed before the connection is marked unhealthy.

#### Configure for REST
- **Enable REST Mode**: To use REST instead of gRPC, configure the beacon node to enable the HTTP API and the validator to use REST endpoints.
- **Steps**:
  1. Start the beacon node with the REST API enabled and the `maxHealthChecks` flag:
     ```bash
     ./bazel-bin/cmd/beacon-chain/beacon-chain --http-web3provider=http://localhost:8545 --enable-beacon-rest-api --max-health-checks=10
     ```
     Or with Docker:
     ```bash
     docker run -it -v $HOME/prysm-data:/data -p 4000:4000 -p 13000:13000 gcr.io/offchainlabs/prysm-beacon-chain:latest --http-web3provider=http://localhost:8545 --enable-beacon-rest-api --max-health-checks=10
     ```
     - The `--enable-beacon-rest-api` flag enables the REST API.
     - The `--http-web3provider` specifies the execution client endpoint (e.g., Geth or Nethermind).
  2. Start the validator client in REST mode:
     ```bash
     ./bazel-bin/cmd/validator/validator --beacon-rest-api-provider=http://localhost:3500
     ```
     Or with Docker:
     ```bash
     docker run -it -v $HOME/prysm-data:/data gcr.io/offchainlabs/prysm-validator:latest --beacon-rest-api-provider=http://localhost:3500
     ```
     - The `--beacon-rest-api-provider` specifies the beacon node’s REST API endpoint (default port is 3500).
  3. The `maxHealthChecks` setting will control how many failed REST health checks are allowed before the connection is considered unhealthy.

### Step 3: Monitor and Test
1. **Monitor Logs**: Check the beacon node logs for health check-related messages. Look for errors indicating failed health checks or connection retries:
   ```bash
   docker logs <beacon-node-container>
   ```
   Or, if running locally:
   ```bash
   tail -f /path/to/beacon-node.log
   ```
2. **Simulate Failures**: To test the `maxHealthChecks` behavior, temporarily disrupt the connection (e.g., stop the execution client or block the gRPC/REST port) and observe if the beacon node reconnects after the specified number of failed health checks.
3. **Metrics**: Use Prysm’s monitoring tools (e.g., Prometheus and Grafana) to track connection health:
   - Configure [Prometheus and Grafana](/monitoring-alerts-metrics/grafana-dashboard.md).
   - Look for metrics related to gRPC or REST connection status.

### Step 4: Adjust `maxHealthChecks` as Needed
- **Tuning**: If you experience frequent disconnections, increase the `maxHealthChecks` value (e.g., to 15 or 20) to make the system more tolerant of temporary failures. If you want faster failover, decrease it (e.g., to 3 or 5).
- **Example**:
   ```bash
   ./bazel-bin/cmd/beacon-chain/beacon-chain --max-health-checks=15
   ```
- **Restart**: After changing the flag, restart the beacon node to apply the new setting.

### Step 5: Troubleshooting
- **Common Issues**:
  - If the beacon node fails to start, check for errors like “could not process slots” or “503 Service Unavailable,” which may indicate execution client sync issues. Ensure that you fully synchronize your execution client (such as Geth).
  - If REST endpoints fail, verify that `--enable-beacon-rest-api` is set and the correct port is open (default 3500).
  - For gRPC issues, ensure the `--beacon-rpc-provider` points to the correct host and port (default 4000).
- **Logs**: Review logs for health check failures or connection issues.
- **Community Support**: If you encounter issues, join the [Prysm Discord](https://discord.com/invite/prysm) community for support.

If prysm-node fails, the validator attempts eight health checks (e.g., ~40-80 seconds) before switching to lighthouse-node. Upon timeout, it shuts down gracefully, allowing Kubernetes to restart it and reconnect to an available node.

## Conclusion
The `--max-health-checks` and `--beacon-rest-api-provider` flags significantly enhance validator reliability by preventing hangs during beacon node failures and enabling flexible, interoperable connections via the Ethereum REST API. These features empower operators to build robust staking setups, whether solo or in complex cloud environments. As Ethereum continues to scale, such improvements ensure that validators remain a cornerstone of network security. -->