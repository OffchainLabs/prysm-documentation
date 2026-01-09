---
id: terminology
title: Glossary
sidebar_label: Glossary
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

This page houses definitions to the various technical terms found throughout this documentation portal. See a word or phrase that should be here? Let us know!

#### Attestation \(attest\) <a id="attest"></a>
The process of voting on the validity of newly created blocks on the beacon chain.

#### Beacon chain
The Beacon Chain maintains the network's state and manages the validators involved in the consensus process. It oversees the shard chains of Ethereum, which operate in parallel to the main chain, providing a more efficient and decentralized system.

#### Beacon node
Beacon nodes use beacon node client software to coordinate Ethereum's proof-of-stake consensus. A beacon node will talk to other beacon nodes via peer-to-peer networking, to a local execution node, and (optionally) to a local validator.

#### BLS key
Your validators use a key format known as [BLS](/learn/dev-concepts/bls-cryptography.md), which is used exclusively for staking. Validators have four kinds of BLS keys: validator public key, validator private key, withdrawal public key, and withdrawal private key. only the validator public key can be viewed on staking explorers such as [https://beaconcha.in](https://beaconcha.in), and private keys, which are secret, are used for signing. Not to be confused with an Ethereum address. The validator mnemonic can be used to access all 4 keys which are important for setting the Ethereum address for withdrawing.

#### BLS to Execution Change
In order to withdraw your validator, Ethereum needs to associate an **Ethereum execution address** with your validator’s **keys**. Underneath the hood, submitting a bls-to-execution-change (withdrawal) request updates the [withdrawal credentials](https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/validator.md#withdrawal-credentials) which tells Ethereum “I want to withdraw my validator balance to this specific Ethereum address”. When you see the terms BLS to Execution or bls_to_exec used, it refers to this action. **note:** withdrawal request and bls-to-execution-change are used interchangeably.

#### Canonical head block
The latest block to be proposed on a blockchain.

#### Consensus
A protocol that governs how to choose validators to propose or validate blocks and process transactions. In cases where multiple blocks are at the head of the chain, a fork-choice mechanism selects the "heaviest" chain based on the number of validators voting for the blocks, weighted by the amount of staked ether.

#### Checkpoint
An endpoint, specific to the Consensus layer, that can include state and verification of the Ethereum blockchain. It allows syncing a node to be faster and takes less space than syncing from genesis.

#### Consensus layer
The consensus client, or Beacon Node, implements the proof-of-stake algorithm, allowing the network to reach agreement based on verified data from the execution client. A validator can also be added to the client, enabling a node to help secure the network.

It works together with the [Execution layer](#execution-layer) to track the head of the Ethereum blockchain and allow user interaction with the network.

#### ETH1
A deprecated term that historically referred to Ethereum's execution layer before The Merge.

#### Ethereum execution address
Referred to also as an Ethereum address, this is a standard address to an Ethereum account which you can view in block explorers such as Etherscan. Your validator’s balance, upon a full withdrawal, will be available at an Ethereum address of your choosing.

#### Execution layer
The execution client, also referred to as the Execution Engine or EL client, listens for new transactions on the network, executes them in the Ethereum Virtual Machine (EVM), and maintains the latest state of Ethereum data.

It works together with the [Consensus layer](#consensus-layer) to track the head of the Ethereum blockchain and allow user interaction with the network.

#### Execution node
Execution nodes use execution client software to process transactions and smart contracts in Ethereum's execution layer. An execution node will talk to other execution nodes via peer-to-peer networking, and to a local beacon node.

#### Fork choice rule
A function evaluated by the client that takes, as input, the set of blocks and other messages that have been produced, and outputs to the client what the 'canonical chain' is.

#### Full validator withdrawal
The process of withdrawing your entire stake on Ethereum, exiting your validator, and withdrawing your entire balance to an Ethereum address of your choosing. Full validator withdrawals need a validator to exit first, which can take time depending on how large the exit queue is. Performing a full withdrawal requires submitting a voluntary exit first.

#### HD wallet mnemonic
Refer to [Validator mnemonic](#validator-mnemonic].

#### JWT token
JSON Web Token (JWT) is an industry-standard method for decoding, verifying, and generating tokens that securely represent claims between two parties. It serves as a reliable and effective solution for ensuring secure communication (between the Execution and Consensus layers).

#### Key-value store
A data storage paradigm designed for storing, retrieving, and managing hash tables.

#### Partial validator withdrawal
The process of withdrawing your validator’s **earnings** only. That is, if you're staking 33.3 `ETH`, you can withdraw 1.3 `ETH` using a partial withdrawal. Your validator does **not** need to exit, and you will continue to validate normally. Partial withdrawals do not go through an exit queue, but will only be processed at a maximum of 16 validators at a time per block.

#### Proof-of-Stake \(PoS\)
The PoS concept states that a person can mine or validate block transactions according to how many coins they hold. This is a vastly improved iteration on Proof-of-Work \(PoW\), which relies on immense amounts of computational power to advance the state of the blockchain.

#### Proposal \(propose\) <a id="propose"></a>
The process of creating and adding new blocks to the beacon chain.

#### Pool
Upon submission of a validator exit request or bls-to-execution-change request, the message will sit in a special place in memory ( the pool ) to be broadcasted across your peers. Since only the block proposers can include these requests and there is a limit to the number of requests included per block, sometimes if the pool becomes too full your message may be dropped and not included. If this happens, a re-submission of the request may be required.

#### Slasher
A slasher is software that detects slashable events from validators and reports them to the protocol, acting as the network's "police." Running a slasher is optional. It records the proposing and attesting history for each validator and cross-references this with broadcast messages to identify incidents, such as double blocks or conflicting votes.

#### Staker
The person or entity managing Ethereum validators.

#### Validator
Most often refers to a [validator client](#validator-client) instance, but can also refer to an individual that is physically managing a validator client, or the key used for staking.

#### Validator client
Allows users running the software to stake `ETH`, propose and validate new blocks, earn staking rewards, and staking tips.

#### Validator index
A unique numeric ID assigned to a validator when activated. You can see this validator index in your Prysm validator client logs, or in block explorers such as [https://beaconcha.in](https://beaconcha.in) and [https://beaconscan.com](https://beaconscan.com) by looking it up using your public key. You will need to know the validator indices of the validators you wish to withdraw through this guide. Only activated validators can begin the exit and withdrawal processes.

#### Validator mnemonic
A mnemonic in this context is the 24 word secret that you received upon creating your validator(s), which is the ultimate credential that gives you access to withdrawing your validator(s). For many, this was generated when they first interacted with the Ethereum staking CLI to prepare their validator deposits. We will refer to this as your validator mnemonic throughout this document

#### Validator seed phrase
Refer to [Validator mnemonic](#validator-mnemonic].

#### Validator withdrawal credentials
Each validator has data known as “withdrawal credentials” which can be fetched from your beacon node or from a block explorer such as [https://beaconcha.in](https://beaconcha.in) or [https://beaconscan.com](https://beaconscan.com) by looking at the “deposits” tab and seeing your credentials there. You will need these for this guide.

#### Voluntary exit
Validators that are currently active on Ethereum can choose to **exit** the network, marking them as exited and exempting them from any staking responsibilities. In order to **withdraw** a validator’s balance completely, a voluntary exit must be submitted to Ethereum and must complete first.
