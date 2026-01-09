---
id: security-best-practices
title: Staking with Prysm - Security best practices
sidebar_label: Security best practices
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Ethereum's transition to proof-of-stake is made possible by validators who each stake 32 `ETH` into the [validator deposit contract](/learn/dev-concepts/validator-deposit-contract.md). These validators accept the responsibility to uphold the integrity of the Ethereum network in exchange for staking rewards.

Validators are rewarded for maintaining highly available, trustworthy validator client instances. The security best practices in this guide will help you fulfill this responsibility by helping you minimize risk across a variety of security aspects. Within each aspect, you'll find **recommended**, **advanced**, and **Linux-specific** guidance.

Note that this document is subject to the [Prysm Terms of Service](https://github.com/OffchainLabs/prysm/blob/master/TERMS_OF_SERVICE.md).


## Security principles

The following principles apply generally to staking security:

 - **Keep it simple**. Over-engineered solutions tend to increase risk.
 - **Stay up to date**. At a minimum, join the [prysm-dev Google Group](https://groups.google.com/g/prysm-dev) to receive important updates related to client security and maintenance. We encourage all stakers to join the [Prysm Discord server](https://discord.gg/prysm) and [r/ethstaker](https://www.reddit.com/r/ethstaker). Visit the [Learning Resources](#learning-resources) section at the end of this guide for a short list of resources that we recommend visiting periodically.
 - **Testnet first**. Harden your configuration using testnet [<a href='#footnote-1'>1</a>] before staking with real `ETH` on mainnet.
 - **Simulate risk events**. For each of the aspects within this document, simulate risk events and document your own risk mitigation plans. You can use the [risk mitigation worksheet](#mitigation-worksheet) located at the end of this guide.
 - **Proactively manage risk** You can't completely eliminate risk, but you can minimize it by following the best practices within this guide.
 - **If you’re not sure, ask**. The [Prysm Discord server](https://discord.gg/prysm) and [r/ethstaker](https://www.reddit.com/r/ethstaker) subreddit are full of people who genuinely enjoy helping out.


## Uptime management
The security of the Ethereum blockchain relies on a **highly available** network of validators. Ethereum's proof-of-stake implementation incentivizes validators to remain online.
 
If your validator goes offline, you can lose some of your staked `ETH` [<a href='#footnote-2'>2</a>]. As long as you're online most of the time, you'll be profitable. Losses incurred from occasional downtime are negligible [<a href='#footnote-3'>3</a>].
 
While it's possible to optimize your client instance architecture for high-availability and redundancy, we encourage validators to **keep it simple**. Complex validator architectures run the risk of accidentally engaging in slashable behavior. This can result in slashing [<a href='#footnote-4'>4</a>], which is a far steeper price to pay than the occasional downtime penalty.

 - **Essential**: Ensure that you have adequate disk space. The beacon node requires ~200GB with checkpoint sync or ~1TB when synced from genesis with pruning disabled. Consult your execution client's documentation for its storage requirements.
 - **Essential**: Use SSDs, not spinning disks.
 - **Essential**: Periodically check your disk space to ensure that it's not being consumed by another application.
 - **Essential**: Use a network monitoring service [<a href='#footnote-5'>5</a>] to configure alerts when something isn't right with your validator.
 - **Advanced**: Use an uninterruptible power supply (UPS) to protect your computer from issues related to power outages.
 - **Advanced**: Configure automatic boot / AC auto-recovery in your BIOS.
 - **Advanced**: Ensure that your beacon node and/or validator automatically start running when you reboot your machine.
 - **Advanced**: Configure [Prometheus and Grafana](monitoring-alerts-metrics/grafana-dashboard.md) to help you visualize real-time validator metrics.
 - **Advanced**: Use a web-based uptime monitoring solution to monitor your validator's uptime with periodic ping-response checks [<a href='#footnote-6'>6</a>].
 - **Advanced**: Configure your validator client's machine to periodically ping a secondary machine with your validator status. If the secondary machine doesn't receive an expected ping from your validator, raise an alert.

Linux-specific best practices:

 - **Essential**: Monitor your disk space using [Disk Usage Analyzer](https://help.ubuntu.com/stable/ubuntu-help/disk-capacity.html.en). Prysm won't rapidly consume your disk space, but periodically checking your available capacity can reduce the risk of surprises.
 - **Advanced**: Ubuntu users can use the [Startup Applications](https://help.ubuntu.com/stable/ubuntu-help/startup-applications.html.en) utility to auto-start beacon and validator services on boot.


## Slash avoidance
The Ethereum network penalizes malicious behavior with a slashing mechanism that burns staked `ETH` [<a href='#footnote-7'>7</a>]. Generally speaking, unless you deliberately act maliciously or over-engineer for redundancy, you won’t be slashed. 
 
It’s very important for you to understand that **simple setups that occasionally experience downtime** are far better for you - and for the network - than complex highly-available architectures.
 
This is because **the easiest way to get slashed is to run your validating keys in two places at the same time**. This can happen if you don’t exercise extreme caution when configuring your validator client [<a href='#footnote-8'>8</a>]. This can also happen if you configure a “failover instance” that prematurely comes online, accidentally signaling malicious intent to the broader network.
 
Put simply: Ethereum gently discourages downtime with paper cuts. But it uses a ruthless banhammer to punish clones, and it doesn’t have any way to distinguish between accidental clones and real, malicious clones. So it’s best to keep it simple and expect some paper cuts.
 
 - **Essential**: Never run your validating keys in two places at the same time.
 - **Essential**: Avoid over-engineering your validator setup. Keep it simple so your validator doesn't accidentally behave maliciously.
 - **Essential**: If you migrate your validator client to another machine, don't migrate your keys without also [migrating your slashing protection history](/backup-and-migration/slashing-protection.md). If you lose your slashing protection history, we recommend waiting few epochs before starting your validator.



## Operational security
Operational security describes aspects of security related to your day-to-day procedures. Maintaining operational security is a critical component of risk management.
 
 - **Essential**: Dedicate your validator machine to validating, and use it for nothing else.
 - **Essential**: Use long, unique passwords for everything. Consider using a password manager.
 - **Essential**: Don’t use unsecured or public networks for anything related to validating.
 - **Essential**: Avoid advertising your holdings or disclosing your validator activities, especially on public forums and social media that link to your IRL identity. This information can make it easier for adversaries to target you.
 - **Essential**: Avoid disclosing metadata that links your validator index or public key back to your identity, like links to your validator’s performance in block explorers, or logs that contain sensitive information.
 - **Essential**: Mentally compartmentalize your validator activities into a separate identity, and establish a strict operational firewall between that identity and your primary identity. Ideally, nobody will ever be able to connect you to your validator.
 - **Advanced**: Assume adversaries are waiting for you to expose a vulnerability that they can exploit.
 - **Advanced**: Enumerate the things that you value most. Evaluate and maximize the security of those things to limit adversaries’ ability to gather leverage against you.


## Operating system security
We recommend applying the following security best practices to the operating system (OS) that your client runs on.
 
 - **Essential**: Install only what you need.
 - **Essential**: Install only trusted software.
 - **Essential**: Keep your OS updated with the latest firmware updates and security patches.
 - **Essential**: Ensure that your machine doesn't automatically shut down or restart.
 - **Essential**: Be present for all updates and restarts.
 - **Essential**: Enable your firewall and set it to the most restrictive configuration possible.
 - **Essential**: Reboot occasionally, but manually.
 - **Essential**: Start with a clean slate machine to minimize the risk of being exposed to malicious preloaded software.
 - **Essential**: Never run the client software under “administrator” accounts. The account that runs your client software should be granted the permissions it needs, and only the permissions it needs.
 
Linux-specific best practices:
 
 - **Essential**: Don't use `root` unless you need to. Don't run anything as `root`.
 - **Essential**: Configure time sync. The Ethereum Launchpad demonstrates this as part of their [validator checklist](https://launchpad.ethereum.org/en/checklist).
 - **Essential**: Enable the UFW firewall [<a href='#footnote-9'>9</a>]. 
 - **Advanced**: Disable the root account, root account login, and password-based login [<a href='#footnote-10'>10</a>].
 - **Advanced**: Disable SSH password authentication. Use SSH keys only [<a href='#footnote-11'>11</a>].

## Wallet and key management
You’ll be managing two types of keys: validator keys and withdrawal keys. Prysm only needs access to your validator keys. You can learn more about this [here on the Ethereum blog](https://blog.ethereum.org/2020/05/21/keys/).
  
 - **Essential**: Keep your withdrawal keys secure, offline, and physically separated from your validator instance. Use your withdrawal keys only when withdrawing funds - otherwise these keys should never touch Prysm, or any other software.
 - **Essential**: Don't use external devices that you don't trust.
 - **Essential**: Keep your mnemonic phrase in a safe place, offline.
 - **Essential**: Generate your wallet and keys on trusted hardware with the internet turned off.
 - **Essential**: Review [Prysm’s security considerations](/learn/concepts/keys-wallets-accounts.md#security-considerations) before generating your wallet and keys.
 - **Essential**: Keep your wallet mnemonic phrase and withdrawal keys physically separated from your validator client.
 - **Advanced**: Generate your wallet and keys using new, airgapped hardware that has never been - and will never be - connected to the internet.
 - **Advanced**: Use a metal wallet to protect your mnemonic phrase [<a href='#footnote-12'>12</a>]. 
 - **Advanced**: Build the key generation software from source - don’t trust third-party binaries.
 - **Advanced**: Use [Web3Signer](/manage-wallet/use-web3signer.md) to maintain separation between your keys and client software.

## Troubleshooting
Ethereum and its client software are constantly improving. This constant change means that unexpected things may happen that require troubleshooting. 
  
 - **Essential**: Expect unexpected things to happen.
 - **Essential**: Be prepared to engage with the [Prysm Discord server](https://discord.gg/prysm), [r/ethstaker](https://www.reddit.com/r/ethstaker/), and the [EthStaker Discord server](https://discord.gg/ethstaker) if you need help troubleshooting issues.
 - **Essential**: When sharing logs, be sure to redact personally identifiable information and metadata that can be used to identify your validator.
 - **Essential**: Learn how to [inspect Prysm's performance](/monitoring-alerts-metrics/monitor-prysm.md).
 - **Essential**: Familiarize yourself with [Prysm's P2P connectivity guidance](/manage-connections/configure-ports-and-firewalls.md).
 - **Essential**: Review [the Prysm FAQ](/faq.md).

## Migration security
Migrating your validator from one machine to another is a delicate process that requires attention to detail. Migrating between machines significantly increases the risk of slashing.
  
 - **Essential**: Review [Prysm's migration guidance](/backup-and-migration/migrating-keys.md) for a detailed overview of the process and considerations.
 - **Essential**: Never run more than a single validator process with the same keys loaded.
 - **Essential**: Accept downtime as part of a successful migration.
 - **Essential**: Maintain and utilize slashing protection.

## Mitigation worksheet

| Risk event                                                                  | I'll proactively minimize risk by... | I'll notice when... | I'll respond by... |
| --------------------------------------------------------------------------- | ------------------------------------ | ------------------- | ------------------ |
| My ISP goes offline.                                                        |                                      |                     |                    |
| There's a power outage.                                                     |                                      |                     |                    |
| My disks fail.                                                              |                                      |                     |                    |
| My computer's memory fails.                                                 |                                      |                     |                    |
| I forget everything.                                                        |                                      | n/a                 |                    |
| My OS crashes.                                                              |                                      |                     |                    |
| My disk runs out of space.                                                  |                                      |                     |                    |
| My client has a bug.                                                        |                                      |                     |                    |
| My validator instance transitions into an unexpected state.                 |                                      |                     |                    |
| Someone physically steals my validator machine.                             |                                      |                     |                    |
| I get locked out of my OS.                                                  |                                      |                     |                    |
| My validator keys are stolen or exposed.                                    |                                      |                     |                    |
| I have to migrate to another machine.                                       |                                      | n/a                 |                    |
| I suddenly have to pack up and leave, leaving my validator instance behind. |                                      | n/a                 |                    |
| I pass away.                                                                |                                      | n/a                 | n/a                |


## Learning resources

 - [Prysm Discord server](https://discord.gg/prysm)
 - [Ethereum launchpad](https://launchpad.ethereum.org/en/overview)
 - [Ethereum launchpad FAQ](https://launchpad.ethereum.org/en/faq) 
 - [Eth2 rewards and penalties calculator](https://docs.google.com/spreadsheets/d/15tmPOvOgi3wKxJw7KQJKoUe-uonbYR6HF7u83LR5Mj4/edit#gid=1018097491)
 - [EthStaker Discord server](https://invite.gg/ethstaker)
 - [EthStaker subreddit](https://reddit.com/r/ethstaker)


## Closing remarks
Participating as a validator can be rewarding public service [<a href='#footnote-13'>13</a>], but it's not without risk. Following these security best practices will help you minimize risk. 
 
If you have any questions, feel free to visit our [Discord](https://discord.gg/prysm).


-----------------------------------

Footnotes:

<strong id='footnote-1'>1</strong>. Learn more about the Hoodi testnet <a href='https://hoodi.launchpad.ethereum.org/'>here on Ethereum.org</a>. <br />
<strong id='footnote-2'>2</strong>. BitMex recently posted research that provides hard numbers on penalties and rewards: <a href='https://blog.bitmex.com/ethereums-proof-of-stake-system-calculating-penalties-rewards/'>Ethereum's Proof of Stake System - Calculating Penalties and Rewards</a>. Collin Myers has also created an <a href='https://docs.google.com/spreadsheets/d/15tmPOvOgi3wKxJw7KQJKoUe-uonbYR6HF7u83LR5Mj4/edit#gid=1018097491'>Ethereum calculator</a>. <br />
<strong id='footnote-3'>3</strong>. See <a href='https://www.reddit.com/r/ethstaker/comments/nnwfx1/why_you_should_stop_worrying_about_your/'>Why you should stop worrying about your validator's uptime and start embracing the chaos instead</a>. <br />
<strong id='footnote-4'>4</strong>. See <a href='https://medium.com/prysmatic-labs/eth2-slashing-prevention-tips-f6faa5025f50'>Eth2 Slashing Prevention Tips</a> to learn more about slashing.<br />
<strong id='footnote-5'>5</strong>. <a href='https://www.beaconcha.in'>BeaconChain</a> has a mobile app that will alert you when your validator state changes. <br />
<strong id='footnote-6'>6</strong>. See <a href='https://www.youtube.com/watch?v=txgOVDTemPQ'>How to monitor your ETH 2 Validator with Google Cloud</a> for a demonstration of this type of solution. <br />
<strong id='footnote-7'>7</strong>. See <a href='https://medium.com/prysmatic-labs/eth2-slashing-prevention-tips-f6faa5025f50'>Eth2 Slashing Prevention Tips</a> by Raul Jordan. <br />
<strong id='footnote-8'>8</strong>. See <a href='https://www.reddit.com/r/ethstaker/comments/oa6m2o/my_validator_got_slashed/'>this discussion on Reddit</a> for an example of how an honest scripting mistake can result in slashing. The Ethereum ecosystem is growing quickly - this requires all participants to exercise an abundance of caution. <br />
<strong id='footnote-9'>9</strong>. CoinCashew demonstrates firewall configuration best practices <a href='https://www.coincashew.com/coins/overview-eth/archived-guides/guide-or-how-to-setup-a-validator-on-eth2-mainnet/part-i-installation/step-2-configuring-node#enable-firewall'>here</a>. <br />
<strong id='footnote-10'>10</strong>. CoinCashew demonstrates root account administration <a href='https://www.coincashew.com/coins/overview-eth/testnet-hoodi/step-2-configuring-node'>here</a>. <br />
<strong id='footnote-11'>11</strong>. CoinCashew demonstrates SSH authentication <a href='https://www.coincashew.com/coins/overview-eth/testnet-hoodi/step-2-configuring-node#hardening-ssh-access'>here</a>. <br />
<strong id='footnote-12'>12</strong>. See <a href='https://jlopp.github.io/metal-bitcoin-storage-reviews/'>Metal Bitcoin Seed Storage Reviews</a> by Jameson Lopp. <br />
<strong id='footnote-13'>13</strong>. StakingRewards has a live rewards calculator <a href='https://www.stakingrewards.com/earn/ethereum-2-0/'>here</a>.   <br />
