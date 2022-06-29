---
id: checkpoint-sync-vNext
title: Checkpoint Sync
sidebar_label: Checkpoint Sync (vNext)
---

# Checkpoint Sync

:::caution Prysm v2.1.3-rc.4

 **This guide uses [Prysm v2.1.3-rc.4](https://github.com/prysmaticlabs/prysm/releases/tag/v2.1.3-rc.4)** and may change significantly as we receive feedback from users like you. Join our [Discord server](https://discord.gg/prysmaticlabs) to share your feedback.

:::

Prysm provides the ability to sync from a finalized checkpoint, as an alternative to replaying all history starting from Genesis. Checkpoint Sync is significantly faster than Genesis Sync, and is considered more secure thanks to the protections against long-range attacks afforded by [Weak Subjectivity](https://blog.ethereum.org/2014/11/25/proof-stake-learned-love-weak-subjectivity/).

Checkpoint Sync begins syncing from the latest finalized `BeaconState`, and the `SignedBeaconBlock` that was integrated into that state. These are obtained by querying a trusted Beacon Node API endpoint. Due to implementation details within Prysm, we also require the genesis state to be provided. This document will explain how to:

- Start a new Beacon Node server that obtains the Checkpoint BeaconState and SignedBeaconBlock over the network.
- Download the Checkpoint BeaconState and SignedBeaconBlock from a Beacon Node API.
- Start a new Beacon Node server with Checkpoint BeaconState and SignedBeaconBlock provided as local ssz-encoded files.

## Checkpoint Sync - via network

The easiest way to initiate Checkpoint Sync is to start your prysm Beacon Node with the `--checkpoint-sync-url` flag set to the Beacon Node API URL of a to a local node that's already synced, or a fully synced remote node that you trust. To also obtain the genesis state from this node, set the `--genesis-beacon-api-url` flag to the same URL.

*note: the [Beacon Node API for retrieving a BeaconState](https://ethereum.github.io/beacon-APIs/#/Debug/getStateV2) is a debug endpoint, so a Prysm Beacon Node API server *providing* the checkpoint state and block must be started with the flags `--enable-debug-rpc-endpoints` and a sufficiently large value for `--grpc-max-msg-size`. States are currently upwards of 40MB in size, so `--grpc-max-msg-size=65568081` should be large enough for the forseeable future. The server *retrieving* the checkpoint state does not need these flags.*

You will need to determine the hostname and port for the other server; the default port for the Prysm Beacon Node API is `3500`. Here's an example `prysm.sh` command to sync from a remote server, using `localhost` as the hostname for the synced Beacon Node:

```bash
$ ./prysm.sh beacon-chain --checkpoint-sync-url=http://localhost:3500 --genesis-beacon-api-url=http://localhost:3500
```

*note: trusted 3rd party API providers can be used for testing purposes.

## Downloading Checkpoint data from the Beacon Node API

`prysmctl` provides a tool for downloading the ssz-encoded BeaconState and SignedBeaconBlock to be used for Checkpoint Sync. This tool can be used to share files without publicly exposing an API endpoint, or by a block explorer or client team who wants to host the files statically as a trusted source.

```bash
$ go run github.com/prysmaticlabs/prysm/cmd/prysmctl checkpoint save --beacon-node-host=http://localhost:3500
INFO[0000] requesting http://localhost:3500/eth/v2/debug/beacon/states/finalized
INFO[0001] detected supported config in remote finalized state, name=prater, fork=altair
INFO[0001] requesting http://localhost:3500/eth/v2/beacon/blocks/0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf
INFO[0001] BeaconState slot=3041920, Block slot=3041920
INFO[0001] BeaconState htr=0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011d, Block state_root=0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011
INFO[0001] BeaconState latest_block_header htr=0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcfd, block htr=0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf
INFO[0001] saved ssz-encoded block to to block_prater_altair_3041920-0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf.ssz
INFO[0001] saved ssz-encoded state to to state_prater_altair_3041920-0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011.ssz
```

For human-friendliness, the file name includes the ssz type (`state`, `block`), the network (`prater`), the fork name (`altair`), the slot (`2397120`) and the state or block root in hex encoding. The checkpoint save command does not download the required genesis state at this time, but this can be easily downloaded via `curl` or `wget` using the `genesis` named state identifier:

```
$ curl -H "Accept: application/octet-stream"  http://localhost:3500/eth/v1/debug/beacon/states/genesis > genesis.ssz
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 28.3M  100 28.3M    0     0  43.3M      0 --:--:-- --:--:-- --:--:-- 43.3M
```

## Checkpoint Sync - via file

Checkpoint sync can also be initiated using files generated through the fully synced beacon node.  Run`prysmctl cpt save` in the current directory for the BeaconState and SignedBeaconBlock files, alongside the `genesis.ssz` genesis state downloaded via curl, and the Weak Subjectivity Checkpoint from `prysmctl cpt latest`; the following command line will initiate checkpoint sync on an unsynced prysm Beacon Node, using the local files and ensuring the Weak Subjectivity Checkpoint is enforced:

```bash
./prysm.sh beacon-chain \
--checkpoint-block=$PWD/block_prater_altair_3041920-0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf.ssz \
--checkpoint-state=$PWD/state_prater_altair_3041920-0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011.ssz \
--genesis-state=$PWD/genesis.ssz
```