---
id: individual-validator-monitoring
title: Monitor validators by index
sidebar_label: Monitor validators by index
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Prysm beacon nodes allow for monitoring of specific validator indices by tracking important metrics on the blockchain, including details about their rewards, attestation performance, sync committee participation, and more.

The beacon node takes a flag `--monitor-indices` that takes as parameter a validator index. This flag can be used multiple times. For example, to track validators 1, 2, 12, and 15, you can run with:

```shell
beacon-chain --monitor-indices 1 --monitor-indices 2 --monitor-indices 12 --monitor-indices 15
```
You should see a message like the following in your logs at launch:

```shell
INFO monitor: "Starting service" ValidatorIndices="[1 2 12 15]"
```

You can track any validators, not only yours. In fact, you don't even need to be running a validator client to be able to track validators. So you can keep a staking computer with the beacon node and a validator securely isolated, and use a different computer running a beacon node for performance tracking.

The monitor emits both logs and metrics when it receives information about some event involving the tracked validators.

## Available monitoring

### Attestations included in blocks

This is the log that most users will want to keep track, the typical log reads as follows
```shell
INFO monitor  "Attestation included" BalanceChange=12652 CorrectHead=true CorrectSource=true CorrectTarget=true Head=0x68656c6c6f2d InclusionSlot=9433 NewBalance=32230000000 Slot=9432 Source=0x68656c6c6f2d Target=0x68656c6c6f2d ValidatorIndex=2
```
It informs us that an attestation by validator 2 was included. The balance change between the previous reported balance changing event and this event was 12652 GWei. It also shows the current balance of this validator. This attestation voted correctly and timely for Head, Source and Target. It gives us the leading digits of the hashes for Head, Source and Target blocks. It tells us what is the slot in which this attestation was included (9433) and the slot that the validator attested for (9432). Thus, this attestation had an inclusion distance of 1.

Associated to this event, the monitor emits the following metrics
- `inclusion_slot`: A gauge vector of all the inclusion slots of attestations.
- `timely_head`:  A counter of correctly and timely voted head attestations.
- `timely_target`: A counter of correctly and timely voted target.
- `timely_source`: A counter of correctly and timely voted source.

These metrics are parameterized by validator index, not public key as you may be used to from the validator client metrics.

### Block proposed
In case of a block proposed by a tracked validator the following is logged:

```shell
INFO monitor "Proposed block was included" BalanceChange=120343 BlockRoot=0x68656c6c6f2d NewBalance=323430000000 ParentRoot=0x68656c6c6f2d ProposerIndex=12 Slot=62394 Version=1
```

And associated to this event the monitor emits the metric `proposed_slots_total` which is a counter.

### Slashings
In the event that one of the tracked validators was slashed, the monitor will log as follows for proposer slashings:

```shell
INFO monitor "Proposer slashing was included" ProposerIndex=2 Root1=0xae219327ef71 Root2=0x92120efa2ae3 SlashingSlot=122931 Slot=122942
```

Here `SlashingSlot` indicates the slot in which the proposer had two different blocks proposed. The field  `Slot` is the slot in which the slashing was included.

For attester slashings:
```shell
INFO monitor "Attester slashing was included" AttesterIndex=15 Root1=0x483eaf932ef1 Root2=0x921843eca827 Slot=12042 Slot1=12039 Slot2=11803 SourceEpoch1=367 SourceEpoch2=368 TargetEpoch1=370 TargetEpoch2=369
```
Where we see a surround vote attestation for validator 15 that we are tracking.

### Sync committee contributions
In the case one of the validators enters a sync committee, the following will be logged every slot:

```shell
INFO monitor "Sync committee contribution included" BalanceChange=1293 Contributions=1 ExpectedContrib=2 NewBalance=32122384000 ValidatorIndex=1
```

This validator had two different indices in the committee and only contributed for one.

Also the metric `sync_committee_contributions_total`, which is a counter, is emitted.

### Voluntary exits

Voluntary exits are logged when they are included in a block:
```shell
INFO monitor "Voluntary exit was included" Slot=20112 ValidatorIndex=2
```
And also when they are seen in the P2P network:
```shell
INFO monitor "Voluntary exit was processed" ValidatorIndex=1
```

### Attestations in the P2P network

The monitor logs events caught in the P2P network that not necessarily will be included in blocks. When one of our tracked validators is an aggregator:
```shell
INFO monitor "Processed attestation aggregation" AggregatorIndex=2 BeaconBlockRoot=0x68656c6c6f2d Slot=1 SourceRoot=0x68656c6c6f2d TargetRoot=0x68656c6c6f2d
```
The following logs are emitted when an attestation by a tracked validator is seen in the P2P network, both in aggregated or unaggregated form:
```shell
INFO monitor "Processed aggregated attestation" Head=0x68656c6c6f2d Slot=11293 Source=0x68656c6c6f2d Target=0x68656c6c6f2d ValidatorIndex=2
```
```shell
INFO monitor "Processed unaggregated attestation" Head=0x68656c6c6f2d Slot=12123 Source=0x68656c6c6f2d Target=0x68656c6c6f2d ValidatorIndex=12
```
The above logs are quite verbose as typically the same aggregation is seen about eight times per slot.

### Aggregated logs

In addition to the above logs, the monitor emits aggregated logs every five epochs:
```shell
INFO monitor "Aggregated performance since launch" AttestationInclusion="80.00%" AverageInclusionDistance=1.2 BalanceChangePct="0.95%" CorrectlyVotedHeadPct="66.67%" CorrectlyVotedSourcePct="91.67%" CorrectlyVotedTargetPct="100.00%" StartBalance=31700000000 StartEpoch=0 TotalAggregations=0 TotalProposedBlocks=1 TotalRequested=15 TotalSyncContributions=0 ValidatorIndex=1
```
The field `AttestationInclusion` reports the percentage of attestations that have been included divided by the number of epochs since launch. The field `AverageInclusionDistance` only counts those attestations that have been included. So do the other fields that are percentages of the included attestations.

### A remark on BalanceChange

The validator monitor does not keep a history of performance, it only tracks the *latest event* and keeps an aggregated total of performance. The *balance changing events* are attestation inclusion, proposed blocks inclusion and sync committee inclusion. When the monitor reports a field `BalanceChange` it means the difference between the balance right after processing the block that triggered the event, and the balance after the previous balance changing event. In particular, when an attestation is included the balance is not changed by the included attestation since attestation reward is given at epoch transition. Therefore the balance change reported, assuming no other events like sync committee contributions and block proposals were reported during the epoch, refers to the reward given by the *previous* attestation. 

