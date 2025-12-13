---
id: mainnet-postmortems
title: Mainnet postmortems
sidebar_label: Mainnet postmortems
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

## Mainnet Incident Reports

As part of our day to day job in building eth2 with our Prysm project, we are tasked with maintaining a high integrity cloud deployment that runs several nodes on Ethereum mainnet. Additionally, we are always on call to determine problems which arise in the network and must be addressed by the team. This page outlines a collection of incident reports and their resolutions from catastrophic events on mainnet. We hope it will shed more light on our devops process and how we tackle the hard problems managing a distributed system such as eth2 entails.

### Fusaka Mainnet Prysm Incident

**Date:** 2025/12/04

**Status:** Resolved

**Summary:** Nearly all Prysm nodes experienced a resource exhaustion event when attempting to process certain attestations. During this time, Prysm was unable to provide timely responses to validator requests, resulting in missed blocks and attestations.

**Impact:** The impacted range is considered to be epoch 411439 through 411480. During these 42 epochs, a total of 248 blocks were missing out of 1344 slots. This was an 18.5% missed slot rate.  Network participation was as low as 75% during the incident. Validators missed approximately 382 ETH of attestation rewards.

**Root Causes:** Prysm beacon nodes received attestations from nodes that were possibly out of sync with the network. These attestations referenced a block root from the previous epoch. In order to validate these attestations, Prysm attempted to recreate a beacon state compatible with the out-of-sync node's view of the chain. This resulted in multiple processing of past epoch blocks and expensive epoch transition recomputations. The bug was introduced in [Prysm PR 15965](https://github.com/OffchainLabs/prysm/pull/15965) and deployed to testnets a month before the incident without the trigger happening.


![Prysm beacon node profiling](/assets/postmortem-2025-12-04-img-1.png)

_Figure: Profiling a Prysm beacon node shows epoch processing and validator shuffling as the main bottleneck._

**Trigger:** A specific example is an attestation received in epoch 411442 with a block root of [0xc6e4ff](https://beaconcha.in/slot/0xc6e4ffa3281d5a324215fe553b61eddead92097fbfebe4e85b37a523e8866dc0). Block 0xc6e4ff is slot 13166123 from epoch 411441, and it is the 11th block in the epoch. Prysm replayed 11 state transitions and then several empty state transitions with an epoch transition to validate the attestation. We observed this particular attestation behavior 3927 times in our infrastructure. Some nodes in our infrastructure attempted to process attestations for this checkpoint over 700 times concurrently, which led to the client hitting resource exhaustion limits and untimely responses to validator requests. 

**Resolution**: Users were instructed to use the `--disable-last-epoch-target` flag on their beacon node in v7.0.0. Releases [v7.0.1](https://github.com/OffchainLabs/prysm/releases/tag/v7.0.1) and [v7.1.0](https://github.com/OffchainLabs/prysm/releases/tag/v7.1.0) contain a long-term fix where the recommended flag is no longer necessary. The long-term fix changes the attestation verification logic such that the attestation may be verified using the head state without regenerating a prior state. A flag, `--ignore-unviable-attestations` exists in the new releases, but should not be used. According to the Ethereum Consensus specification, these problematic attestations must be processed and are now correctly using the head state rather than recomputing the state from a prior epoch. Improper use of this new flag could lead to erroneously dropped attestations when the first slot of an epoch is a skipped slot. 

**Detection:** The team received reports from other core developers and end users on all channels that mainnet participation dropped to 75%. Most Prysm users observed low gRPC success rates and high resource usage. The Prometheus metric `replay_blocks_count_countt` increased at an extremely high rate.

**Action Items:**

| Action Item | Type | Issue Link |
|-------------|------|------------|
| Deprecate and rename flag --disable-last-epoch-target. | Pull request | [PR 16094](https://github.com/OffchainLabs/prysm/pull/16094) |
| Use the head state in cases where Prysm was replaying old states unnecessarily. | Pull request | [PR 16095](https://github.com/OffchainLabs/prysm/pull/16095) |
| Move subnet peer log message from WARN level to DEBUG level | Pull request | [PR 16087](https://github.com/OffchainLabs/prysm/pull/16087) | 
| Publish v7.1.0 minor release | Release | [Release v7.1.0](https://github.com/OffchainLabs/prysm/releases/tag/v7.1.0) |
| Publish v7.0.1 minor release | Release | [Release v7.0.1](https://github.com/OffchainLabs/prysm/releases/tag/v7.0.1) |

#### Lessons Learned

**What Went Well**

- Client diversity prevented a noticeable impact on Ethereum users. A client with more than 1/3rd of the network would have caused a temporary loss in finality and more missed blocks. A bug client with more than 2/3rd could finalize an invalid chain.

**What Went Wrong**

- There was a miscommunication about the feature flag. Initially, the team understood that the flag would disable a problematic feature. However, the inverse was true. A new feature was introduced to address the issue, and it was “opt-in,” where users needed to apply the flag for the node to utilize the new feature logic. The original message had the desired outcome, but it was a miscommunication nonetheless.
- As a result, Lighthouse may represent more than 56% of the network (source: [Miga Labs via clientdiversity.org](https://clientdiversity.org/), on December 12, 2025). This is dangerously close to the threshold at which a client bug could finalize an invalid chain.
- The bug was not observed during testing, and therefore, the flag was not enabled by default.

**Favorable Conditions Encountered**

- The workaround was already present in v7.0.0. Prysm did not need to issue an emergency release, and users did not need to download or compile a new version. Adding a flag to their config was the lowest-impact resolution possible.

**Possible Testing**

- Introduce misbehaving nodes into testing environments with a similar scale to mainnet. The issue only manifests in a large state with many validators out of sync.

#### Timeline

2025-12-04 **(all times UTC)**

- ~2:45 - Prysm nodes start having issues.
- 2:50 - Mainnet participation starts dropping to 80%. Blocks are missing from [epoch 411439](https://beaconcha.in/epoch/411439).
- 3:30 - Prysm team receives the first reports about mainnet participation dropping to ~75% and end users reporting their Prysm nodes are “down.” Prysm’s incident response team is activated.
- 3:33 - First public acknowledgement of the issue on [Prysm’s Discord server](https://discord.gg/DnpVzUsU). 
- 4:00 - Prysm team analyzes the issue and begins internal testing of potential fixes.
- 4:20 - Prysm team approves workaround to apply a feature flag `--disable-last-epoch-target` to enable [a new feature to address the issue](https://github.com/OffchainLabs/prysm/pull/15965). This feature is present in v7.0.0, but not enabled by default. 
- 4:34 - Public announcements are made on Prysm’s Discord, X account,  and other channels to communicate the workaround of using ``--disable-last-epoch-target`. Most users report immediate resolution with this flag.
- 4:45 - Mainnet participation is above 80% again during epoch [411457](https://beaconcha.in/epoch/411457).
- 6:00 - Mainnet participation is above 90% again during epoch [411469](https://beaconcha.in/epoch/411469).
- 7:12 - Mainnet participation is above 95% again during epoch [411480](https://beaconcha.in/epoch/411480). The incident is considered mitigated as of epoch 411480. 

#### Supporting information

For more information on this incident, study the chain between epochs 411439 and 411480. Additionally, Potuz has written a more technical write-up, which can be found here: [potuz.net/posts/fulu-bug/](https://potuz.net/posts/fulu-bug/)

