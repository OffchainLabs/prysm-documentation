---
id: windows
title: Installing Prysm on Windows
sidebar_label: Windows installation
---

Prysm can be installed locally on Windows systems using Docker. This page includes instructions for performing this process.

**Have questions?** Stop by the [#documentation](https://discord.gg/QQZMCgU) channel on Discord and let us know.

## Dependencies

* A Windows operating system
* The latest release of [Docker](https://docs.docker.com/install/)


## Installing the beacon chain and validator

1. Ensure you are running the most recent version of Docker by issuing the command:

```text
docker -v
```

2. To pull the Prysm images, issue the following commands:

```text
docker pull gcr.io/prysmaticlabs/prysm/validator:latest
docker pull gcr.io/prysmaticlabs/prysm/beacon-chain:latest
```

This process will also install any related dependencies.


   > **NOTICE:** It is recommended to open up port 13000 on your local router to improve connectivity and receive more peers from the network. To do so, navigate to `192.168.0.1` in your browser and login if required. Follow along with the interface to modify your routers firewall settings. When this task is completed, append the parameter`--p2p-host-ip=$(curl -s ident.me)` to your selected beacon startup command presented in this section to use the newly opened port.


## Connecting to the testnet: running a beacon node

Below are instructions for initialising a beacon node and connecting to the public testnet. To further understand the role that the beacon node plays in Prysm, see [this section](https://prysmaticlabs.gitbook.io/prysm/how-prysm-works/overview-technical) of the documentation.


1. You will need to share the local drive you wish to mount to to container \(e.g. C:\).
   1. Enter Docker settings \(right click the tray icon\)
   2. Click 'Shared Drives'
   3. Select a drive to share
   4. Click 'Apply'
2. You will next need to create a directory named `/prysm/` within your selected shared Drive. This folder will be used as a local data directory for [beacon node](../how-prysm-works/prysm-beacon-node) chain data as well as account and keystore information required by the validator. Docker **will not** create this directory if it does not exist already. For the purposes of these instructions, it is assumed that `C:` is your prior-selected shared Drive.
3. To run the beacon node, issue the following command:

```text
docker run -it -v c:/prysm/:/data -p 4000:4000 -p 13000:13000 gcr.io/prysmaticlabs/prysm/beacon-chain:latest --datadir=/data --clear-db
```

It is also recommended to include the `--p2p-host-ip` and `--min-sync-peers 7` flags to improve peering.

  > **NOTICE:** The beacon node must be **completely synced** before attempting to initialise a validator client, otherwise the validator will not be able to complete the deposit and **funds will lost**.


  ## Staking ETH: Running a validator client

  Once your beacon node is up, the chain will be waiting for you to deposit 3.2 Goerli ETH into a [validator deposit contract](how-prysm-works/validator-deposit-contract.md) in order to activate your validator \(discussed in the section below\).

  To begin setting up a validator, follow the instructions found on [prylabs.network](https://prylabs.network) to use the Göerli ETH faucet and make a deposit. For step-by-step assistance with the deposit page, see the [Activating a Validator ](activating-a-validator.md)section of this documentation.

  It will take a while for the nodes in the network to process a deposit. Once the node is active, the validator will immediately begin performing its responsibilities.

  In your validator client, you will be able to frequently see your validator balance as it goes up over time. Note that, should your node ever go offline for a long period, a validator will start gradually losing its deposit until it is removed from the network entirely.

**Congratulations, you are now running Ethereum 2.0 Phase 0!**
