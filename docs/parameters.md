---
id: parameters
title: Available parameters
sidebar_label: Available parameters
---

## Docker Commands
The beacon node can be halted by either using `Ctrl+c` or with the command:

```text
docker stop beacon-node
```

To restart the beacon node, issue the following command:

```text
docker start -ai beacon-node
```

To delete a corrupted container, issue the following command:

```text
docker rm beacon-node
```

To recreate a deleted container and refresh the chain database, issue the start command with an additional `--clear-db` parameter:

```text
docker run -it -v $HOME/prysm:/data -p 4000:4000 -p 13000:13000 --name beacon-node \
  gcr.io/prysmaticlabs/prysm/beacon-chain:latest \
  --datadir=/data \
  --clear-db
```

## Startup parameters
This section lists the various flags used to customise the startup process of beacon nodes and validator clients.
### Shared flags
These flags are shared by both the beacon node and validator client.
| Flag          | Usage         |
| ------------- |:-------------|
| `--verbosity`     | Logging verbosity (trace, debug, info=default, warn, error, fatal, panic). |
| `--datadir [path]`     | Allows user to specify a data directory for the databases and keystore. |
| `--enable-tracing` | Enables request tracing.    |
| `--tracing-endpoint` | Tracing endpoint defines where beacon chain traces are exposed. <br>Default: http://127.0.0.1:14268/api/traces |
| `--tracing-process-name` | The name to apply to tracing tag \"process_name\" |
| `--trace-sample-fraction` | Indicate what fraction of P@P messages are sampled for tracing. <br>Default: 0.20 |
| `--disable-monitoring` | Disable all monitoring service.
| `--monitoring-port` | Port used by prometheus for listening and responding to messages. <br>Default: 8080 |
| `--no-discovery` | Enable only local network P2P and do not connect to cloud bootstrap nodes.
| `--peer` | Connect with a specified peer. This flag may be used multiple times. |
| `--bootstrap-node` | The address of bootstrap node. Beacon node will connect for peer discovery via DHT.  Multiple nodes can be separated with a comma. <br>Default:
| `--relay-node ` | The address of relay node. The beacon node will connect to the relay node and advertise their address via the relay node to other peers.
| `--p2p-udp-port ` | The port used by discv5. <br>Default: 12000
| `--p2p-tcp-port` | The port used by libP2P. <br>Default: 13000
| `--p2p-local-ip` | The local ip address to listen for incoming data.
| `--p2p-host-ip` |  The DNS address advertised by libp2p. This may be used to advertise an external DNS.
| `--p2p-host-dns` | The DNS address advertised by libp2p. This may be used to advertise an external DNS.
| `--p2p-max-peers` | The max number of p2p peers to maintain. <br>Default: 30
| `--p2p-whitelist` | The CIDR subnet for whitelisting peer connections. Example: 192.168.0.0/16 would whitelist connections to peers on your local network only. The default is to accept all connections.
| `--p2p-encoding` | The encoding format of messages sent over the wire. The default is 0, which represents ssz.
| `--force-clear-db` | Clear any previously stored data at the data directory.
| `--clear-db` | Prompt for clearing any previously stored data at the data directory.
| `--log-format` | Specify log formatting. Supports: text, json, fluentd.
| `--log-file` | Specifies the upper limit of goroutines running before a status check fails. <br>Default: 5000
| `--max-goroutines` | Specify log file name, relative or absolute.
| `--enable-upnp` | Enable the service (Beacon chain or Validator) to use UPnP when possible.

## Beacon node parameters
These flags are specific to launching the beacon node.
### Base flags
| r        | Are           |
| ------------- |:-------------|
| `--no-custom-config` | Run the beacon chain with the real Phase 0 parameters.
| `--http-web3provider` | Define a mainchain web3 provider string http endpoint. <br>Default:  https://goerli.prylabs.net
| `--web3provider` | Define a mainchain web3 provider string endpoint. Can be either a IRC file strong or a WebSocket endpoint. Cannot be an HTTP endpoint. <br>Default: wss://goerli.prylabs.net/websocket
| `--deposit-contract` |Define a deposit contract address. Beacon chain node will listen logs coming from the deposit contract to determine when validator is eligible to participate.
| `--rpc-host` | Define an address of the host on which the RPC server should listen. <br>Default: 0.0.0.0
| `--rpc-port` | Define a RPC port to be exposed by the beacon node. <br>Value: 4000
| `--rpc-max-page-size` | Define the max number of items returned per page in RPC responses for paginated endpoints. <br>Default: 500
| `--tls-cert` |Certificate for secure gRPC. Pass this and the tls-key flag in order to use gRPC securely.
| `--tls-key` | Key for secure gRPC. Pass this and the tls-cert flag in order to use gRPC securely.
| `--grpc-gateway-port` | Enable gRPC gateway for JSON requests.
| `--min-sync-peers` | The required number of valid peers to connect with before syncing."
| `--contract-deployment-block` | Define the ETH1 block in which the deposit contract was deployed. <br>Default: 1960177
| `--slasher-tls-cert` | Certificate for secure slasher gRPC connection. Pass this in order to use slasher gRPC securely.
| `--slasher-provider` | Define a slasher provider string endpoint. Can either be an gRPC server endpoint. <br>Default: 127.0.0.1:5000
### Archive flags
| Flag      | Usage           |
| ------------- |:-------------|
| `--archive` | Whether or not beacon chain should archive historical data including blocks, attestations, and validator set changes.
| `--archive-validator-set-changes` | Whether or not beacon chain should archive historical validator set changes.
| `--archive-Blocks [Y/N]` | Whether or not beacon chain should archive historical blocks
| `--archive-attestations` | Whether or not beacon chain should archive historical attestations.

### Interop flags
| Flag          | Usage         |
| ------------- |:-------------|
|`--interop-genesis-state` | The genesis state file (.SSZ) to load from.
|`--interop-eth1data-votes` | Enable mocking of eth1 data votes for proposers to package into blocks.
|`--interop-genesis-time` | Specify the genesis time for interop genesis state generation. Must be used with `--interop-num-validators`.
|`--interop-num-validators` | Specify number of genesis validators to generate for interop. Must be used with `--interop-genesis-time`.

## Validator parameters
These flags are specific to launching a validator client.
### Base flags
| Flag          | Usage         |
| ------------- |:-------------|
|`--no-custom-config` | Run the beacon chain with the real parameters from phase 0.
|`--beacon-rpc-server` | Beacon node RPC provider endpoint. <br>Default: localhost:4000
|`--tls-cert` | Certificate for secure gRPC. Pass this and the tls-key flag in order to use gRPC securely.
|`--keystore-path` | Path to the desired keystore directory.
|`--unencrypted-keys` | Filepath to a JSON file of unencrypted validator keys for easier launching of the validator client.
|`--keymanager`| The keymanger to use (unencrypted, interop, keystore, wallet).
|`--keymanageropts`| The options for the keymanger, either a JSON string or path to same.
|`--password` | String value of the password for your validator private keys.
|`--disable-rewards-penalties-logging` | Disable reward/penalty logging during cluster deployment.
|`--graffiti` | String to include in proposed block.
|`--grpc-max-msg-size`| Integer to define max recieve message call size. <br>Default: 52428800 (for 50Mb).
|`--enable-account-metrics` | Enable prometheus metrics for validator accounts.

### Interop flags
| Flag          | Usage         |
| ------------- |:-------------|
|`--interop-start-index` | The start index to deterministically generate validator keys when used in combination with `--interop-num-validators`. Example: `--interop-start-index=5 --interop-num-validators=3` would generate keys from index 5 to 7.
|`--interop-num-validators` | The number of validators to deterministically generate validator keys when used in combination with `--interop-num-validators`. Example: `--interop-start-index=5 --interop-num-validators=3` would generate keys from index 5 to 7.
