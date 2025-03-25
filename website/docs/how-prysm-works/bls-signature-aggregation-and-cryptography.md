---
id: bls-cryptography
title: BLS cryptography
sidebar_label: BLS cryptography
---
import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget commaDelimitedContributors="James" lastVerifiedDateString="April 5th, 2023" lastVerifiedVersionString="v4.0.1" />

A major obstacle for Ethereum in the effort to move into a [Proof-of -Stake](../terminology.md#proof-of-stake-pos) model was verifying cryptographic signatures efficiently enough to reach scalability expectations; for this task, **Boneh-Lynn-Shacham signatures (BLS)** were chosen.

BLS allows for efficient signature aggregation and verification at scale using [Elliptic Curve cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography). It was originally popularized within the tech community by the [Dfinity Project](https://dfinity.org/), whom utilized BLS to create a source of distributed randomness through a mechanism called “threshold relaying”.

The BLS specification used by Ethereum can be found in the [official specifications repository.](https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md#bls-signatures)

## How does it work?

As mentioned, Ethereum uses the BLS signature scheme to facilitate secure cryptography within the protocol. This method allows [validators](../terminology.md#validator) to sign messages, and these resulting signatures are then aggregated and verified at scale. This enables a full [Proof-of-Stake](../terminology.md#proof-of-stake-pos) system with a massive number of [validators](../terminology.md#validator) to function efficiently in production.

Prysm utilizes the [blst library](https://github.com/supranational/blst) for bls signatures.

import {RequestUpdateWidget} from '@site/src/components/RequestUpdateWidget.js';

<RequestUpdateWidget docTitle="BLS cryptography"/>