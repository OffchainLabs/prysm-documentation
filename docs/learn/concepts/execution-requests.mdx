---
id: execution-requests
title: Execution Requests
sidebar_label: Execution Requests
---

:::info

Only applicable after the Electra/Prague Hardfork

:::

# Execution Requests

Execution requests are a new feature introduced in the Electra/Prague hard fork. They enable the triggering of consensus operations, such as withdrawals and consolidations, in addition to the existing deposit functionality directly from smart contract calls on the execution layer. Previously, calling Beacon API endpoints on the consensus layer was the only way to access these operations. The execution requests currently supported through [EIP-7685](https://eips.ethereum.org/EIPS/eip-7685) include deposit, withdrawal, and consolidation requests.

## Deposit Requests

Deposit requests enable depositing funds into the Beacon Chain to activate validator keys. This process will continue working the same way as before the Electra/Prague hard fork. The contract address is: [0x00000000219ab540356cbb839cbe05303d7705fa](https://etherscan.io/address/0x00000000219ab540356cbb839cbe05303d7705fa#code). The difference post-hard fork is that once deposit requests begin processing the wait time to see the deposited validator in the activation queue is reduced from over 12 hours to 13 minutes. The deposit contract can be called at the [launch pad](https://launchpad.ethereum.org/en/) or directly through a transaction. 

Read more at [EIP-6110](https://eips.ethereum.org/EIPS/eip-6110).

## Withdrawal Requests

These requests are for withdrawing validator funds from the Beacon Chain to the execution layer. A validator can withdraw their funds by having their withdrawal credentials set to an execution address and have their validator node fully exited. This request allows the execution address to trigger the validator exit process, which was previously only possible through calling the [`/eth/v1/beacon/pool/bls_to_execution_changes` Beacon API endpoint on the consensus layer](https://ethereum.github.io/beacon-APIs/?urls.primaryName=dev#/Beacon/submitPoolBLSToExecutionChange). 

Triggering the withdrawal request is possible by using a system call to the withdrawal request contract with a transaction or using one of the community-provided resources. 

Read more at [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002).

## Consolidation Requests

These are new request types for consolidating validator balances on the Beacon Chain or raising the maximum effective balance of an existing validator. Previously, the max effective balance was 32 `ETH`, and the request allows the validator to increase the max effective balance to 2048 `ETH`. This increase is useful for operators who want to run fewer validator keys on a single validator client while still allowing them to earn scaling staking rewards based on the effective balance. Validators may also want to restake their earnings and earn compounding rewards without redepositing their funds, which is possible through a consolidation request. When the request is processed, the validator's withdrawal credentials will update to a new `COMPOUNDING_WITHDRAWAL_PREFIX`.

Triggering the consolidation request is done by calling the consolidation request contract as a transaction or using one of the community-provided resources.

Read more at [EIP-7251](https://eips.ethereum.org/EIPS/eip-7251).