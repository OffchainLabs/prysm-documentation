---
id: partial-columns
title: Partial messages for data column sidecars in Prysm (Gloas and beyond)
sidebar_label: Partial columns
---

Consensus spec: [ethereum/consensus-specs#4558](https://github.com/ethereum/consensus-specs/pull/4558).

libp2p spec for the partial messages extension: [libp2p/specs — partial-messages.md](https://github.com/libp2p/specs/blob/master/pubsub/gossipsub/partial-messages.md).

## Introduction

For a given block, nodes usually have most of the blobs in their EL mempool (see [this ethresear.ch post](https://ethresear.ch/t/gossipsubs-partial-messages-extension-and-cell-level-dissemination/23017)) because blob transactions propagate through the mempool. Missing EL blobs typically result from private blobs included in a block where the proposer broadcasts the block and data column sidecars but withholds the transaction. As blob counts scale up, mempool/blobpool fragmentation will also cause missing EL blobs.

If a node is missing even a single blob for a given block, it cannot construct any of the data columns it custodies locally, and must wait for every data column sidecar to arrive via beacon node gossip. Nodes also always publish and re-publish full data columns, because there is no mechanism to request only the cells corresponding to the blobs missing from the EL. The result is wasted bandwidth: nodes send and receive full data columns when only a subset of cells is needed.

The proposed solution overlays a request/response protocol on gossipsub. After a node constructs as much of a data column as it can from EL blobs, it explicitly requests the missing cells from peers.

## Fetching individual cells via GetBlobsV3

The existing `GetBlobsV2` Engine API only supports all-or-nothing behaviour when fetching blobs for a given set of versioned
   hashes:

```go 
func (api *ConsensusAPI) GetBlobsV2(hashes []common.Hash) 
([]*engine.BlobAndProofV2, error)

Given an array of blob versioned hashes, 
client software MUST respond with an array of BlobAndProofV2 objects 
with matching versioned hashes, respecting the order of versioned hashes 
in the input array.

Client software MUST return null in case of any missing or older-version blobs.
```                                                                                                                            
                                               
  This means that if even a single blob is missing from the EL's blobpool, the CL gets nothing back and therefore cannot construct any cells for the block locally.
                                                                                                                            
  To support partial data columns, a new `GetBlobsV3` Engine API was introduced. It has the same signature as
  `GetBlobsV2`, except that missing blobs do not cause the entire response to be discarded:
      
```go                                                    
func (api *ConsensusAPI) GetBlobsV3(hashes []common.Hash) 
([]*engine.BlobAndProofV2, error)
                                                                                                                            
GetBlobsV3 returns a set of blobs from the transaction pool. 
Same as GetBlobsV2, except it returns a partial response
when one or more blobs are missing.

For each versioned hash in the input, the EL returns the 
corresponding blob if it has it, or nil in that slot if it does  
not. The positional ordering is preserved.   
```
                                                                                                                            
This API makes Partial Columns possible. The CL can take whichever blobs the EL returned, derive their cells, and construct a Partial Data Column populated only at the positions corresponding to the
  returned blobs. The positions corresponding to nil entries become the cells the node will request from its peers.

## Gossipsub changes for partial messages and dual publish in CL nodes

An overview of the changes made to libp2p gossipsub and the CL node to support propagation of partial messages.

### Gossipsub behaviour

When subscribing to a topic, peers explicitly signal partial message extension support. The resulting behaviour follows these rules:

- A peer that supports sending partial messages on a topic will only send partial messages to peers that request them for that topic. It will never send full messages to those peers.
- A peer that does not support sending partial messages on a topic will only send full messages, even to peers that have requested partial messages.
- A peer that requests partial messages on a topic must still support processing full messages for that topic, as it may not find peers in its mesh that support sending partial messages.
- A peer that supports sending partial messages for a topic must also publish full messages for that topic, as some peers subscribed to the topic may not support partial messages.

### CL node behaviour

#### Nodes that support partial messages

CL nodes that support partial messages for a given topic (currently data column sidecars) use gossipsub's partial messages API to publish partial messages to peers that request them, and the existing gossipsub publish API to publish full messages to peers that do not request partial messages. This applies to both initial broadcast of data column sidecars and forwarding of data column sidecars received via gossip.

This dual-publish model means:

- When a CL node receives a full column for a topic via gossip, it forwards a partial message to peers that support partial messages and a full message to peers that do not.
- When a CL node completes a partial column by obtaining and verifying the missing cells from another peer, it forwards a full message to peers that do not support partial messages and a partial message to peers that do.

![Diagram: CL node that supports partial messages](https://hackmd.io/_uploads/H1grWJ6hZg.png)

#### Nodes that do not support partial messages

CL nodes that do not support partial messages use the existing gossipsub API to publish full messages to all peers, regardless of whether those peers request partial messages. These nodes will never receive partial messages from other peers.

![Diagram: CL node that does not support partial messages](https://hackmd.io/_uploads/Sy6sWkpn-x.png)

## Overview of the partial data column protocol in CL nodes

The gossipsub message format for partial messages is:

```go
type PartialMessagesExtension struct {
    TopicID *string 
    GroupID []byte 
    // An encoded partial message
    PartialMessage []byte 
    // An encoded representation of the parts a peer has and wants.
    PartsMetadata        []byte
}
```

The definitions of `GroupId`, `PartialMessage` and `PartsMetadata` are left to the application layer (the CL node). For data column sidecars, which is currently the only place CL nodes use partial messages, the `GroupId` is the block root and the topic is the specific data column sidecar topic.

The `PartialMessage` bytes are the SSZ encoding of `PartialDataColumnSidecar`, and the `PartsMetadata` bytes are the SSZ encoding of `PartialDataColumnPartsMetadata`:

```go
type PartialDataColumnSidecar struct {
    CellsPresentBitmap bitfield.Bitlist
    PartialColumn      [][]byte
    KzgProofs          [][]byte
    Header             []*PartialDataColumnHeader  // More on this later
}

type PartialDataColumnPartsMetadata struct {
    Available bitfield.Bitlist
    Requests  bitfield.Bitlist
}
```

For a fixed data column, all of these bitmaps have length `len(kzg_commitments)`. Bit `i` refers to the cell/proof for blob commitment `i` within that column.

- `cells_present_bitmap` says which cell positions are actually carried in this particular partial message.
- `partial_column` and `kzg_proofs` are compact arrays containing the full cell or kzg proof value for cells that the peer is missing. The blob index or column offset of the i-th element in these lists corresponds to the position of the i-th set bit in the `cells_present_bitmap`.
- `available` means "I already have these cell positions for this column."
- `requests` means "I want these cell positions from you."

In Prysm, `requests` is always set to all 1s when a node builds its `PartialDataColumnPartsMetadata`, so Prysm is not using `requests` as a fine-grained selector. Instead it uses `available` to advertise what it already has (and implicitly what it does not have), and `requests = 111...111` to mean "send me anything in this column that I am still missing."

Once Prysm has received a peer's `PartsMetadata`, the set of cells it sends to that peer via a gossipsub partial message is:

```
cells_to_send = peer_requests AND my_available AND NOT peer_available
```

The protocol is request/response. Prysm does not eagerly push cells on the first partial RPC. It first advertises its own `PartsMetadata` (eagerly pushed, i.e. sent to peers before any partial column request has been seen from them), waits for the peer's `PartsMetadata`, and then sends the cells selected by the peer's bitmap.

The only exception to this no-eager-push behaviour is when a node is a block proposer. In that case, it eagerly pushes all of its constructed data columns for the block as partial messages to its peers. This reduces the latency of the first hop of data column propagation, so downstream nodes do not pay the RTT cost of requesting cells from the proposer.

On the receive side, Prysm treats an incoming `PartialDataColumnSidecar` as a set of candidate cells for the positions marked in `cells_present_bitmap`. It ignores cells it already has and builds verification bundles for new cells by pairing each received cell/proof with the corresponding KZG commitment for that blob position.

Prysm always verifies KZG proofs for cells received in partial messages before extending a partial column with them. Only after verification succeeds does Prysm extend its partial column and mark those positions as present.

After each successful update to a Partial Column, Prysm checks whether the column is complete. Once every cell position is filled, the partial column is upgraded to a fully verified data column and forwarded to peers as a full message via gossipsub (to peers that do not request partial messages).

The protocol in summary:

1. A node publishes a partial column and advertises what cells it has and which cells it wants.
2. A peer sends back `PartsMetadata` describing what it has and what it wants.
3. The sender computes the diff from the peer's bitmaps and sends only the missing cells.
4. The receiver verifies the cell KZG proofs, updates it's local partial column, and repeats until the column is complete.
5. Once complete, Prysm forwards the verified full data column on the normal gossipsub path and sends peers that support partial messages a more compact PartialMessage with the cells they are missing.

### Example: partial column cell exchange

Assume a data column with 6 blobs. All bitmaps are 6 bits wide, where bit `i` corresponds to the cell/proof for blob commitment `i`.

**Initial state:**
- Node A has cells: `0, 1, 3, 5` → available = `[1,1,0,1,0,1]`
- Node B has cells: `1, 2, 5` → available = `[0,1,1,0,0,1]`

#### Step 1: Node A advertises its PartsMetadata

Node A publishes a partial message containing its available bitmap and sets `requests` to all 1s. No cells are sent yet (we will get into when a node first publishes a partial message in the next section).

```
Node A
├── available: [1, 1, 0, 1, 0, 1]
│                ✅ ✅ ·  ✅ ·  ✅
└── requests:  [1, 1, 1, 1, 1, 1]
```

#### Step 2: Node B responds with its PartsMetadata and A's missing cells

Node B receives A's metadata. It computes the diff to find the cells A is missing that B has, then sends back its own `PartsMetadata` together with those cells in a single partial message.

```
cells_to_send = A.requests AND B.available AND NOT A.available

  A.requests:      [1, 1, 1, 1, 1, 1]
  B.available:     [0, 1, 1, 0, 0, 1]
  NOT A.available: [0, 0, 1, 0, 1, 0]
  ─────────────────────────────────────
  cells_to_send:   [0, 0, 1, 0, 0, 0]   → cell 2
```

Node B sends:

```
Node B → Node A
├── available: [0, 1, 1, 0, 0, 1]
├── requests:  [1, 1, 1, 1, 1, 1]
└── cells:     [·, ·, 🔷, ·, ·, ·]    cell 2
```

Node A verifies the KZG proof for cell 2 and extends its partial column:

```
Node A (before):  [✅, ✅, ·,  ✅, ·, ✅]    available: [1,1,0,1,0,1]
Node A (after):   [✅, ✅, ✅, ✅, ·, ✅]    available: [1,1,1,1,0,1]
```

#### Step 3: Node A computes the diff and sends B's missing cells

Now that Node A has B's `PartsMetadata`, it computes the cells B needs from A.

```
cells_to_send = B.requests AND A.available AND NOT B.available

  B.requests:      [1, 1, 1, 1, 1, 1]
  A.available:     [1, 1, 1, 1, 0, 1]    (updated after step 2)
  NOT B.available: [1, 0, 0, 1, 1, 0]
  ─────────────────────────────────────
  cells_to_send:   [1, 0, 0, 1, 0, 0]   → cells 0, 3
```

Node A sends cells 0 and 3 to Node B as a `PartialDataColumnSidecar`.

#### Step 4: Node B receives and verifies

Node B verifies KZG proofs for cells 0 and 3, then extends its partial column.

```
Node B (before):  [·,  ✅, ✅, ·,  ·, ✅]    available: [0,1,1,0,0,1]
Received:         [🔷, ·,  ·,  🔷, ·, · ]    cells 0, 3
Node B (after):   [✅, ✅, ✅, ✅, ·, ✅]    available: [1,1,1,1,0,1]
```

#### Step 5: Column still incomplete

Both nodes now have cells 0, 1, 2, 3, 5 but are still missing cell 4.

```
Node A:  [✅, ✅, ✅, ✅, ·, ✅]    available: [1,1,1,1,0,1]
Node B:  [✅, ✅, ✅, ✅, ·, ✅]    available: [1,1,1,1,0,1]
                           ↑
                      missing cell 4
```

Both nodes will repeat this exchange with other peers that have cell 4. Once all 6 cells are present, the partial column is upgraded to a full `DataColumnSidecar` and forwarded via normal gossipsub to peers that do not request partial messages.

## When does a node first publish it's partial column and PartsMetadata?

Once a node sends its `PartsMetadata` to a peer, the metadata implicitly acts as a request for cells the node does not yet have, letting the peer send those missing cells back. For this reason, a node must only publish its `PartsMetadata` after it has queried its EL and built a partial column containing whatever cells the EL already has. This ensures the node does not request cells it already possesses locally.

When the partial columns feature is enabled, the CL node queries its EL via the `GetBlobsV3` Engine API. Unlike `GetBlobsV2`, which has all-or-nothing behaviour, `GetBlobsV3` returns whatever blobs are available for the given list of versioned hashes and returns nil for absent blobs. This lets the node construct a partial data column from the cells of whichever blobs are present, and then advertise `PartsMetadata` that implicitly requests the cells corresponding to the missing blobs.

To query the EL for blobs, the CL node needs the KZG commitments for the block. There are three sources:

1. A beacon block received via gossip.
2. A data column sidecar received via gossip.
3. A partial data column header received via the partial messages RPC (more on this in the next section).

On receiving any of these, the CL node extracts the KZG commitments for the block root, requests the corresponding blobs from its EL via `GetBlobsV3`, builds partial data columns for the block using whatever cells it has, and publishes `PartsMetadata` for each column. This simultaneously advertises the node's available cells to peers and implicitly requests the cells it is missing.


![Screenshot 2026-04-16 at 4.37.45 PM](https://hackmd.io/_uploads/rJ8WDr02Zg.png)

## The Partial Data Column Header

The `PartialDataColumnHeader` carries the minimum information a peer needs to identify a block, verify its authenticity, and extract KZG commitments, without requiring the full beacon block body.

```go                              
type PartialDataColumnHeader struct {
    SignedBlockHeader            *SignedBeaconBlockHeader
    KzgCommitments               [][]byte
    KzgCommitmentsInclusionProof [][]byte
}
```

The header is embedded in the `PartialDataColumnSidecar` message as an optional field. It is included in the first partial message a node sends to a peer for a given block root, and omitted from all subsequent messages to that peer.

The header is independently verifiable without the full beacon block body. It is eagerly pushed to a peer along with the node's `PartsMetadata` for the column the first time the node publishes a partial message to that peer for a given block root.

The header is identical across all data column topics for the same block root. To avoid sending it redundantly across topics/data columns for a given block, the header is sent at most once per peer per block root.

This header is particularly important for blocks where the node has not yet received either the beacon block or any full data column sidecar via gossip. The header alone is sufficient to trigger the EL lookup and begin participating in the partial column exchange.

## Changes for Gloas

TBD.
