---
id: nodes-networks
title: Nodes and networks
sidebar_label: Nodes and networks
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClientStackPng from '@site/static/images/client-stack.png';
import NetworkPng from '@site/static/images/network.png';
import NetworkLayersPng from '@site/static/images/network-layers.png';

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Ethereum is a decentralized **network** of **nodes** that communicate via peer-to-peer connections. These connections are formed by computers running Ethereum's specialized client software:

<img style={{maxWidth: 461 + 'px'}} src={NetworkPng} /> 


## Nodes

An Ethereum **node** is a running instance of Ethereum's client software. This software is responsible for running the Ethereum blockchain. 

There are two primary types of nodes in Ethereum: **execution nodes** and **beacon nodes**. Colloquially, a "node" refers to an execution node and beacon node working together. Nodes establish connections with other nodes running on other computers, forming a decentralized peer-to-peer network that processes Ethereum blocks and transactions.

When users stake 32 `ETH` to participate in Ethereum's proof-of-stake consensus mechanism, they use a separate piece of software called a **validator client**, which connects to their Prysm beacon node. This is special piece of software that manages validator keys and duties such as producing new blocks and voting on others' proposed blocks. Validator clients connect to the Ethereum network through beacon nodes, which depend on execution nodes:

<br />

<img src={ClientStackPng} /> 

<br />

<table>
    <tbody>
      <tr>
          <th style={{minWidth: 170 + 'px'}}>Component</th> 
          <th>Description</th>
      </tr>
      <tr>
        <td><strong>Ethereum node</strong><br />aka "Node"</td>
        <td>An Ethereum node is an <strong>execution node</strong> and <strong>beacon node</strong> working together. Ethereum nodes communicate peer-to-peer to secure the Ethereum network, and require both <strong>execution-layer client software</strong> and <strong>consensus-layer client software</strong>.</td>
      </tr> 
      <tr>
        <td><strong>Execution node</strong></td>
        <td>Execution nodes use execution client software to process transactions and smart contracts in Ethereum's <strong>execution layer</strong>. Nethermind, Besu, and Go Ethereum (Geth) are examples of execution client software.<br /> <br />An execution node will talk to other execution nodes via peer-to-peer networking, and to a local beacon node.</td>
      </tr>
      <tr>
        <td><strong>Beacon node</strong></td>
        <td>Beacon nodes use beacon node client software to coordinate Ethereum's proof-of-stake consensus. Prysm, Teku, Lighthouse, and Nimbus are consensus clients that contain both beacon node and validator client software. <br /> <br />A beacon node will talk to other beacon nodes via peer-to-peer networking, to a local execution node, and (optionally) to a local validator.</td>
      </tr>
      <tr>
        <td><strong>Validator</strong></td>
        <td>Validator clients are specialized software that let people stake 32 `ETH` as collateral within Ethereum's <strong>consensus layer</strong>. Validators are responsible for proposing blocks within Ethereum's proof-of-stake consensus mechanism, having fully replaced proof-of-work miners after <a href='https://ethereum.org/en/upgrades/merge/'>The Merge</a>. <br /> <br />A validator will talk only to a local beacon node. A validator's beacon node tells the validator what work to do, and broadcasts the validator's work to the Ethereum network as the validator performs its duties.</td>
      </tr>
    </tbody>
</table>


## Networks

The Ethereum network that hosts real-world applications is referred to as **Ethereum Mainnet**. Ethereum Mainnet is the live, **production** instance of Ethereum that mints and manages real Ethereum (`ETH`) and holds **real** monetary value.

There are other live, **test** instances of Ethereum that mint and manage **test** Ethereum. Each test network is compatible with (and only with) its own type of test `ETH`. These test networks let developers, node runners, and validators test new functionality before using real `ETH` on Mainnet.

Every Ethereum network is divided into two layers: **Execution Layer** (EL) and **Consensus Layer** (CL):

<img src={NetworkLayersPng} /> 

<br />

Every Ethereum node contains software for both layers: **execution-layer** client software (like Nethermind, Besu, Geth, and Erigon), and **consensus-layer** client software (like Prysm, Teku, Lighthouse, Nimbus, and Lodestar).

Every network's execution layer works with (and only with) its corresponding "partner" consensus layer. EL-CL network pairs work together to run Ethereum proof-of-stake.

<br />

<table>
    <tr>
        <th style={{minWidth: 160 + 'px'}}>network</th> 
        <th>Description</th>
    </tr>
    <tr>
      <td>Mainnet</td>
      <td>When people refer to Ethereum, they're usually referring to Ethereum Mainnet, which refers to a pair of networks: execution-layer (EL) Mainnet and consensus-layer (CL) Mainnet. CL Mainnet is commonly referred to as the Beacon Chain.<br/><br/>This network pair mints and manages real <strong>ETH</strong>.</td>
    </tr> 
    <tr>
      <td>Sepolia</td>
      <td>Sepolia is a network that was created to smart contract testing. The <a href='/install-prysm/install-with-script'>Prysm Quickstart</a> shows you how to configure a node on Sepolia. Note that this is a permissioned network, so you can run a node on Sepolia, but not a validator.<br/><br/>This network pair mints and manages <strong>Sepolia `ETH`</strong>, a type of testnet `ETH` used exclusively within this network pair.</td>
    </tr>
    <tr>
      <td>Hoodi</td>
      <td>Hoodi the second long-standing, merged-from-genesis, public Ethereum testnet. Hoodi will replace Holešky as a staking, infrastructure and protocol-developer testnet in 2025. For testing decentralized applications, smart contracts, and other EVM functionality, please use Sepolia! <br/><br/> See <a
      href="https://github.com/eth-clients/hoodi">github.com/eth-clients/hoodi</a> for more
      information.</td>
    </tr>
</table>



## Frequently asked questions

#### Can I run an execution node without running a beacon node?
No. Although this is possible pre-Merge, all Ethereum network participants will need to run both an execution node and a beacon node.

#### What happened to miners?
Mining is a proof-of-work consensus mechanism. Ethereum's consensus is now driven by a proof-of-stake mechanism, which replaces miners with validators.

#### Where do slashers come into play?
Slashers, like validators, use specialized pieces of consensus-layer client software to fulfill a critical responsibility for the Ethereum network. Slashers attempt to detect and punish malicious validators. Learn more by reading our [Slasher documentation](/configure-prysm/run-a-slasher.md).

#### How do I get testnet `ETH`?
We recommend using [Paradigm's MultiFaucet](https://faucet.paradigm.xyz/). If that doesn't work, you can ask the community for testnet `ETH` on either the [Prysm Discord server](https://discord.gg/prysm) or on [r/ethstaker](https://www.reddit.com/r/ethstaker).
