---
id: checkpoint-sync
title: Sync from a checkpoint
sidebar_label: Sync from a checkpoint
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget commaDelimitedContributors="Kasey,James" />

**Checkpoint sync** is a feature that significantly speeds up the initial sync between your beacon node and the Beacon Chain. With checkpoint sync configured, your beacon node will begin syncing from a recently finalized checkpoint instead of syncing from genesis. This can make installations, validator migrations, recoveries, and testnet deployments *way* faster.

To sync from a checkpoint, your Prysm beacon node needs three pieces of information: the latest finalized `BeaconState`, the `SignedBeaconBlock`, and (if you're on a testnet) the genesis state for the network you're using. Together, the `BeaconState` and `SignedBeaconBlock` represent a single **checkpoint state**.

These three pieces of information can be retrieved either via a **network request**, or via **file export/import**. Syncing via network is the method we recommend to most users because it's more straightforward. 

After configuring checkpoint sync, we strongly recommend [verifying the authenticity of your beacon node's checkpoint](#verify-the-authenticity-of-your-beacon-nodes-checkpoint) as a way to "trust but verify" the integrity of your checkpoint data.

## Option 1: Configure checkpoint sync via network request

- Start your Prysm beacon node with the `--checkpoint-sync-url` flag set to a fully synced beacon node's RPC gateway provider endpoint. This endpoint is usually exposed via port `3500`.
- Set the `--genesis-beacon-api-url` flag to the same URL if you want to fetch the genesis state along with the `BeaconState` and `SignedBeaconBlock`. If `--genesis-beacon-api-url` is not explicitly provided, Prysm will automatically use the same URL as `--checkpoint-sync-url`.
- You may also use a public beacon chain checkpoint sync endpoint at your own risk from https://eth-clients.github.io/checkpoint-sync-endpoints/.

The following commands demonstrate how to start a beacon node with checkpoint sync configured to pull checkpoint state from another local beacon node's RPC endpoint using port `3500`. The first example uses only `--checkpoint-sync-url` (Prysm automatically uses the same URL for genesis state), while the second explicitly sets both URLs:

<Tabs groupId="os" defaultValue="others" values={[
    {label: 'Windows', value: 'win'},
    {label: 'Linux, MacOS, Arm64', value: 'others'}
]}>
  <TabItem value="win">

```sh
# Simplified usage: Prysm automatically uses checkpoint-sync-url for genesis state
./prysm.bat beacon-chain --checkpoint-sync-url=http://localhost:3500

# Explicit usage: Manually specify both URLs (same result as above)
./prysm.bat beacon-chain --checkpoint-sync-url=http://localhost:3500 --genesis-beacon-api-url=http://localhost:3500
```
    
  </TabItem>
  <TabItem value="others">

```bash
# Simplified usage: Prysm automatically uses checkpoint-sync-url for genesis state
./prysm.sh beacon-chain --checkpoint-sync-url=http://localhost:3500

# Explicit usage: Manually specify both URLs (same result as above)
./prysm.sh beacon-chain --checkpoint-sync-url=http://localhost:3500 --genesis-beacon-api-url=http://localhost:3500
```

  </TabItem>
</Tabs>

To confirm that checkpoint sync has succeeded, look for the following output:

```sh
level=info msg="requesting <your configured checkpoint sync endpoint>"
```

### Serve checkpoint sync requests

The above instructions tell you how to **request** checkpoint state from another node. If you want to **serve** these requests, run a fully synced node with the following flags:

 - `--enable-debug-rpc-endpoints`: The [Beacon Node API for retrieving a BeaconState](https://ethereum.github.io/beacon-APIs/#/Debug/getStateV2) is a debug endpoint - this flag tells Prysm to enable the endpoint so checkpoint sync requests can be served through your beacon node's RPC gateway provider endpoint.

:::note This is optional

The beacon node *requesting* the checkpoint state from this node doesn't need these flags.

:::

## Option 2 (Advanced): Configure checkpoint sync via file export/import

:::info

`Go` needs to be installed on the machine that hosts your synced beacon node if you use this method. See [go.dev](https://go.dev/) for installation instructions.

:::

When you sync via **network request**, the `BeaconState`, `SignedBeaconBlock`, and genesis state files are delivered from one beacon node to another using a peer-to-peer connection. When you sync via **file export/import**, you manually export these files from one beacon node and import them into another. This can be useful if you don't want your beacon node to expose an RPC gateway provider endpoint. Block explorers and client teams can also host these exported files statically as a trusted checkpoint sync source.

Issue the following commands to export the `BeaconState` and `SignedBeaconBlock` files from a synced beacon node using `prysmctl`. Until `prysmctl` is included in Prysm's binary release package, it is necessary to run it from a local source checkout:

:::info

Installing `prysmctl` via `prysm.sh`, or downloading it from Prysm's GitHub release page, will be possible in an upcoming stable release.

:::

```bash
$ git clone git@github.com:OffchainLabs/prysm.git
Cloning into 'prysm'...
remote: Enumerating objects: 167386, done.
remote: Counting objects: 100% (332/332), done.
remote: Compressing objects: 100% (234/234), done.
remote: Total 167386 (delta 118), reused 220 (delta 93), pack-reused 167054
Receiving objects: 100% (167386/167386), 154.30 MiB | 39.56 MiB/s, done.
Resolving deltas: 100% (127482/127482), done.

$ go run github.com/OffchainLabs/prysm/v3/cmd/prysmctl checkpoint-sync download --beacon-node-host=http://localhost:3500
```

You should see the following output if your export was successful:

```bash
INFO[0000] requesting http://localhost:3500/eth/v3/debug/beacon/states/finalized
INFO[0001] detected supported config in remote finalized state, name=hoodi, fork=electra
INFO[0001] requesting http://localhost:3500/eth/v3/beacon/blocks/0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf
INFO[0001] BeaconState slot=3041920, Block slot=3041920
INFO[0001] BeaconState htr=0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011d, Block state_root=0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011
INFO[0001] BeaconState latest_block_header htr=0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcfd, block htr=0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf
INFO[0001] saved ssz-encoded block to block_hoodi_electra_3041920-0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf.ssz
INFO[0001] saved ssz-encoded state to state_hoodi_electra_3041920-0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011.ssz
```

The two exported `*.ssz` files are your `BeaconState` and `SignedBeaconBlock` files. Their filenames combine their file type (`state`, `block`), the network (`hoodi`), the fork name (`electra`), the slot (`2397120`) and the state or block root in hex encoding. The `checkpoint save` command doesn't export the required genesis state, but the genesis state can be downloaded via `curl` or `wget` using the following command:

```sh
curl -H "Accept: application/octet-stream"  http://localhost:3500/eth/v1/debug/beacon/states/genesis > genesis.ssz
```

You can also just manually download the genesis state from GitHub: [Hoodi](https://github.com/eth-clients/hoodi/blob/main/metadata/genesis.ssz) | [Sepolia](https://github.com/eth-clients/sepolia/blob/main/metadata/genesis.ssz)

Use the following command to start your beacon node with checkpoint sync configured to use this checkpoint state:

<Tabs groupId="os" defaultValue="others" values={[
    {label: 'Windows', value: 'win'},
    {label: 'Linux, MacOS, Arm64', value: 'others'}
]}>
  <TabItem value="win">

```bash
./prysm.bat beacon-chain \
--checkpoint-block=$PWD/block_hoodi_electra_3041920-0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf.ssz \
--checkpoint-state=$PWD/state_hoodi_electra_3041920-0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011.ssz \
--genesis-state=$PWD/genesis.ssz
```
    
  </TabItem>
  <TabItem value="others">

```bash
./prysm.sh beacon-chain \
--checkpoint-block=$PWD/block_hoodi_electra_3041920-0x766bdce4c70b6ee991bd68f8065d73e3990895b1953f6b931baae0502d8cbfcf.ssz \
--checkpoint-state=$PWD/state_hoodi_electra_3041920-0x34ebc10f191706afbbccb0c3c39679632feef0453fe842bda264e432e9e31011.ssz \
--genesis-state=$PWD/genesis.ssz
```

  </TabItem>
</Tabs>



## Verify the authenticity of your beacon node's checkpoint

To verify that the checkpoint state you're using is legitimate, follow these steps after starting your beacon node with checkpoint sync enabled:

1. Navigate to `http://localhost:3500/eth/v1/beacon/headers/finalized` using your browser.
2. Find the `slot` number and `state_root` value.
3. Use a trusted blockchain explorer to verify the `state_root`. To be extra safe, follow this procedure using multiple blockchain explorers. Using `beaconcha.in` as an example, navigate to one of the following pages, replacing `SLOT` with the `slot` you pulled from your browser:
   - **Sepolia**: https://sepolia.beaconcha.in/slot/SLOT
   - **Hoodi**: https://hoodi.beaconcha.in/slot/SLOT
   - **Mainnet**: https://beaconcha.in/slot/SLOT
4. Ensure that the `state_root` reported by the blockchain explorer matches the `state_root` you pulled from your browser. If you don't see a match, feel free to reach out to us on [Discord](https://discord.gg/prysm) and we'll help you troubleshoot.

:::note

There are many blockchain explorers—we recommend doing your own research to identify the latest, most trustworthy services. We've used `beaconcha.in` only as an example, not as a recommendation.

:::

## Frequently asked questions

#### Is checkpoint sync less secure than syncing from genesis?
No. It's actually considered *more* secure thanks to the protections against long-range attacks afforded by [Weak Subjectivity](https://blog.ethereum.org/2014/11/25/proof-stake-learned-love-weak-subjectivity/).

<!--
**How and when are "finalized checkpoints" created?** <br/>
TODO
-->

##### Blob support

Backfill also downloads and stores blob data via DataColumnSidecars, or BlobSidecars for pre-Fulu blocks. Following spec requirements, both types are retained for approximately 18 days (4096 epochs).
The --blob-retention-epochs flag can be used to specify a longer retention period; however, the node will refuse to start up using a value lower than the spec minimum of 4096. Backfill follows the Custody Group Count of the node, which custodies columns roughly proportional to the effective balance of connected validators.

Saved blob data can be requested via the Beacon API method /eth/v1/beacon/blobs/{block_id}.
However, Fulu’s DataColumnSidecars can only reconstruct the data needed for this API if the node has custody of at least 64 columns. Nodes won’t voluntarily custody this many columns by default until the effective balance of connected validators totals 2048 `ETH`. However, you can opt in to custody 64 columns using the --semi-supernode flag, which backfill will also follow. The --supernode flag can also be used to custody all 128 columns, but --semi-supernode is sufficient for blob archival, with lower disk and bandwidth requirements.

##### Blob and data column retention

Prysm retains blobs and data columns for a minimum period to support backfill and serve historical data availability requests:

* **Blob sidecars** (pre-Fulu): Retained for a minimum of 4,096 epochs (approximately 18 days) as specified by MIN_EPOCHS_FOR_BLOB_SIDECARS_REQUESTS
* **Data column sidecars** (post-Fulu): Retained for a minimum of 4,096 epochs as specified by MIN_EPOCHS_FOR_DATA_COLUMN_SIDECARS_REQUESTS

You can extend the retention period beyond the minimum using the `--blob-retention-epochs` flag. The node will exit with an error if you attempt to set a value less than 4,096 epochs. For more details on storage requirements and configuration, see [Blobs](/learn/concepts/blobs.md).

##### Backfill configuration flags

- `--enable-backfill`: Enables backfill for checkpoint synced nodes. Backfill will only be enabled when this flag is specified on a node using checkpoint sync.

- `--backfill-batch-size`: Number of blocks per backfill batch. A larger number will request more blocks from peers at once, but will also consume more system memory to hold batches in memory during processing. This flag interacts multiplicatively with `--backfill-worker-count`. **Default**: 32.

- `--backfill-worker-count`: Number of concurrent backfill batch requests. A larger number will better utilize network resources, up to a system-dependent limit, but will also consume more system memory. This flag interacts multiplicatively with `--backfill-batch-size`. **Default**: 2.

#### Can I use checkpoint sync on any network?
Yes. Checkpoint sync is a network-agnostic feature. You can even use it on local devnets.

#### Can I use checkpoint sync with an existing, partially synced database?
No - checkpoint sync requires a fresh, unused data directory. If you've partially synced in the past you will have to manually delete your directory and start from scratch, or run the beacon node with the `--clear-db` or `--force-clear-db` option.

#### Are there any publicly available, trustworthy checkpoint sync endpoints that I can use?
A [community maintained list](https://eth-clients.github.io/checkpoint-sync-endpoints/) of public Beacon Chain checkpoint sync endpoints is maintained.

Feel free to ask on our [Discord server](https://discord.gg/prysm) if you need help identifying a **Mainnet** checkpoint state provider.

#### Do I need to provide a genesis state when using checkpoint sync on Mainnet?
No. Mainnet's genesis state is embedded within Prysm.

#### Can I use Infura as a checkpoint state provider?
Yes. Note that you can't use Infura as an execution node endpoint provider (as was the case pre-Merge), but you can use it as a checkpoint state provider.

#### I started a beacon node with checkpoint sync enabled. Can I have other nodes pull checkpoint state from this node right away, or do I need to wait for it to become fully synced?
Block and state are immediately finalized upon import, so your first node should be able to serve checkpoint sync requests to other clients without having to wait.

#### Does my execution client need to be fully synced before my beacon node can use checkpoint sync?
Similar to what happens when you sync from genesis, if your execution client isn't fully synced, your beacon node will go into optimistic sync mode. You'll be able to follow the chain, but any validators connected to your beacon node won't be able to propose.

#### How does checkpoint sync relate to weak subjectivity checkpoints?
Prysm offers a `--weak-subjectivity-checkpoint` flag that allows you to specify a weak subjectivity checkpoint. With this flag specified, your beacon node will ensure that it reconstructs a historical chain that matches the checkpoint root at the given epoch. This can offer the same level of weak subjectivity protection that checkpoint sync offers. See [Weak Subjectivity](https://blog.ethereum.org/2014/11/25/proof-stake-learned-love-weak-subjectivity/) to learn more.

#### Where can I learn more about checkpoint sync?

 - [Checkpoint Sync Safety](https://www.symphonious.net/2022/05/21/checkpoint-sync-safety/) by Adrian Sutton
 - [How to: Checkpoint Sync](https://notes.ethereum.org/@launchpad/checkpoint-sync) by members of the Ethereum Foundation
 - [WS sync in practice](https://notes.ethereum.org/@djrtwo/ws-sync-in-practice) by Danny Ryan
 
Special thanks to the authors of *How to: Checkpoint Sync* for providing the endpoints and verification procedure used in this guide.
