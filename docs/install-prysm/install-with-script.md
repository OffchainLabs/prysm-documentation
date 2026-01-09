---
id: install-with-script
title: Install with script
sidebar_label: Install with script
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClientStackPng from '@site/static/images/client-stack.png';

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

<div className='quickstart'>

import QuickstartIntroPartial from '@site/docs/install-prysm/partials/_quickstart-intro.md';

<QuickstartIntroPartial />

## Step 1: Review prerequisites and best practices

import QuickstartPrereqsPartial from '@site/docs/install-prysm/partials/_quickstart-prereqs.md';

<QuickstartPrereqsPartial />

## Step 2: Install Prysm

<div className='hide-tabs'>

import QuickstartInstallPrysmPartial from '@site/docs/install-prysm/partials/_quickstart-install-prysm.md';

<QuickstartInstallPrysmPartial />

## Step 3: Run an execution client

In this step, you'll install an execution-layer client that Prysm's beacon node will connect to.

import QuickstartRunExecutionNodeJWTPartial from '@site/docs/install-prysm/partials/_quickstart-run-execution-node.md';

<QuickstartRunExecutionNodeJWTPartial />

## Step 4: Run a beacon node using Prysm

import QuickstartRunBeaconNodePartial from '@site/docs/install-prysm/partials/_quickstart-run-beacon-node.md';

<QuickstartRunBeaconNodePartial />


## Step 5: Run a validator using Prysm


import QuickstartRunValidatorPartial from '@site/docs/install-prysm/partials/_quickstart-run-validator.md';

<QuickstartRunValidatorPartial />

</div>

</div>

-------

## Frequently asked questions

#### How long does it take for Geth to transition from `State heal in progress` to fully synced?
This usually takes a few hours if your disk I/O is relatively slow. If it remains in this state for more than a day, your disk might not be able to write data as fast as the chain head advances. The most straightforward way to resolve this is using an SSD.

#### Why do you recommend putting everything on a single machine?
Keeping all of your client software on a single machine keeps things simple, which aligns with our [security best practices](/security-best-practices.md).

#### Can I use Prysm on a Mac M1 ARM chip?
Yes. Choose **one** of the following actions to ensure that Prysm can run on your M1:
 1. Set an environment variable: `export PRYSM_ALLOW_UNVERIFIED_BINARIES=1`. See [Apple's Terminal User Guide: Use environment variables](https://support.apple.com/guide/terminal/use-environment-variables-apd382cc5fa-4f58-4449-b20a-41c53c006f8f/mac) for detailed instructions.
 2. Run Prysm through <a href='https://support.apple.com/en-us/HT211861'>Rosetta</a>. See our <a href='https://github.com/OffchainLabs/prysm/issues/9385'>open bug</a> for more information.

#### Do I need to configure JWT if I'm using IPC instead of HTTP?
No.

#### Do I need to configure my firewall?
We recommend **closing** TCP port `8545` to the internet and keeping TCP and UDP ports `30303` **open** to support other execution nodes.

#### Can you mix and match networks between execution layer and consensus layer?
No. See [Nodes and networks](/learn/concepts/nodes-and-networks.md) for more information.

#### Can I stake with less than 32 `ETH`?
Yes! <a href='https://ethereum.org/en/staking/pools/'>Pooled staking</a> lets you stake with less than 32 `ETH`. 


#### What should I do if I can't run a node using my own hardware?
You can delegate hardware management to <a href='https://ethereum.org/en/staking/saas/'>staking as a service</a> providers.

<!-- **I'm new to Ethereum, and I'm a visual learner. Can you show me how these things work? How much disk space does each node type require?** <br />
The Beginner's Introduction to Prysm uses diagrams to help you visualize Ethereum's architecture, and Prysm's too. (TODO) -->

#### Can I use a light node with Prysm, or do I need to run a full execution node?
No - at this time, a full node is required.

<!-- **I don't have a 2TB SSD, but I have multiple smaller SSDs. Will this work?** <br />
Yes. You can tell your execution client to overflow into a specific drive by (TODO). You can tell your beacon node client to overflow into a specific drive by (TODO). You can tell your validator client to overflow into a specific drive by (TODO). -->

#### Can I use an external SSD connected via USB?
Yes, but your USB connection introduces a possible point of failure. If you do this, avoid connecting your SSD to your computer through a USB hub - instead, connect it directly.

#### Can I use a light client as my local execution client so I don't have to download so much data?
No, a full execution node is needed.

#### Why do I need to run my own execution client?
The Merge introduced a new Engine API that allows consensus-layer clients to communicate with execution-layer clients. Additional information about the merge is available here: <a href='https://ethereum.org/en/roadmap/merge/'>The Merge</a>.
<!--TODO: develop our own knowledge base with conceptual content -->

#### What happens if my execution client goes down? Will I be penalized?
Yes. Downtime penalties are minimal but we recommend having uptime and downtime alerts configured for your execution node, beacon node, and validator if possible.

#### My beacon node is taking a long time to sync. Is there any way I can speed it up?
Yes - you can use [checkpoint sync](/configure-prysm/sync-from-a-checkpoint.md) to start your beacon node's synchronization from a checkpoint rather than from genesis. This is actually a more secure way to run your beacon node.
<!--TODO: explain why -->


#### My proposals aren't working, but my attestations are. What's going on?
This is usually an indication that your validator isn't able to communicate with your beacon node, or your beacon node isn't able to connect to your execution node.

#### How long does it take for my validator to be selected to propose a new block?
At the time of this writing, a ballpark estimate is **around every four months** on mainnet. Every 12 seconds a new block is proposed, and your validator has a one in [total number of active validators] chance of being chosen, so this duration can vary significantly from one validator to the next.

#### If you're getting the error: " Error during Ethereum runner start System.TypeInitializationException: The type initializer for 'Nethermi56k1' threw an exception.---> System.DllNotFoundException: Dll was not found. "
On Windows 10, this should fix the error: "winget install Microsoft.VCRedist.2015+.x64"

<!-- **Can I run a full node and validator client on a Raspberry Pi?** <br />
TODO

**What are withdrawal keys and validator keys?** <br />
TODO: explain in context of this guide -->


