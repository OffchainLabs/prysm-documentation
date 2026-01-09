---
id: switch-clients
title: Switch to a new client
sidebar_label: Switch to a new client
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

This document provides guidance on moving from Prysm to a new consensus-layer client like Teku, Lighthouse, or Nimbus.

:::danger Slashing Prevention

The following best practices will help minimize the risk of [slashing](/learn/concepts/slashing.md) while migrating between clients:

1.	Never run more than a single validator process with the same keys loaded.
2.	Maintain and utilize slashing protection.
3.	Accept downtime as part of a successful migration.

::: 


### Step 1: Sync the beacon node

Regardless of which client you are switching to, the first step of the process will be to sync the beacon node. This may take some time to complete. Some clients offer a feature known as "checkpoint sync" which allows you to sync a node within a few minutes. Without this, the process may take several hours to a few days.

Installation documentation links for each client can be found below:

- [Prysm Quickstart](/install-prysm/install-with-script.md)
- [Teku](https://docs.teku.consensys.io/development/get-started/install/install-binaries)
- [Nimbus](https://nimbus.guide/quick-start.html) 
- [Lighthouse](https://lighthouse-book.sigmaprime.io/installation.html)
- [Lodestar](https://chainsafe.github.io/lodestar/run/getting-started/quick-start)

### Step 2: Stop and Disable Prysm

Ensuring you stop and disable Prysm is critical to avoiding slashing events before proceeding further. 

Disabling Prysm prevents it from automatically starting up again after a reboot. 

Remove Prysm's validator keys as an added protection by following [these](/backup-and-migration/migrating-keys.md#step-5--verification-and-restarting-the-validator-client) instructions.  

### Step 3: Export slashing protection history

Ensure that you stop Prysm before exporting slashing protection in order to capture all validator actions. 

We have a section dedicated to exporting and importing slashing protection history [here.](/backup-and-migration/slashing-protection.md) Follow the steps regarding exporting slashing protection history. 

### Step 4: Update port forwarding

This step is not required for nodes which are running on a virtual public cloud, but keep in mind - nodes will be required to run an execution client locally post merge!  

By default, Prysm uses TCP/13000 and UDP/12000. Remove those two rules and replace them with the appropriate port forwards for the client you are switching to. The process will be very similar to the steps laid out [here.](/manage-connections/configure-ports-and-firewalls.md#port-forwarding) 

Teku, Nimbus, and Lighthouse all use port 9000 for both TCP and UDP. 

### Step 5: Import Validator Keys

To minimize slashing risk, wait until at least one full epoch has elapsed between stopping Prysm and importing your validator keys, approximately 6.5 minutes, before proceeding. The inactivity leak cost is negligible compared to the cost of getting slashed.  

Once that amount of time has passed, import your validator keys into the respective validator client you wish to run.  
 
<Tabs
  groupId="importing keys"
  defaultValue="nim"
  values={[
    {label: 'Nimbus', value: 'nim'},
    {label: 'Lighthouse', value: 'lit'},
    {label: 'Teku', value: 'tek'},
    {label: 'Lodestar', value: 'lod'},
  ]
}>

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<TabItem value="nim">

https://nimbus.guide/migration.html#step-3---import-your-validator-keys-into-nimbus

</TabItem>

<TabItem value="lit">

https://lighthouse-book.sigmaprime.io/validator-manager-create.html

</TabItem>

<TabItem value="tek">

https://docs.teku.consensys.io/get-started/connect/mainnet#create-a-password-file-for-each-validator-key

</TabItem>

<TabItem value="lod">

https://chainsafe.github.io/lodestar/run/validator-management/vc-configuration#import-a-validator-keystore-to-lodestar

</TabItem>
</Tabs>

### Step 6: Import Slashing Protection History

Follow your new clients' instructions regarding importing slashing protection history. 

<Tabs
  groupId="importing slashing protection"
  defaultValue="nim"
  values={[
    {label: 'Nimbus', value: 'nim'},
    {label: 'Lighthouse', value: 'lit'},
    {label: 'Teku', value: 'tek'},
    {label: 'Lodestar', value: 'lod'},
  ]
}>



<TabItem value="nim">

https://nimbus.guide/migration.html?highlight=import%20slashing#step-4---import-your-slashing-protection-history

</TabItem>

<TabItem value="lit">

https://lighthouse-book.sigmaprime.io/slashing-protection.html?highlight=import#import-and-export

</TabItem>

<TabItem value="tek">

https://docs.teku.consensys.net/en/stable/HowTo/Prevent-Slashing/

</TabItem>

<TabItem value="lod">

https://chainsafe.github.io/lodestar/run/validator-management/validator-cli#validator-slashing-protection-import

</TabItem>
</Tabs>


### Step 7: Start the New Validator

Ensure your beacon node is fully synced with the network by checking your clients logs prior to starting your validator. Once it is fully synced, start the validator.  

Search a block explorer like https://beaconcha.in with your validator's public key to confirm that your validator is now active!
