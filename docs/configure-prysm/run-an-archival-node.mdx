---
id: beacon_node_api
title: Run an archival node
sidebar_label: Run an archival node
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

## Using archival beacon nodes for API retrieval

The beacon chain is the coordinator of Ethereum proof-of-stake. It is responsible for creating new blocks, ensuring their validity, and both rewarding and penalizing participating validators for their actions. This responsibility gives the beacon node full visibility of actions performed on the blockchain, and as such, can be used as a retrospective API in order to query chain information. While this could be considered analogous to log analysis, unlike in log analysis, previous states that have not had full data stored locally for review can be requested, then fetched retrospectively and queried.

By default, the Prysm beacon node saves the state of the chain locally in a database every 2048 slots or 64 epochs. For clarity, a slot is every 12 seconds and 32 slots make an epoch. Hence the beacon node, by default, saves the state on a per 64 epochs basis. Should more detailed information on historical slots be required, these can be requested retrospectively. However, there will be a time delay whilst the data is requested and retrieved. 

:::tip If you wish to shorten the API response delay, we recommend saving the state once per epoch.

Additional storage will be required
In addition to having to download the slot/epoch data there will be an increased local storage requirement, potentially by a multiple of 32 should all data be requested. 

:::

The default setting will store one state per epoch, each being ~ 1Mb (or more) of data, setting the beacon node to capture all slots per epoch will increase the storage requirements to ~ 32Mb (or more) per epoch. 

## Rationale

While the default setting is sufficient for regular beacon chain functionality, it is not optimized for users who query the API multiple times per slot or require historical data not available within the currently saved state. In order to avoid the delays outlined above when retrieving data, the beacon node can be configured to save the state for each slot. **This will significantly improve performance for users creating multiple requests of local beacon nodes.**  

## Beacon chain API information  

Full details of the Ethereum beacon API are available in the [Ethereum public API section](/apis/ethereum-beacon-node-api.mdx). 

## Command line/Configuration file usage:

Setting the beacon node to save the state for each slot can be done both on the command line and through the configuration file as outlined below.  


**Using Linux/MacOS based systems**

```sh
./prysm.sh beacon-chain --slots-per-archive-point=32 
```

**Using Windows based systems**

```sh
prysm.bat beacon-chain --slots-per-archive-point=32
```

**Using the Configuration file:**

If you are running Prysm and specifying command line flags via a configuration file such as `/home/beacon/config.yaml` on Linux or MacOS or `c:\prysm\beacon\config.yaml` on Windows, you can add the following to that file:

```sh
slots-per-archive-point: 32 
```
