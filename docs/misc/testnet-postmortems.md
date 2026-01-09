---
id: testnet-postmortems
title: Testnet postmortems
sidebar_label: Testnet postmortems
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

## Testnet Incident Reports

As part of our day to day job in building eth2 with our Prysm project, we are tasked with maintaining a high integrity cloud deployment that runs several nodes in our testnet. Additionally, we are always on call to determine problems which arise in the network and must be addressed by the team. This page outlines a collection of incident reports and their resolutions from catastrophic events in our testnet. We hope it will shed more light on our devops process and how we tackle the hard problems managing a distributed system such as eth2 entails.

### Incorrect deposit contract configurations for GETH, Besu, and Nethermind clients (Incident #8)

**Date:** 2025/02/24

**Authors:** James

**Status:** Root cause identified, Resolved, Network still recovering and will be superseded by Hoodi testnet

**Network:** Holesky

**Summary:** Shortly after the Holesky Testnet Hardfork on February 24, 2025, at 21:55 UTC (4:55 p.m. ET) things went south with a fork in the chain. At first it appeared that Reth and Erigon forked off with 70% of the network on another chain, but 3 clients (Geth, Nethermind, Besu) started getting stuck on block 3419724. This resulted from the 3 client teams having incorrect deposit contract addresses (specific for Holesky and affected by the Pectra hardfork). The EL clients released patches, but the bad majority chain already got justified. Prysm Team worked to stabilize our Holesky nodes by creating a hacked branch to maintain liveliness on the minor correct chain. There was a discovery of several issues in the Prysm node caused by the changes in the hard fork that are later described in this document. Eventually we were able to have Holesky finalize on the correct chain but validators that should be slashed are not yet slashed and other validators continue to exit. It will take several weeks (at least 18 days) for validators to be ejected and plans for a future testnet are being discussed as large protocols will need time to redeploy and test Holesky changes around staking.  

**Reference issues:**
- https://github.com/ethereum/go-ethereum/pull/31247
- https://github.com/NethermindEth/nethermind/pull/8265
- https://github.com/hyperledger/besu/pull/8346

**Impact:** Holesky was down for roughly 2 weeks. We were able to test our clients dealing with long non-finality and some key design decisions should be discussed as well as disaster recovery plans for the future. Pectra testnet testing for most CL features was pushed back several weeks as we try to recover. Hoodi, a replacement testnet, is being spun up.
some statistics
- since slot 3710963 we've had roughly 56k validators slashed. Not all of these are caused by the recovery process, but most are related to the incident. This number is smaller than the expected number of slashed validators, so validators should be slashed retroactively.
- an exit queue of about 1M validators.
- some operators are choosing to move to hoodi resulting in more missed slots.
- network is still finalizing with ~78% of the network.
- 32617 validators have exited slashed statuses and 2341 validators have exited non-slashed statuses.

**Detection:** Reviewing Dora interface tracking the chain and seeing the forked chain. Initially thought as a minority client (Reth,Erigon) issue but then realized it was a majority client (Geth, Nethermind, Besu) issue.

**Root Causes:** The 3 leading execution layer clients (Geth, Nethermind, Besu) had incorrect deposit contract addresses (specific for Holesky and affected by the Pectra hardfork). This resulted in a justified epoch on a bad majority chain.
Other issues were discovered in the Prysm node as a result of the non finalization period.

**Trigger:** The Pectra hardfork

**Resolution:** 
- creating a [hacked branch](https://github.com/OffchainLabs/prysm/compare/develop...hackSync) to maintain liveliness on the minor correct chain
- coordinate validators to point to synced notes on the correct minority chain to finalize on the correct chain.
- slash violating validators that voted on both the bad majority chain and the correct minority chain, and exit them.
- add new deposits to stablize and recover the network.
- create a new Testnet called Hoodi to continue to test the hardfork for major protocols like Lido.
- 

#### Where we got lucky
- Slashers couldn’t keep up and slash all violating validators so it allowed us to continue increasing participation with validators that should have been slashed over several days to finally finalize Holesky. This should have saved us some time overall.

#### Timeline

2025-02-24 (all times UTC)
- 21:55:00 Holesky executed the Pectra hardfork.
- 22:30:00 Prysm Team starts looking into possible issues after Roman from the Reth team discovered `the hash you and we compute is 0x40a656c88b9ceb7d6251adc8819228a98ae26511faa246cb88004ca402a9f642
the hash on dora is 0x46028626ebfc941c6077f0bf972e938eea74ec1478ebb03e3aa4437cd0ed9b25`.
- 22:56:00 Stokes confirms hash and suggests it's an EL bug not a CL bug.
- 23:00:00 Georgios from Reth confirms the 3 clients (Geth, Nethermind, Besu) have incorrect deposit contract addresses (specific for Holesky and affected by the Pectra hardfork).

2025-02-25 (all times UTC)
- 00:24:00 Patches are released for Geth, Nethermind, Besu and Prysm team updates Holesky Prysm nodes.
- 01:19:00 Prysm nodes are stuck on sync so we try to wipe EL DBs; This turns out to be a big mistake later on causing issues with resyncIfBehind() because we have no anchor to determine the correct minority fork. We already have justified the epoch on the bad majority chain.
- 14:29:00 Potuz tries to fix our syncing issue by manually blacklisting the bad block in a [hacked branch](https://github.com/OffchainLabs/prysm/commit/34a68715b857dca4aad0c696e2864d4896ea7916) 
- 15:54:00 Roman asks clients to update ENR based on marek from Nethermind's hackmd.
- 18:29:00 Emergency war room meeting among core devs to discuss the issue, discussions on using https://ethpandaops.io/data/snapshots/ to help with syncing.
- 21:54:00 Prysm nodes are still unhealthy, and Preston suggests to write last snapshot so we don't keep redownloading every time on container init.

2025-02-26 (all times UTC)
- 03:47:00 Roman starts collecting information on who has validators on Holesky to coordinate attestations and proposals while nodes are syncing.
- 07:12:00 Nishant fixes an Electra attester slashing bug in Prysm.
- 18:02:00 Terence announces Prysm nodes rejoining Holesky.

2025-02-27 (all times UTC)
- 00:18:00 pk910 announces a pectra devnet 7 with 1M validators as a temporary replacement of Holesky.
- 11:00:00 Lodestar and Lighthouse announce fixes to OOM issues in their clients.
- 14:00:00 ACD begins and discusses efforts on saving the network, Potuz proposes a coordinated effort to hail marry a finalized checkpoint on the minority chain set for the next day. Validators who participate in this will most likely be slashed due to double voting. Remaining time is spent syncing more Prysm nodes and validating the steps to remove slashing protection.

2025-02-28 (all times UTC)
- 15:00:00 The coordinated client effort to finalize the chain begins, but miss the needed amount reaching only 53%. Prysm has a bug with deleting unaggregated attestations and the pool keeps growing. We add a commit to the hacked branch to avoid this situation. The rest of the day is spent trying to sync Prysm nodes but without much success.

2025-03-01 (all times UTC)
- 13:00:00 Nishant attempts to add Potuz's sync from head to the hacked branch
Because the Holesky issue couldn’t happen on Sepolia, focus shifts to Sepolia while we maintain liveliness on Holesky and continue to get validators propose. Sepolia suffers a bug that’s different from Holesky and will not be added to this timeline.

2025-03-10 (all times UTC)
- 14:00:00 Attempts to point Prysm VCs to other beacon nodes fail due to different interpretations of the eth/v1/beacon/states/head/validators endpoint. The validators appear stuck under unknown status because Lighthouse nodes don’t return any validators when an empty list of validator statuses are provided. The performance still isn’t great because of getDuties design.
- 15:10:00 We finally gather enough validator participation and avoid slashing to finalize the Holesky chain.

#### What went wrong
- 3 execution clients had the wrong deposit contract for the Holesky testnet resulting in a wrong majority chain.
- The wrong majority chain justified making it more difficult to recover.
- Ran into disk space issues with pod allocations.
- Had to add hacks in Prysm to reject bad block manually and prevent resyncs.
- We had trouble getting good peers so we manually added a rejection of the bad block on rpc sync as well as updated our bootstrap nodes’ ENRs for good boot nodes.
- Optimistic syncing makes it difficult to sync to the right minority chain, but the EL snap syncing requires the CL to optimistically sync. At one point we had 8 Prysm nodes synced to tip but all the ELs were in optimistic status and therefore not yet usable…
- Random restarts in our infrastructure affected our liveliness stability strategy and set us back. There doesn’t seem to be a good way to avoid this with kubernetes pods. 
- We had an issue with handling attester slashings and failing gossip validation.
- Even with attester slashing fix the CPU kept blowing up when processing slashings.
- We had more difficulties syncing because our architecture has difficulty handling periods of 2000+ empty blocks.
- Uncovered old GetDuties REST API bug - calling the committees endpoint blows up the performance. 
- We ran into an issue with unaggregated attestations not deleting correctly and our pool blowing up.
- Slashers weren't keeping up with slashing the violating validators.


### Not Receiving P2P Blocks (Incident #7)

**Date:** 2020/04/18

**Authors:** Preston, Raul

**Status:** Root cause identified, resolved

**Network:** Topaz

**Summary:** Beacon nodes were not receiving blocks via gossipsub p2p at all, making it impossible to keep up with the chain head after initial sync completes. 

**Reference issues:**
https://github.com/OffchainLabs/prysm/issues/5476
https://github.com/OffchainLabs/prysm/issues/5491

**Impact:** This incident was reproducible on most node restarts, making it likely to kill our testnet if left unchecked. 

**Root Causes:** There was a race condition from the sync service needing access to the genesis time to compute a fork digest for subscribing to gossipsub topics. This value is set in the p2p service, but sometimes sync would begin before the p2p service, leading it to have a genesis time of 0.

**Trigger:** Performing beacon node restarts could easily reproduce this issue.

**Resolution:** We resolve the race condition by not making sync rely on p2p to set its ForkDigest, but instead get the genesis time directly from the blockchain service and refactoring ForkDigest to be a pure stateless function.

**Detection:** Local runs, user reports.

#### Where we got lucky
- Our pods haven’t had any rolling restarts or canaries rolling out that would trigger this issue, which is reproducible many times upon starting a beacon node. If our pods restarted, our testnet could have likely been killed and have had multiple forks.

#### Root Cause

Regular sync topic subscription was using a `forkDigest` of zero due to a race condition where the p2p service’s genesis time and genesis validator root was not yet initialized.

Preston realized he would see weird subscribed topics in his local node’s p2p metrics:

```
p2p_topic_peer_count{topic="/eth2/00000000/attester_slashing/ssz_snappy"} 0
p2p_topic_peer_count{topic="/eth2/00000000/beacon_aggregate_and_proof/ssz_snappy"} 0
p2p_topic_peer_count{topic="/eth2/00000000/beacon_block/ssz_snappy"} 0
p2p_topic_peer_count{topic="/eth2/00000000/proposer_slashing/ssz_snappy"} 0
p2p_topic_peer_count{topic="/eth2/00000000/voluntary_exit/ssz_snappy"} 0
p2p_topic_peer_count{topic="/eth2/f071c66c/attester_slashing/ssz_snappy"} 3
p2p_topic_peer_count{topic="/eth2/f071c66c/beacon_aggregate_and_proof/ssz_snappy"} 3
p2p_topic_peer_count{topic="/eth2/f071c66c/beacon_block/ssz_snappy"} 2
p2p_topic_peer_count{topic="/eth2/f071c66c/proposer_slashing/ssz_snappy"} 3
p2p_topic_peer_count{topic="/eth2/f071c66c/voluntary_exit/ssz_snappy"} 3
```

Showing duplicate values for various topics, where the 00000000 and f071c66c are the fork digests for the node. The 0 value was problematic, likely showing the sync service was started with a genesis time of 0. Preston then identified: 

#### Timeline

2020-04-16 (all times UTC)
- 02:00:00 Terence reports his nodes are not getting blocks via the gossip network in local chain testing, he mentions it doesn’t occur all the time and we put the issue on the backburner.

2020-04-18 (all times UTC)
- 08:02:00 Preston mentions he observes fork ENR mismatches in peer connections, Raul dismisses it as likely just a bootnode failure, and Preston also observes his local node isn’t receiving any blocks via gossip sub p2p
- 22:16:00 Preston tries to discover a potential race condition by making the p2p.ForkDigest() function return an error if p2p.genesisTime is not set, which ended up panicking right away, giving us a clue
- 22:30:00 Raul mentions there are two places where the state initialized feed fires, and they are not likely to have bugs. This feed is what notifies other services in Prysm of the genesis time and the genesis validators root, two critical values to compute a small hex digest used for subscribing to gossipsub topics.
- 22:33:00 Preston confirms the sync genesis time value is set to 0, and that we are likely subscribing to wrong gossip topics
- 22:35:00 Nishant mentions: “so sync needs to wait after p2p is initialized seems like sync and p2p start at the same time which is our main problem”
- 22:36:00 Preston reports the ForkDigest method does not need to be a pointer receiver of the p2p service, but can instead be a pure helper function that services can fill in with canonical values from the blockchain service, preventing any potential race conditions
- 22:39:00 Preston reports the issue is now resolved in his local node after seeing the beacon block p2p received metrics go up p2p_message_received_total{topic="/eth2/f071c66c/beacon_block/ssz_snappy"} 19 

### Chain Stuck at Genesis (Incident #6)

**Date:** 2019/01/09

**Authors:** Raul, Terence, Preston

**Status:** Solved - root cause identified: https://github.com/OffchainLabs/prysm/issues/4526#issuecomment-573828747

**Summary:** No one was able to propose a block after genesis time was reached with the mainnet config in our running testnet, required manual intervention.

**Impact:** 216 skip slots after genesis. Over 30 minutes of downtime.

**Root Causes:** Genesis block has a state root that does not match the genesis state. Still investigating other root causes.

**Trigger:** Genesis time was reached.

**Resolution:** Use database headBlock rather than cached head block with a fresh database. PR 4473 was deployed as a hotfix in production.

**Detection:** DevOps observation, alerts, user reports.

#### Where we got lucky
- Minio took a backup exactly at genesis time, so we have a backup copy of the problem beacondb.

#### Root Cause

The problem had to do with usage of both `go-ssz.HashTreeRoot` and `stateutil.HashTreeRootState` in Prysm for the genesis state. Explanation outlined here: https://github.com/OffchainLabs/prysm/issues/4526#issuecomment-573828747

#### Timeline

2019-01-09 (all times UTC)
- 8 prod nodes are online several hours before genesis time.

2019-01-10
- 00:00:00 Genesis time was reached.
- 00:00:00 Minio backup occurs. Link
- 00:00:16 Slot 1 passed, no block produced. 
- 00:04:00 Preston observes logs that fail GetBlock RPC across all validators. "Could not compute state root: could not calculate state root at slot 0: could not process block: could not process block header: parent root 0x0e6c95db700881611523e282ec3fcaeeace681786aa47928c5903650165c6165 does not match the latest block header signing root in state 0x8b25301bdeba020d4226e949eae0ecefb8863e060b7844566d51e0a42ed6490e"
- 00:08:00 Preston restarts prod-7 and shifts all traffic there. The idea was to clear any cache value that existed before genesis start. This attempt was unsuccessful at resolving the issue.
- 00:15:00 All hands on deck called.
- 00:21:00 Preston deploys a hotfix. (See supporting info)
- 00:31:00 Preston shifts all traffic to prod-7, which has the hotfix. This attempt is unsuccessful.
- 00:33:00 Preston wipes the DB of prod-6 and restarts prod-6.
- 00:43:00 Preston shifts all traffic to prod-6. Blocks are starting to be produced. 
- 00:46:00 Preston wipes all other prod databases and restarts. Prod-6 still only one serving traffic.
- 00:48:00 Ivan communicates to users to wipe their database and restart their nodes to sync.
- 00:55:00 Nodes cannot sync with --init-sync-state-cache, a nil state is attempted to be saved in the database.
- 00:58:00 Finality is reached.
- 01:10:00 Preston scales prod nodes to 10 and reverts the problem flag. This is to prevent prod-6 from getting killed if prod-7 reports healthy prematurely.
- 01:20:00 Preston unshifts traffic from prod-6. All healthy prod pods are serving traffic now with high gRPC success rate.
- 16:18:00 Preston inspects the backup database to observe that the genesis state was equal to a genesis state from running prod pod.
- 16:29:00 Preston inspects the backup database to observe that the genesis block state root does not match the genesis state. In the problem database, genesis block state root is 0x5a45fd74d5359fb113ec5eaa8614b652aa4ef13493b1ff9439ac7bdadaed224a and genesis state root is 0x710178cf469dcd70bb1c97630205399d26e8f0913659bb591ec9c0c1ab734f1e and the hash tree root of the problem genesis block is 0x0e6c95db700881611523e282ec3fcaeeace681786aa47928c5903650165c6165. 
- 17:10:00 After further investigation between a healthy DB and one that was in the incident, Raul finds the genesis states in the DB match, but the genesis blocks mismatch due to state root problems. This is scary as it does not make much sense with our codebase.

#### Supporting information
The hotfix that was applied:

```
diff --git a/beacon-chain/rpc/validator/proposer.go b/beacon-chain/rpc/validator/proposer.go
index 220e7efd5..46092bd73 100644
--- a/beacon-chain/rpc/validator/proposer.go
+++ b/beacon-chain/rpc/validator/proposer.go
@@ -36,7 +36,11 @@ func (vs *Server) GetBlock(ctx context.Context, req *ethpb.BlockRequest) (*ethpb
        }

        // Retrieve the parent block as the current head of the canonical chain.
-       parent := vs.HeadFetcher.HeadBlock()
+//     parent := vs.HeadFetcher.HeadBlock()
+       parent, err := vs.BeaconDB.HeadBlock(ctx)
+       if err != nil {
+               return nil, err
+       }

        parentRoot, err := ssz.HashTreeRoot(parent.Block)
        if err != nil {
```

### Rapid P2P Message Drop (Incident #5)

**Date:** 26/11/2019

**Authors:** Nishant

**Status:** Root Cause Under Investigation

**Summary:** We had a rapid drop in p2p message rates, which consequently lead to a long period without finality.

**Impact:** Due to a sudden drop in p2p message rates, especially for attestations this lead to a long period without finality. The majority of our production pods ended up getting stuck and we started receiving large grpc failure rates.

**Root Causes:** Yet To Be Determined

**Trigger:** Yet to Be Determined

**Resolution:** This was finally resolved when we scaled down our relay nodes and restarted all our out of sync production pods. The p2p message rate for attestations finally increased back to their normal levels and we got justification and finality soon after.

**Detection:** Pinged in Discord when time since last finalized epoch was greater than 10.

#### Lessons Learned

**What went wrong**
There wasn’t an obvious trigger that we were able to inspect. All the major metrics and charts were fine, so it seemed from the outset that the chain was working normally as expected. However investigating the p2p message count showed another picture not captured by our current metrics and alerts.

#### Where we got lucky
- Blocks were still being produced, so that allowed us to recover the chain even though we were 5 hours out from finality.

#### Timeline

2019-01-01 (all times UTC)
- 04:50 Nishant notices a ping on Discord indicating that it has been more than 10 epochs since finality. Looking at the grafana charts, it seemed normal, so Nishant ignored it thinking it would resolve by itself.
- 05:00 Nishant again looks at the grafana charts but notices that there hasn’t been justification or finality for 15 mins. However all other metrics and charts are normal and there isn’t a directly obvious explanation for it. 
- 05:05 Nishant notices that the p2p message count has dropped by a very large amount, which explains the long period without finality in the current chain. With very little attestations being sent over the wire, we have a large drop in participation rates and therefore a drop in justification and finality.
- 05:37 Nishant tries to rollout the current master image to all production pods.
- 05:50 The rollout does not bring any tangible results, with there being no justifcation or finality still. At this point it has been more than 50 epochs since finality.
- 07:30 Now high grpc failure rates happen across all pods. At this moment it has been more than a 100 epochs since finality. Due to that this brings a lot of stress on the beacon-node with regards to forkchoice when determining the current head.
- 07:40 Nishant now reverts the connection manager fix and tries to roll the old image out to the experimental pods.
- 08:30 The fix however, takes a very long time to rollout due to the slow sync, which displays 2 hours to sync till the current chain head. Nishant then deploys a new fix which includes a recently merged PR for faster sync processing.
- 08:50 However the fix did not have the desired effect , and now grpc failure rates climbed even higher. 
- 9:40 Preston, Terence and Raul are all now online and the situation is relayed to them.
- 09:45 Preston now scales down all the relay nodes to 0 to reduce the peer counts.
- 10:00 Preston deletes the stuck production pods, to allow only synced nodes to be hosting validators.
- 10:10 Attestations Message Rate increasing now. 
- 10:12 We finally get justification
- 10:17 We get finality after 5 hours and the testnet survives for another day.
- 10:45 Now that all pods are healthy in the cluster, the relay is turned back on by Preston.

### Mutex Deadlock Cascading Failures (Incident #4)

**Date:** 2019/11/23

**Authors:** Raul Jordan, Nishant Das

**Status:** Root cause under investigation

**Summary:** A PR into Prysm (Add Lock When Accessing Checkpoints #4086)  including a mutex lock for reading and updated justified checkpoint values was checked-in to Prysm, pushed into a Canary deployment, and then rolled out into production after the Canary successfully passed. The feature led to deadlocks in requesting attestations and proposing blocks, creating a massive drop in validator participation eventually leading to many epochs since finality.

**Impact:** Large number of epochs since finality created lots of context deadlines being exceeded, causing gRPC success to tank, and eventually making it hard for beacon nodes to serve any traffic as it would take too long to process a block or request attestations even after the problematic feature was reverted. This led to many cascading failures when attempting to revive the stateful set pods and rollout other old images.

**Root Causes:** Deadlock in a very frequently used mutex. Other potential root causes still under investigation.

**Trigger:** Canary rollout into production with commit 2f392544a6586ed7a4235a4550a2ad91dfa4a60d

**Resolution:** Rolled back to prior image, scaled down statefulset pods that were unable to sync and left archival+experimental pods on, eventually achieved justification and finality.

**Detection:** Ping on Discord. gRPC success rate alerts at low-levels: ProposeBlock, RequestAttestation.

#### Lessons Learned

**What went well**
We were able to quickly come up with hypotheses as to what went wrong, we used Jaeger to notice forkchoice.OnBlock was taking an unreasonable amount of time, and identified that it was calling the function where the mutex deadlock was occurring. 

**What went wrong**
Even after reverting the bad feature causing the original problem, it took a lot of manual effort to fix the cascading failures and other side-effects of the original problem. 

#### Where we got lucky

We thankfully had archival and experimental pods that were working fine and as such, we were able to scale down the problematic statefulset to 0 pods and achieve justification. We got lucky our archival and experimental pods can serve traffic to validators.

#### Timeline
2019-11-23 (all times Central Standard Time)
- 03:07 - We receive an alert on Discord for > 10 epochs since finality in the network
- 03:11 - ProposeBlock gRPC success rate drops to 83%
- 09:00 - Nishant raises issues about archival nodes being the potential offenders of the situation
- 09:31 - Nishant suggest scaling down archival nodes to 0, Preston runs the commands
- 09:40 - Scaling down does not work - we receive an alert in Discord mentioning > 25 epochs since finality
- 09:53 - Preston has observes very long times for spans in jaeger in proposing a block, suggesting there is some sort of mutex deadlock going on. Signatures failing on request block with the message `parent root does not match the latest block header signing root in state`
- 10:00 - Raul begins investigating, looking in more detail at jaeger spans to increase likeliness of lock being the root cause
- 10:16 - Raul identifies large monitoring gap in Jaeger, with the most expensive operation in forkchoice.OnBlock not having a span. Looking at Prysm PR #4086 shows a function `updateCheckpoints` called in forkchoice.OnBlock without a span, providing high likelihood it is the offender
- 10:24 - Preston suggests rolling back all images to version before PR #4086, suggesting image tag: gcr.io/offchainlabs/prysm/beacon-chain@sha256:7f9a060569d32a1ae05027ba2f0337b586b27dfd7a46307f552046271f1b448c. Raul proceeds and applies image to statefulset, archival deployment, and experimental deployment
- 10:33 - Rollback succeeded in removing the deadlock in forkchoice.OnBlock, but grpc.ProposeBlock still failing at an alarming rate. Investigation into jaeger spans concludes ProcessSlots in the state transition function is taking too long and leading to deadline exceeded problems
- 10:38 - Raul identifies ProcessSlots is taking an average of 5 seconds due to SSZ in the production nodes, making it nearly impossible for validators to attest or request attestations to put into blocks
- 10:39 - Terence suggests using the emergency flag created by Nishant called --enable-skip-slots-cache in all the beacon nodes
- 10:41 - Raul enables --enable-skip-slots-cache by applying a modified k8s manifest to the various deployments/statefulsets, observes < 1s to propose block after being applied. Cluster still does not recover.
- 10:44 - Preston notices errors for AggregateAndProof in the validator client, which means we also forgot to revert the validator client images to the previous version
- 10:50 - No more deadline exceeded errors, but chain is not recovering. There are still problems with many nodes being stuck after initial sync and seemingly being restarted.
- 11:34 - ProposeBlock and RequestAttestation still failing, still many epochs since finality, Raul notices pods keep getting restarted and rescheduled, but apparently archival and experimental nodes are still functional and advancing our chain
- 12:16 - Confirmed via Kibana pods finish initial sync in the statefulset but at the end have unhealthy status `Node is unhealthy! ERROR syncing\n*sync.RegularSync: ERROR waiting for initial sync`
- 12:18 - Raul tracks logs for all beacon-chain-prod nodes and notices they always are unhealthy after initial sync but there are no error logs, issues persist
- 12:30 - Nishant resumes investigation, decides to scale down statefulset prod nodes to 0
- 12:52 - Network achieves justification 
- 12:56 - Network achieves finality 
- 13:00 - Network is all operational, systems back to normal, gRPC back to 100%. However, only running with archival + experimental pods. Statefulset is still at 0 pods.
- 15:30 - Statefulset scaled back to 5

11/24/2019
- 18:00 - Alert received for no finality in 10 Epochs. 
- 19:20 - Terence confirm with Danny that the finality reversions we have been witnessing is indeed a spec bug. However, there isn’t an easy fix that we can deploy immediately, so we will have to wait till the next release. 
- 20:30 - Nishant points to a Pull Request that modified the logic behind our pending queues that could have been the cause of our finality issues.He then opens up a PR to revert it.
- 20:50 Preston rolls out the hotfix with the PR reverted to our experimental nodes.
- 21:30 Seeing as the rollout did not have any negative effect on our experimental nodes, Preston then pushes the hotfix to our production nodes.
- 22:30 The hotfix has been successfully rolled out 
- 23:30 We still get alerts with no finality for 10 epochs. Which means that the hotfix was unsuccessful.

11/25/2019
- 0:30 After looking at all our previous PRs and observing network metrics for the past few days, Preston suggests that the main cause of our finality worries isn’t a bad PR merged in , but instead the growth of the network. With peer counts increasing close to 70, each beacon node processes close to 200 attestations /sec
- 1:00 Preston then checks Jaeger and see that a very large amount of time is spent on DB writes especially in updateAttVotes in OnAttestation. The span in Jaeger, supports this theory as it shows OnAttestation taking nearly 1s with the large majority being taken up by writing attestation data to disk. Initially it looked like an improper use of Batch Updates in Bolt.
- 1:10 After exploring the code in some more, Nishant finds the problem is not that but instead the fact that the function upateAttVotes is very heavy on disk I/O due to the latest vote being saved for each validator in the attestation. This coupled with the fact that the beacon node receives 200 attestations/sec , it would explain the large amounts of time being spent on db writes in Jaeger.

#### Supporting information

Statefulset prod pods being stuck even after a rollout of a previous image was completed - pods showed no error logs but after finishing regular sync, they were unhealthy and were unable to serve traffic to validators. Archival+experimental pods were properly carrying out the chain on their own.

### Finality Decreased! (Incident #3)

**Date:** 2019/11/21

**Authors:** Preston, Terence

**Status:** Mitigated; In root cause investigation

**Summary:** Prysm nodes observed a finalized checkpoint reversion which caused all attestations to be rejected. 

**Impact:** 56 epochs gap in finality

**Root Causes:** Prysm clients experienced a spec allowed finality reversion during a forking condition. Prysm’s chain service maintains the most recent finalized checkpoint and has validation to ensure a finalized checkpoint can never revert. This led to a difference in finalized checkpoints between the chain service cache and the head state. All incoming attestations were validated and rejected based on the chain service checkpoint. 

**Trigger:** Finality decreases 

**Resolution:** TBD -- Fix the condition for updating finalized check point cache

**Detection:** Prometheus, pager

#### Action Items

- Confirm finality roll back is normal 

Confirmed it’s not normal. From Danny: The fork choice first narrows down the block tree by finality, then narrows it down by latest justified. In the above scenario, the block at slot x+8 should not even be considered in the fork choice

#### Lessons Learned
**What went well**
The ability to extract offender DB and play back these scenarios is very helpful
Prometheus graphs helped to narrow down the problem

**What went wrong**
Lack of metrics. For a single entry, we often have to consider 2 values. The latest value, and the cached value. In this case, we only captured the latest value

#### Timeline
2019-11-21 (all times UTC)
- 23:35:26 - Received  block 74137 with pre state of slot 74132. The pre state has finalized epoch is 9264.
- 23:35:26~23:36:50 - No blocks received.
- 23:36:50 - Received block 74144 with pre state of slot 74130 (in epoch 9266). The pre state has finalized epoch 9263. Attestations favored block from 74144 and made post state of slot 74144 the head state which has finalized epoch 9263. Database headState was updated where the finalized epoch is now 9263. ChainService.HeadState (cache) is also updated with the new state with finalized epoch of 9263. The chain service FinalizedCheckpt was not updated due to an enforcement that the finalized checkpoint cannot drop. 
- 23:37 - Prometheus observed finalized epoch drop from 9264 to 9263. Link. This affected all Prylabs nodes at the same time.
- 23:37 - P2P attestations in beacon chain nodes that attestations were “old” since their source was 6264. Nodes were producing attestations with the finalized checkpoint epoch at 9263, but nodes were validating them in p2p against 9264. 
- 23:47 - Page is received. Preston begins investigation. 

2019-11-22
- 00:00 - Preston suspects something is going on with the finalized checkpoint.
- ~00:10 - Normal canary rollout proceeds. Node restarts are welcome to flush any cache.
- ~00:25 - Rollout complete, problem persists.
- 00:40 - Preston suspects the finalized checkpoint in the chain info reverted but the checkpoint in the head state did not. This line of code seemed to be the cause of our attestations being rejected.
- 00:44 - Hotfix patch rollout begins. (See supporting info for patch details).
- 00:55 - Rollout complete, 1 pod struggling. Experimental, archival deployments scaled down.
- 00:58 - Justification
- 01:00 - Finalization
- 01:00 - Hotfix patch is rolled back. Experimental, archival deployments scaled up.
- 01:04 - Problem mitigation ends and root cause investigation begins.

#### Supporting information

Supporting test: https://github.com/OffchainLabs/prysm/blob/454c7d70e69e98e39d26f862c306b352a5381f08/beacon-chain/core/state/transition_test.go#L1109

Additional supporting data: https://gist.github.com/prestonvanloon/365cc64804b46bd65790ba898cf60e1b

Hotfix patch that was applied:

```
diff --git a/beacon-chain/sync/validate_beacon_attestation.go b/beacon-chain/sync/validate_beacon_attestation.go
index 30671f9b9..9684609c8 100644
--- a/beacon-chain/sync/validate_beacon_attestation.go
+++ b/beacon-chain/sync/validate_beacon_attestation.go
@@ -65,7 +65,11 @@ func (r *RegularSync) validateBeaconAttestation(ctx context.Context, msg proto.M
                return false, nil
        }

-       finalizedEpoch := r.chain.FinalizedCheckpt().Epoch
+       head, err := r.db.HeadState(ctx)
+       if err != nil {
+               return false, err
+       }
+       finalizedEpoch := head.FinalizedCheckpoint.Epoch
        attestationDataEpochOld := finalizedEpoch >= att.Data.Source.Epoch || finalizedEpoch >= att.Data.Target.Epoch
        if finalizedEpoch != 0 && attestationDataEpochOld {
                log.WithFields(logrus.Fields{
(END)
```

Conversation with Danny:
Danny Ryan, [Nov 24, 2019 at 11:16:04 AM]:
```python
# Check block is a descendant of the finalized block
    assert (
        get_ancestor(store, signing_root(block), store.blocks[store.finalized_checkpoint.root].slot) ==
        store.finalized_checkpoint.root
    )
```

should prevent adding new blocks that are not descendants of the finalized block.

There is a corner case in which a branch might have the finalized block but not enough votes on the branch to have _finalized_ the block. Such a case does not currently have a fix in the spec, but the fix you added doesn’t properly cover this case because it cuts out possible branches that _might_ finalize the root in the future (include proper amount of attestations).

We’ve been talking about this scenario the past week. Not 100% sure the scenario you found is the same

regardless, the following should prevent you from finalizing an older epoch in any possible case

```python
# Update finalized checkpoint
    if state.finalized_checkpoint.epoch > store.finalized_checkpoint.epoch:
        store.finalized_checkpoint = state.finalized_checkpoint

you _never_ finalize an older epoch in on_block, and get_head filters out blocks that aren’t in your the block tree rooted at your latest justified
```

Terence Tsao, [Nov 24, 2019 at 11:35:13 AM]:
But wouldn’t you want to prevent adding new block that’s not descendent of the “latest” finalized block? Here’s what happened in our node:


After processing b144, store.finalized_epoch is 4 because it cant be reverted given the "update finalized checkpoint..." condition. But head_state.finalized_epoch got reverted to 3

The "descendant of the finalized block..." check doesn't cover this case because block111 (finalized epoch 4) is also a descendent of b101 (finalized epoch 3)

Only thing I think of is get_head did not filter out b144 based on "block tree rooted at your latest justified..." condition… I’ll check that now

### Goerli / PoW Nodes Offline Killed Testnet (Incident #2)
**Date:** 2019/10/30

**Authors:** Preston and Nishant

**Status:** Action items in progress

**Summary:** Goerli PoW test network experienced a hard fork which the Prysm testnet nodes were not compatible with. As a result, all connections to Goerli PoW chain from Prysm nodes failed and the condition could not be recovered before too many epochs had lapsed to the point that Prysm can not compute assignments fast enough.

**Impact:** Prysm testnet stalled for 2 hours. Committee assignments could not be calculated within adequate time without substantial code changes. Prysm testnet required a restart.

**Root Causes:** Tight coupling with PoW. Committee assignments fail to compute within a short deadline.

**Trigger:** Istanbul hardfork on Goerli.

**Resolution:** Full testnet restart, scheduled for November 4th.

**Detection:** Ping on Twitter / Gitter / Discord. Chain stalled alert.

#### Lessons Learned
**What went well**
- go-ethereum was able to sync Goerli in under 15 minutes.

**What went wrong**
- Critical monitoring alerts didn’t fire with missing data.
- Lack of communication between Prysmatic Labs and Goerli community caused an easily preventable issue.
- Inability to start without ETH1 caused the chain to be 100% offline.

#### Where we got lucky
This incident exposes a single point of failure with PoW: Prysm nodes could not start without an existing PoW connection, despite being recently synced.

#### Timeline

2019-10-30 (all times UTC)
- 13:36 soc1c announces hardfork happens within one hour.
- 13:53 Istanbul hardfork happens at block 1561651. All of Prysm goerli nodes were not compatible and could not advance the chain.
- ~13:55 Beacon chain nodes stop serving traffic. All are reporting unhealthy due to lack of  healthyETH1 connection.
- 14:05 Chain starts to stall. See chart.
- ~14:10 Beacon chain nodes have been unhealthy for too long. Kubernetes scheduler starts to reschedule the pods, but pods cannot start.
- 14:13 Chain stall metric drops off with no data. Presumably because all beacon chain nodes are dead and the metric is not being scraped/reported. 
- 15:11 Peter reaches out on twitter.
- 15:11 Chain stalled alert fired.
- 15:16 Chain stalled alert resolved. (Due to lack of data).
- 16:00 Prysmatic Goerli nodes updated, syncing from genesis.
- 16:10 Prysmatic Goerli nodes back online.
- ~16:12 Hacked image deployed to be immediately in sync.
- 16:14 Prysm nodes can start again and come online.
- ~16:14 A beacon block is produced, stalled chain event fires again.
- 16:22 All Prysm nodes back online, except prod-4 and prod-1(expected those are stuck due to issue 3885).
- ~16:22 Hacked image rolled back. 
- 16:31 Nishant observes deadline exceeded at high rate for committee assignments. The chain is considered unrecoverable.
- 16:31 Investigation ends.

### Testnet Large Finality Gap Postmortem (Incident #1)
**Date:** 2019-10-27

**Authors:** Preston Van Loon

**Status:** Draft

**Summary:** A seemingly benign production rollout uncovered a cascading series of errors which led to a large gap in finalized epochs.

**Impact:** 86 consecutive epochs without finality.

**Root Causes:** Offline validators, forked beacon chain pods.

**Trigger:** A successful 3 hour canary report started a rollout to production and experimental pods.

**Resolution:** Validators were penalized and ejected until finality could be reached.

**Detection:** Prometheus alarm for too_long_since_finality_10.

#### Lessons Learned
**What went well**
Finality alert notified on call and response time was less than a minute.

**What went wrong**
- There are multiple issues causing finality gap and it was hard to isolate the problem.
- We allowed too many external peers to join the testnet and go offline. At the time of the event, we only controlled 70% of active validators which is dangerously close to falling under 2/3rds majority. Given the ephemeral nature of external testers, we can assume that the majority of validators not controlled by Prysmatic Labs are offline. Any issue in the network is extra sensitive to finality gaps.
- There is an existing bug where non-canonical blocks are served on p2p RPC requests for blocks by range. This is blocking testnet users from syncing to head and is blocking normal rollout procedures for beacon-chain-prod-1.  

#### Where we got lucky
- Some validators were close to ejection. After enough of the exponential penalties, the network was able to reach finality. Had this event continued beyond 100 epochs, it is very likely that we would not have been able to recover due to timeouts in committeeAssignment requests as it grows more expensive as the gap in finality increases.

#### Timeline

2019-10-27 (all times UTC)
- 3:47:11 Canary pipeline starts.
- 7:09:34 Prod pods deployment starts.
- 7:09:34 Experimental pods deployment starts.
- 7:13:00 beacon-chain-experimental-6dcdd678d4-2j2vp, beacon-chain-experimental-6dcdd678d4-s62lv, and beacon-chain-canary-5b4c95f7f6-nf8st starts logging “could not verify indexed attestation: attestation aggregation signature did not verify” at 5 to 15 times per minute until 7:40:00.
- 7:14:24 First sign of issues in finality. 6.785 epochs since last finality. Finality is reached.
- 7:14:52 Finalized epoch reaches 17332, then drops to 17331.
- 7:16:16 beacon-chain-experimental-6dcdd678d4-s62lv experiences less than 95% gRPC success rate for ProposeBlock. This pod is running the new image from rollout.
- 7:16:44 Finalized epoch reaches 17332, then drops to 17331.
- 7:19:32 beacon-chain-prod-0 experiences less than 95% gRPC success rate for ProposeBlock. This pod is running the old image and has not been restarted in over two days due to a stuck rollout with prod-1.
- 7:19:32 beacon-chain-prod-2 experiences less than 95% gRPC success rate for ProposeBlock. Uncertain if this pod was recently restarted or running old image. 
- 7:19:32 Several pods experience high rate of p2p processing failures on beacon block gossip topic.
- 7:20:00 too_long_since_finality_10 alert starts.
- 7:20:00 Preston ACKs alert and begins investigation.
- 7:27:00 Preston observes block proposals are failing on three pods.
- 7:27:00 Preston observes finalized_epoch metric drop by 1. 
- 7:33:04 Finality is reached again. This gap was 26 epochs.
- 7:37:00 Preston observes many “could not verify indexed attestation: attestation aggregation signature did not verify” errors from receiving attestations of p2p.
- 7:40:00 Preston scales experimental pods to 0.
- 7:45:00 Preston pauses canary pipeline and cancels currently running canary. Canary pod is deleted.
- 8:38:52 Finality is reached. This gap was 86 epochs.
- 8:44:00 Investigation ends.
