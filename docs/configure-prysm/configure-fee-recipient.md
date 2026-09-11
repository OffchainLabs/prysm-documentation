---
id: fee-recipient
title: Configure Fee Recipient 
sidebar_label: Configure Fee Recipient
---
import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget commaDelimitedContributors="James" />

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


:::tip Configure this or lose money

If you don't configure your fee recipient wallet address, your priority fee earnings will be deposited into a [burn address](https://etherscan.io/address/0x0000000000000000000000000000000000000000).

:::

**Fee Recipient** is a feature that lets you specify a priority fee recipient address on your validator client instance and beacon node.

Your fee recipient wallet address is a **standard Ethereum wallet address**, just like the wallet address used when sending and receiving tokens from MetaMask. Execution clients deposit priority fees into this address whenever your validator client proposes a new block.

## Background

When users pay gas to submit transactions to the Ethereum network, they can specify a **priority fee**. Priority fees are like tips. End-users pay priority fees to incentivize block proposers to prioritize the inclusion of particular transactions in the blocks that they propose.

Priority fees are captured by execution clients in the execution layer <a className="footnote" href='#footnote-1'>[1]</a>, so validator clients need to tell execution clients where to forward the fees. This "forwarding address" is referred to as your **fee recipient** wallet address.


## Configure fee recipient

Your fee recipient wallet address can be configured on your **validator client instance** and on your **beacon node**. We recommend configuring it in both places. Your validator's configuration will override the beacon node configuration, while the beacon node configuration will be treated like a backup in the event that your validator configuration fails.


### Configure fee recipient via flags

Your fee recipient wallet address can be configured on both your beacon node and validator through the `--suggested-fee-recipient` flag:

 **Beacon node:** 

```sh
./prysm.sh beacon-chain --suggested-fee-recipient=<WALLET ADDRESS>
```

 **Validator client:**
 
 ```sh
./prysm.sh validator --suggested-fee-recipient=<WALLET ADDRESS>
```


For example:
```sh
./prysm.sh validator --suggested-fee-recipient=0xCHANGEME012345c769F504hs287200aF50400a
```

If your validator is running multiple keys (for example, staking 64 `ETH` using two validator public keys that have been imported into a single validator client instance), all validator public keys will use the wallet address specified through the `--suggested-fee-recipient` flag. You can optionally associate different fee recipient wallet addresses to individual validator public keys using the JSON/YAML configuration method detailed in the following section.


### Configure fee recipient via JSON/YAML (validator client only)

You can assign different wallet addresses to each of your validator public keys using JSON/YAML configuration. Fee recipient address assignments specified through JSON/YAML override those configured through the `--suggested-fee-recipient` flag. This JSON/YAML file is called the **proposer settings** file — fee recipient is one of several per-validator preferences it can carry (gas limit, graffiti, and builder configuration are the others). This page covers the fee recipient fields; see [Proposer settings](/configure-prysm/proposer-settings.md) for the complete reference, including the version 2 schema used for Gloas builder configuration.

The configuration uses the following JSON/YAML schema:


<Tabs groupId="format" defaultValue="json" values={[
        {label: 'JSON', value: 'json'},
        {label: 'YAML', value: 'yaml'}
    ]}>
  <TabItem value="json">


```
{
  "proposer_config": {
    "<VALIDATOR PUBLIC KEY>": {
      "fee_recipient": "<WALLET ADDRESS>"
    },
    "<VALIDATOR PUBLIC KEY>": {
      "fee_recipient": "<WALLET ADDRESS>"
    }
  },
  "default_config": {
    "fee_recipient": "<WALLET ADDRESS>"
  }
}
```


   </TabItem>
   <TabItem value="yaml">


```
---
proposer_config:
  '<VALIDATOR PUBLIC KEY>':
    fee_recipient: '<WALLET ADDRESS>'
  '<VALIDATOR PUBLIC KEY>':
    fee_recipient: '<WALLET ADDRESS>'
default_config:
  fee_recipient: '<WALLET ADDRESS>'
```


   </TabItem>
</Tabs>

Property definitions are as follows:

 - `proposer_config`: An object containing key-value pairs, where member keys are validator public keys.
 - `<VALIDATOR PUBLIC KEY>`: A validator public key (98 characters long - not a wallet address) used as a JSON property key. Example: `0x0123456748ed887f6c4c6adf334070efcd75140eada5ac83a92506dd7a057816155ad77931185101128655c0191bd0214`.
 - `fee_recipient`: A fee recipient wallet address. Example: `0x52FfeB84540173B15eEC5a486FdB5c769F50400a`.
 - `default_config`: An object containing a default fee recipient wallet address. Validator public keys not specified in `proposer_config` will use this wallet address.


The above example demonstrates configuring two 1:1 mappings between `validator public key`:`fee_recipient` and a default `fee_recipient`. In this case, the `default_config` fee recipient address would apply to all validator public keys not specified in `proposer_config`, and will override any wallet address specified by the `--suggested-fee-recipient` flag.

Tell your validator to use the JSON/YAML configuration through one of the following flags: 

 - `proposer-settings-file`: Points to a local JSON/YAML file. 
 - `proposer-settings-url`: Points to a remote JSON/YAML configuration endpoint in URL format. JSON should be delivered as a JSON payload, not as a JSON file. Your client will issue a GET request and expects the response <code>Content-Type</code> header to be <code>application/json</code>



### Advanced: Configure gas limit, graffiti, and builders

In the previous section, we reviewed a sample JSON/YAML file. The same file can optionally carry further per-validator preferences — a gas limit, graffiti, and builder configuration:

<Tabs groupId="format" defaultValue="json" values={[
        {label: 'JSON', value: 'json'},
        {label: 'YAML', value: 'yaml'}
    ]}>
  <TabItem value="json">


```
{
  "proposer_config": {
    "<VALIDATOR PUBLIC KEY>": {
      "fee_recipient": "<WALLET ADDRESS>",
      "gas_limit": "60000000",
      "graffiti": "<GRAFFITI STRING>",
      "builder": {
        "builders": [
          { "url": "<BUILDER URL>" }
        ]
      }
    },
    "<VALIDATOR PUBLIC KEY>": {
      "fee_recipient": "<WALLET ADDRESS>",
      "builder": {
        "builders": []
      }
    }
  },
  "default_config": {
    "fee_recipient": "<WALLET ADDRESS>"
  }
}
```


   </TabItem>
   <TabItem value="yaml">


```
---
proposer_config:
  '<VALIDATOR PUBLIC KEY>':
    fee_recipient: '<WALLET ADDRESS>'
    gas_limit: '60000000'
    graffiti: '<GRAFFITI STRING>'
    builder:
      builders:
        - url: '<BUILDER URL>'
  '<VALIDATOR PUBLIC KEY>':
    fee_recipient: '<WALLET ADDRESS>'
    builder:
      builders: []
default_config:
  fee_recipient: '<WALLET ADDRESS>'

```


   </TabItem>
</Tabs>


New property definitions are as follows:

 - `gas_limit`: The gas limit your validator advertises as its preference for blocks built on its behalf. Most users should leave this unset: your validator then follows the network's scheduled gas limit (currently defaulting to `60000000`) automatically. Set it only to deliberately opt out of the network schedule. In v1 files the gas limit lived inside `builder`; that placement is legacy and stops applying at the Gloas fork.
 - `graffiti`: An optional graffiti string included in blocks proposed by this key.
 - `builder`: An object configuring external block builders for this key. Applicable only if you want to use custom block builders — if you don't, you can omit it. In the example above, the first key requests bids from one builder, the second key explicitly opts out of builders (an empty `builders` list means self-build only), and all other keys use the default configuration. Before the Gloas fork, a non-empty `builders` list also opts the key into MEV-Boost validator registration, and an empty list opts it out. The builder object has several more fields — including `max_execution_payment`, which controls how much you trust a builder's promised payments — documented in the [Proposer settings](/configure-prysm/proposer-settings.md) reference. Read [Trusting builders](/configure-prysm/proposer-settings.md#trusting-builders-max_execution_payment) before setting trust-related fields.

:::note Legacy v1 builder fields

Older files may still use the legacy builder fields `enabled` (the MEV-Boost validator registration toggle) and a builder-level `gas_limit`. These keep working until the Gloas fork and are then dropped and replaced with defaults. Prysm reads the schema from the fields you use, so switching to `builders` is the whole migration — an explicit `version` field is optional. See [Migrating from v1 to v2](/configure-prysm/proposer-settings.md#migrating-from-v1-to-v2).

:::




## Frequently asked questions

#### How do I know if fee recipient was properly configured?
If you don't see any errors after issuing one of the above commands, your fee recipient address has been successfully configured.

#### What happened to `fee-recipient-config-file`?
`fee-recipient-config-file` and `fee-recipient-config-url` flags are deprecated and have been replaced with `proposer-settings-file` and `proposer-settings-url` flags as of Prysm v2.1.3.

#### How do I ensure that builders receive my fee recipient wallet address?
Before the Gloas fork, builders learn your fee recipient through MEV-Boost validator registration: with `--enable-builder` set (or a non-empty `builders` list in v2 proposer settings), your validator registers periodically using the fee recipient from the flag or JSON/YAML configuration. After the Gloas fork, your fee recipient is enforced directly — builder bids that don't name your configured fee recipient are rejected before your validator will use them.

#### When should I set my own `gas_limit`, and how do I know what to set?
Most users should not set one. When `gas_limit` is unset, your validator follows the network's scheduled gas limit ([EIP-8261](https://eips.ethereum.org/EIPS/eip-8261)), falling back to the chain default (currently `60000000`). Set an explicit value only to deliberately opt out of the schedule — Prysm will warn when your value is above or below the scheduled one. Note that in version 2 proposer settings `gas_limit` sits at the same level as `fee_recipient`, not inside `builder`; see [Proposer settings](/configure-prysm/proposer-settings.md).



------------------

Footnotes:

<strong id="footnote-1">1.</strong> See [Nodes and networks](/learn/concepts/nodes-and-networks.md)for a quick refresher on the fundamentals of Ethereum nodes. <br /><br />
