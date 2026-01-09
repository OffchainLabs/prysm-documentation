---
id: database-backend-boltdb
title: BoltDB database
sidebar_label: BoltDB database
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

BoltDB is the persistent [key-value store](/terminology#key-value-store) database utilized by the Prysm client. A piece of software that Prysm initially inherited from its origins as a [Geth](https://geth.ethereum.org/) fork was its storage engine, LevelDB. As a simple embedded [key-value store](/terminology#key-value-store) written in Go, LevelDB worked well; however, after observing a number of corruption-related issues, it was decided to survey some other options for the project.

![BoltDB](/images/boltdb.png)

#### Why BoltDB?

There were two main requirements of the new storage engine; it needed to be an embedded environment, and written in Go. After a considerable amount of testing, three options in particular met this criteria as well as performance expectancy: BoltDB, Badger and the old option, LevelDB.

After testing and benchmarking all three options, Bolt was decided upon as the best option for Prysm. Although LevelDB and Badger performed better in write-heavy benchmarks (as expected for an LSM-tree), the difference was not substantial, while BoltDB performed much better on read-heavy benchmarks. Further, though Bolt also consumes more space on disk compared to the other two options, it provides the strongest guarantees against data loss, one of the most crucial goals of the project.

## BoltDB functionality

All database related logic is contained in the `db/` directory of the Prysm repository. Given that BoltDB is a [key-value store](/terminology#key-value-store) backend, 'buckets' (akin to tables in relational databases) are required for data storage. Blocks, transactions, state, proposals and attestations are all defined in these buckets, in what is known as 'bucket data'.

### Example: bucket creation

A user wants to create a new bucket named `myNewStuffBucket` to the database. To perform this action, the bucket data must be added to the template found in `db/schema.go`, like so:

```go
// The Schema will define how to store and retrieve data from the db.
// Currently we store blocks by prefixing `block` to their hash and
// using that as the key to store blocks.
// `block` + hash -> block
//
// We store the crystallized state using the crystallized state lookup key, and
// also the genesis block using the genesis lookup key.
// The canonical head is stored using the canonical head lookup key.

// The fields below define the suffix of keys in the db.
var (
    attestationBucket    = []byte("attestation-bucket")
    blockBucket          = []byte("block-bucket")
    mainChainBucket      = []byte("main-chain-bucket")
    myNewStuffBucket = []byte(“my-new-stuff-bucket”)
    ...
)
```

The newly created bucket is added to the `NewDB` constructor in `db/db.go`, like so:

```go
// NewDB initializes a new DB. If the genesis block and states do not exist, this method creates it.
func NewDB(dirPath string) (*BeaconDB, error) {
    if err := os.MkdirAll(dirPath, 0700); err != nil {
        return nil, err
    }
    datafile := path.Join(dirPath, "beaconchain.db")
    boltDB, err := bolt.Open(datafile, 0600, nil)
    if err != nil {
        return nil, err
    }

    db := &BeaconDB{db: boltDB, DatabasePath: dirPath}

    if err := db.update(func(tx *bolt.Tx) error {
        return createBuckets(tx, myNewStuffBucket, …otherBuckets)

    }); err != nil {
        return nil, err
    }

    return db, err
}
```

