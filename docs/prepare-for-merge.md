---
id: prepare-for-merge
title: Configure for The Merge
sidebar_label: Configure for The Merge
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import JwtGuidancePartial from '@site/docs/partials/_jwt-guidance-partial.md';

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';
import { PrysmVersion } from '@site/src/components/version.js';

<HeaderBadgesWidget commaDelimitedContributors="Raul,James" />

:::caution DEPRECATION NOTICE: Ethereum is post merge, use our quickstart guide.
   The contents of this document was to help validators using **pre-Merge configuration** to migrate post merge. This is no longer required as Ethereum is already post merge. See our [Quickstart](/install-prysm/install-with-script.md) going forward.
:::

## Select a configuration

import MultidimensionalContentControlsPartial from '@site/docs/partials/_multidimensional-content-controls-partial.md';

<MultidimensionalContentControlsPartial />


## Merge preparation checklist


<div className='hide-tabs mergeprep-guide'>

<div className='checklist'>
    <div className='task'>
        <div className='input-container'><input id="cl-1" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-1">Use Prysm <PrysmVersion/></label>
            <p>Prysm <PrysmVersion includeLink={true}/> supports <strong>post-Merge</strong> configuration.</p>
        </div>
    </div>
    <div className='task'>
        <div className='input-container'><input id="cl-5" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-5">Unset <code>USE_PRYSM_VERSION</code></label>
            <p>If you've ever set the <code>USE_PRYSM_VERSION</code> environment variable to use a release candidate, either clear it via <code>UNSET USE_PRYSM_VERSION</code> (Linux/MacOS) or <code>set USE_PRYSM_VERSION=</code> (Windows).</p>
        </div>
    </div>
        <div className='task'>
        <div className='input-container'><input id="cl-6" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-6">Verify your Prysm version</label>
            <p>Verify that you're running Prysm <PrysmVersion/> by issuing the following command: <code>prysm.sh beacon-chain --version</code> (Linux) <code>prysm.bat beacon-chain --version</code> (Windows).</p>
        </div>
    </div>
    <div className='task'>
        <div className='input-container'><input id="cl-2" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-2">Review "Before and now"</label>
            <p>The <a href='#the-merge-before-and-now'>Before and now</a> section below gives you a high-level comparison between pre-Merge and post-Merge configuration. See the Ethereum.org <a href='https://blog.ethereum.org/2022/08/24/mainnet-merge-announcement/'>Merge announcement</a> and <a href='https://launchpad.ethereum.org/en/merge-readiness'>Merge readiness checklist</a> for more detailed information.</p>
        </div>
    </div>
    <div className='task'>
        <div className='input-container'><input id="cl-prereqs" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-prereqs">Review system requirements</label>
            <p>Review the <a href='#post-merge-system-requirements'>post-Merge system requirements</a> section below.</p>
        </div>
    </div>
    <div className='task'>
        <div className='input-container'><input id="cl-3" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-3">Use a Merge-ready version of your execution client</label>
            <p>
                <Tabs className="tabgroup-with-label" groupId="execution-clients" defaultValue="geth" values={[
                {label: 'Execution client:', value: 'label'},
                {label: 'Geth', value: 'geth'},
                {label: 'Nethermind', value: 'nethermind'},
                {label: 'Besu', value: 'besu'}
                ]}>
                    <TabItem value="geth">Use <code>geth version</code> to check Geth's version. See <a href='https://github.com/ethereum/go-ethereum/releases'>Geth's releases page</a> and join <a href='https://discord.gg/invite/nthXNEv'>their Discord</a> to stay up to date as we approach Mainnet Merge.</TabItem>
                    <TabItem value="nethermind">Review Nethermind's log output to see what version you're using. See <a href='https://github.com/NethermindEth/nethermind/releases'>Nethermind's releases page</a> and join <a href='https://discord.com/invite/DedCdvDaNm'>their Discord</a> to stay up to date as we approach Mainnet Merge.</TabItem>
                    <TabItem value="besu">Review Besu's log output to see what version you're using. See Besu's <a href='https://github.com/hyperledger/besu/releases'>releases page</a> and join <a href='https://discord.com/invite/hyperledger'>their Discord</a> to stay up to date as we approach Mainnet Merge.</TabItem>
                </Tabs>
            </p>
        </div>
    </div>
    <Tabs className="tabgroup-with-label" groupId="execution-clients" defaultValue="geth" values={[
            {label: 'Execution client:', value: 'label'},
            {label: 'Geth', value: 'geth'},
            {label: 'Nethermind', value: 'nethermind'},
            {label: 'Besu', value: 'besu'}
            ]}>
        <TabItem value="geth">
            <div className='task'>
                <div className='input-container'><input id="cl-4" type='checkbox'/><span className='done'></span></div>
                <div className='guidance-container'>
                    <label htmlFor="cl-4">Update Geth now</label>
                    <p>Geth 1.10.22 contains a regression. Update to <a href='https://github.com/ethereum/go-ethereum/releases'>v1.10.23+</a> if you haven't already.</p>
                </div>
            </div>
        </TabItem>
        <TabItem value="nethermind"></TabItem>
        <TabItem value="besu"></TabItem>
    </Tabs>
    <Tabs className="tabgroup-with-label" groupId="protocol" defaultValue="jwt" values={[
        {label: 'EN-BN connection:', value: 'label'},
        {label: 'HTTP-JWT', value: 'jwt'},
        {label: 'IPC', value: 'ipc'}
    ]}>
        <TabItem value="jwt">
            <div className='task'>
                <div className='input-container'><input id="cl-7" type='checkbox'/><span className='done'></span></div>
                <div className='guidance-container'>
                    <label htmlFor="cl-7">Configure JWT</label>
                    <p>If you're not using IPC to connect your beacon node and execution node, ensure that both your execution node and beacon node are configured to use JWT authentication. These instructions are included below, and are also available here: [Configure JWT](/configure-prysm/configure-jwt.md)</p>
                </div>
            </div>
        </TabItem>
        <TabItem value="ipc"></TabItem>
    </Tabs>
    <div className='task'>
        <div className='input-container'><input id="cl-8" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-8">Update your firewall</label>
            <p>If you're not using IPC to connect your beacon node and execution node, your beacon node will need to connect to its execution node on port <code>8551</code>. Previously, port <code>8545</code> was used. If your beacon node and execution node are on different host machines, ensure that your firewall rules are updated accordingly, and refer to [Configure ports and firewalls for improved network connectivity](/manage-connections/configure-ports-and-firewalls.md) for general connectivity improvement tips.</p>
        </div>
    </div>
    <div className='task'>
        <div className='input-container'><input id="cl-9" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-9">Configure a fee recipient address</label>
            <p>If you're running a validator, configuring a fee recipient address will allow you to earn what were previously miners' transaction fee tips. Instructions are provided below, and also here: [Configure a Fee Recipient address](/configure-prysm/configure-fee-recipient.md).</p>
        </div>
    </div>
    <div className='task'>
        <div className='input-container'><input id="cl-expected" type='checkbox'/><span className='done'></span></div>
        <div className='guidance-container'>
            <label htmlFor="cl-expected">Ensure that Prysm is running as expected</label>
            <p>See [Check node and validator status](/monitoring-alerts-metrics/check-node-and-validator-status.md) to learn how to check the status of your execution node, beacon node, and validator node.</p>
        </div>
    </div>
</div>


## The Merge: Before and now

| Before                                                                                                         | Now                                                                                                                                      |
|----------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| You don't need to run a local execution client. You can use a service like Infura instead.                     | You **do** need to run an execution client. You **can't** use Infura as an execution endpoint provider.                                  |
| The HTTP connection between beacon node and execution node doesn't need to be authenticated using a JWT token. | The HTTP connection between beacon node and execution node **does** need to be authenticated using a JWT token.                          |
| Beacon nodes connect to execution nodes on port `8545` by default when using HTTP.                             | Beacon nodes connect to execution nodes on port **`8551`** by default when using HTTP.                                                   |
| Miners receive transaction fee tips.                                                                           | **Validators** receive transaction fee tips. The "fee" is now a base fee that's burned - block producers earn only transaction fee tips. |
| A fee recipient address does not need to be specified.                                                         | A fee recipient address **does** need to be specified.                                                                                   |
| A 1TB hard drive is enough.                                                                                    | An **SSD** is highly recommended. Beacon node requires ~200GB with checkpoint sync or ~1TB when synced from genesis.                   |


## Post-Merge system requirements

import QuickstartPrereqsPartial from '@site/docs/install-prysm/partials/_quickstart-prereqs.md';

<QuickstartPrereqsPartial />


<Tabs className="tabgroup-with-label hidden-in-jwt-guide" defaultValue="jwt" groupId="protocol" values={[
        {label: 'EN-BN connection:', value: 'label'},
        {label: 'HTTP-JWT', value: 'jwt'},
        {label: 'IPC', value: 'ipc'}
    ]}>
    <TabItem value="jwt">
    
<h2>Configure JWT authentication</h2>

<JwtGuidancePartial />

</TabItem>
<TabItem value="ipc"></TabItem>
</Tabs>

</div>

## Configure validator node

import FullSyncWarningPartial from '@site/docs/partials/_full-sync-warning-partial.md';

<FullSyncWarningPartial />

Other than ensuring that you're using the [latest stable Prysm release](https://github.com/OffchainLabs/prysm/releases), validator client configuration doesn't need to be updated for The Merge. A fee recipient address can optionally be configured on your validator node if you want redundancy or multiple fee recipient addresses. See [Configure a Fee Recipient address](/configure-prysm/configure-fee-recipient.md) to learn more.

import SingletonWarningPartial from '@site/docs/partials/_singleton-warning-partial.md';

<SingletonWarningPartial />


:::tip Congratulations!

You’re now running a post-Merge configuration. If you have any questions, feel free ask them on our [Discord](https://discord.gg/prysm).

:::


## Frequently asked questions

**I'm currently running a validator on Ethereum Mainnet. When should I make changes?** <br />
You should make these changes now, regardless of the network you're running on.

**Can I use IPC post-Merge?** <br />
Yes. You also won't have to worry about JWT if you use IPC. See our [Quickstart](/install-prysm/install-with-script.md) for IPC instructions.

**Can I use a light node with Prysm, or do I need to run a full execution node?** <br />
No - at this time, a full node is required.
