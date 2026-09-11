---
id: builder
title: Configure MEV Builder
sidebar_label: Configure MEV Builder
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { PreGloasBuilderFlow, GloasBuilderFlow } from '@site/src/components/BuilderFlowDiagrams.js';

:::caution

This guide is for advanced Prysm users to configure their client for the purposes of extracting [MEV](https://ethereum.org/en/developers/docs/mev/). 
There are risks to using a builder which may result in missed rewards, missed proposals, censored transactions or omitted transactions. The Prysm team does not provide guidance on which builders/relays are recommended but lists are available for you to make a judgment based on your own values. 

:::

:::info Which section applies to you

This page covers two eras of external block building. **From the Gloas fork onward**, builders are in-protocol actors you configure on the validator client — see [Configuring builders from the Gloas fork onward](#configuring-builders-from-the-gloas-fork-onward). **Until your network reaches the fork epoch**, block building runs through MEV-Boost and relays, covered in [Before the Gloas fork](#before-the-gloas-fork-mev-boost-and-relays) at the end of this page.

**Already running a builder?** Your v1 builder settings stop applying at the fork. [Preparing for the Gloas fork](#preparing-for-the-gloas-fork) is the one change you need to make, and it is safe to do now.

:::

{/* TRANSITIONAL SECTION - safe to delete once every network Prysm supports has passed
    the Gloas fork epoch. Nothing here is unique: the durable migration reference is
    "Migrating from v1 to v2" in configure-prysm/proposer-settings.md. Deleting this section
    also makes the call-to-action in the banner above unnecessary. */}

## Preparing for the Gloas fork

If you run a builder today, switching to v2 builder settings is the one change you need to make before your network reaches the fork epoch. What changes and why is explained in [Configuring builders from the Gloas fork onward](#configuring-builders-from-the-gloas-fork-onward) below.

:::warning v1 builder settings are not carried across the fork

`enabled` and the builder-level `gas_limit` are **dropped at the fork epoch** and replaced with defaults — they are not translated into their v2 equivalents. A validator that has not migrated keeps proposing perfectly well, but self-builds every block with no builder configured, and follows the network's default gas limit. Fee recipients and graffiti are unaffected either way.

:::

Migrating early is safe, and there is no flag day. A v2 file changes nothing about how your validator behaves before the fork: a non-empty `builders` list keeps each key registered with your relay exactly as `enabled: true` did, your beacon node keeps using `--http-mev-relay`, and the builder URLs you list are not contacted until the fork epoch.

### 1. Replace the registration toggle with a builders list

<Tabs groupId="migrate-v1-v2" defaultValue="v1" values={[
        {label: 'v1 (today)', value: 'v1'},
        {label: 'v2', value: 'v2'}
    ]}>
  <TabItem value="v1">

```json
"builder": {
  "enabled": true,
  "gas_limit": "60000000"
}
```

  </TabItem>
  <TabItem value="v2">

```json
"gas_limit": "60000000",
"builder": {
  "builders": [
    { "url": "https://builder-a.example" }
  ]
}
```

  </TabItem>
</Tabs>

A non-empty list is the v2 spelling of `enabled: true`. For keys you want to keep *off* builders, `"builders": []` is the spelling of `enabled: false` — do not simply delete the `builder` object, because an absent object makes the key inherit `default_config` instead.

### 2. Move the gas limit up a level, or drop it

`gas_limit` now sits beside `fee_recipient` rather than inside `builder`. Most operators should delete it instead of moving it: with no explicit value the key follows the network's scheduled gas limit ([EIP-8261](https://eips.ethereum.org/EIPS/eip-8261)) automatically.

### 3. Decide your trust posture per builder

`max_execution_payment` controls whether a builder's *promised* execution payment counts toward its bid. Left unset you stay trustless, but builders whose bids lean on that payment will rarely beat your local block. Set above zero and bids can win on money the protocol does not guarantee — read [Trusting builders](/configure-prysm/proposer-settings.md#trusting-builders-max_execution_payment) before you pick a number, and prefer setting it per builder entry rather than config-wide.

### 4. Restart and read the startup warnings

Prysm reports what it made of your file: whether it inferred v2, whether legacy fields are still present, whether any builder entry was dropped, and which entries have no `max_execution_payment`. The [startup warnings table](/configure-prysm/proposer-settings.md#startup-warnings-explained) maps each message to the action it calls for.

For the full field-by-field mapping, worked JSON and YAML examples, and the keymanager equivalents, see [Migrating from v1 to v2](/configure-prysm/proposer-settings.md#migrating-from-v1-to-v2).

### After your network forks

Once the fork epoch has passed you can drop `--http-mev-relay`, `--enable-builder` and `--suggested-gas-limit`, and shut down MEV-Boost — see the [flag table](/configure-prysm/proposer-settings.md#flag-changes-and-deprecations) for what each one is replaced by.

## Configuring builders from the Gloas fork onward

The [Gloas](https://eips.ethereum.org/EIPS/eip-7732) fork enshrines proposer-builder separation (ePBS) into the protocol. Builders stop being off-chain services fronted by relays and become on-chain actors with their own indices, public keys, and staked balances that back their bids. The MEV-Boost flow it replaces — relays, blinded blocks, validator registration, the `--http-mev-relay` flag — operates until the fork epoch and then retires; it is documented in [Before the Gloas fork](#before-the-gloas-fork-mev-boost-and-relays).

### What changes at a glance

| | Before Gloas (MEV-Boost) | After Gloas (in-protocol) |
|---|---|---|
| Builder market | Off-chain builders behind relays | On-chain builders with staked collateral |
| Where configured | Beacon node `--http-mev-relay` + validator registration | Validator client [v2 proposer settings](/configure-prysm/proposer-settings.md) or the [keymanager builder API](/configure-prysm/proposer-settings.md#keymanager-apis); no beacon node builder flag |
| Choosing builders | Whatever the relay forwards | You list builder endpoints per key, optionally pinned to specific builder pubkeys |
| Payment | Builder pays fee recipient inside the payload; relay reputation is the guarantee | Bid `value` is backed by the builder's on-chain balance and settled by the protocol; optional extra `execution_payment` is a promise you must explicitly opt into trusting |
| Local fallback | Circuit breaker + value comparison | Still there: local execution client remains mandatory, bids compete against your local block, and a per-builder circuit breaker blacklists builders that fail to deliver |
| Registration | Periodic `registerValidator` calls via relay | Validator client signs builder preferences and the beacon node delivers them to your configured builders ahead of proposals |

### How a Gloas proposal uses builders

<GloasBuilderFlow />

1. **Configure builders on the validator client.** List builder endpoints per key (or in `default_config`) in [version 2 proposer settings](/configure-prysm/proposer-settings.md), or manage them at runtime through the keymanager `builder_config` endpoints. No beacon node flag is involved.
2. **The validator client signs its preferences and the beacon node delivers them.** Ahead of each upcoming proposal the validator client signs builder request authentications with the validator key and sends its preferences — such as the maximum execution payment it will accept — to the beacon node, which forwards them to each configured builder over the builder API. The validator client never contacts a builder itself.
3. **The beacon node collects bids.** At proposal time the beacon node — not the validator client — requests execution payload bids from each configured builder endpoint under a strict timeout, and also considers bids seen on the P2P network. Every bid is validated against the same rules the chain enforces: the builder must be active with enough staked balance to cover its bid, and the bid must match your slot, parent block, fee recipient, and gas limit preference.
4. **Bids compete against your local block.** Each bid is valued at its protocol-backed `value` plus its promised `execution_payment` capped by your `max_execution_payment` (unset means promised payments count for nothing), filtered by your `min_bid`, scaled by your `builder_boost_factor`, and compared against the locally built payload. Ties go to the local block. See [How a bid is valued](/configure-prysm/proposer-settings.md#how-a-bid-is-valued).
5. **The winning builder reveals the payload.** Your validator proposes a block committing to the winning bid, and the beacon node submits that signed block to the winning builder; the builder then reveals the execution payload later in the slot, and the protocol settles the bid `value` from the builder's balance to your fee recipient. If you self-built, your block carries the local payload from your execution client as usual.
6. **Failures are contained.** A builder that wins the auction but fails to reveal the payload costs the slot its execution payload; Prysm records the failure and temporarily blacklists that builder, ignoring its bids and not propagating them.

### What you still need to run

- Keep your execution client. Local block building remains the fallback and the baseline that builder bids must beat.
- If you run several beacon nodes per validator client, note the `--stateless` validator flag (forced on automatically in that setup): the validator requests the block and execution payload envelope together and republishes the envelope itself, since only the beacon node that built a block can reveal its payload.

## Frequently asked questions

#### Do I need to run my execution client while using a custom builder?
Yes, the execution client will perform standard tasks and also be the fallback mechanism if the builder is not working correctly. 

#### Do I need MEV-Boost or relays after the Gloas fork?
No. The relay/MEV-Boost flow ends at the fork epoch. External block building afterwards happens through in-protocol builders configured in [v2 proposer settings](/configure-prysm/proposer-settings.md) — and if you configure none, your validator simply self-builds every block.

#### I use MEV-Boost today and do nothing before the fork. What happens?
Your setup keeps working right up to the fork epoch. At the fork, v1 builder settings (and the `--enable-builder` and `--suggested-gas-limit` flags) stop applying — Prysm logs warnings — and your validator falls back to self-building local blocks with default settings. That's safe, just builder-less: to keep using external builders, migrate to [v2 proposer settings](/configure-prysm/proposer-settings.md#migrating-from-v1-to-v2).

#### After Gloas, is using a builder still a trust decision?
Less than before, but yes where you opt in. A bid's `value` is backed by the builder's staked balance and settled by the protocol, and a builder that withholds a payload is blacklisted by the circuit breaker. But any `execution_payment` above the protocol-backed value is only a promise: it counts toward bids solely up to the `max_execution_payment` you configure, so treat that field as the amount of trust you extend to a builder. See [Trusting builders](/configure-prysm/proposer-settings.md#trusting-builders-max_execution_payment).

{/* LEGACY SECTION - everything from here to the end of the page describes the pre-Gloas
    MEV-Boost flow. Delete the whole block once every network Prysm supports has passed the
    Gloas fork epoch, along with PreGloasBuilderFlow in src/components/BuilderFlowDiagrams.js
    and its import above. No content outside this block depends on it. */}

## Before the Gloas fork: MEV-Boost and relays

Everything from here to the end of the page describes external block building **before the Gloas fork**: relays, MEV-Boost, periodic validator registration, and the `--http-mev-relay` flag. It applies until your network reaches the fork epoch, after which this flow no longer runs and the section is removed.

:::warning Configuring a builder here? Migrate it to v2

The settings described in this section stop applying at the fork epoch. Switching to [v2 builder settings](#preparing-for-the-gloas-fork) changes nothing about the MEV-Boost setup below — registration, relays and `--http-mev-relay` all keep working — and it is what carries your builder configuration across the fork.

:::

## Learn about the Builder Lifecycle

<details>
  <summary>Builder lifecycle</summary>
  <div>
    <ol>
      <li> 
        Sign a validator registration request: This request contains validator <strong>proposer_settings</strong> with fields like <strong>fee_recipient</strong>, <strong>gas_limit</strong> and the current timestamp to be signed.
      </li>
      <li> 
       Submit signed validator registrations to the builder: call the  <a
              href="https://ethereum.github.io/beacon-APIs/?urls.primaryName=dev#/Validator/registerValidator"
              target="_blank"
              rel="noreferrer noopener">
              beacon API endpoint
            </a> which calls a <a
              href="https://ethereum.github.io/builder-specs/#/Builder/registerValidator"
              target="_blank"
              rel="noreferrer noopener">
              builder API endpoint
            </a> on the builder for the registration. Some relays will allow you to query which validators are registered currently.
      </li>
      <li> 
       Validator selected as a block proposer: extracting MEV will only be applicable when your validator has its turn to propose a block. 
      </li>
      <li> 
        Check if the builder is configured: The beacon node does a check to see if the builder is properly configured and the proposing validator is registered. You will not be able to retrieve a blinded block if you do not pass the builder configuration check.
      </li>
      <li> 
        Get and verify a blinded block: If the builder is configured, the beacon node will call the <a
              href="https://ethereum.github.io/builder-specs/#/Builder/getHeader"
              target="_blank"
              rel="noreferrer noopener">
              builder API
            </a> to get a payload header which is used to produce the blinded block. There are several steps of verification in this process.
      </li>
      <li> 
        Sign the blinded block: once the blinded block passes internal validation it is signed. At this point, the validator will no longer have the power to propose a block other than the builder's block or risk being slashed as the builder holds the validator's signature. 
      </li>
      <li> 
        Submit the blinded block to the builder to get the full execution payload: the signed blinded block is returned to the builder via the <a
              href="https://ethereum.github.io/builder-specs/#/Builder/submitBlindedBlock"
              target="_blank"
              rel="noreferrer noopener">
              builder API
            </a> for the full payload. When the builder gets the signed blinded block, it broadcasts the signed un-blinded block to the network, <strong>then</strong> it sends back the signed unblinded block to the proposer.
      </li>
      <li> 
        Unblind the block with the full payload: using the response of the builder, the blinded block can be converted into a full block with the full execution payload.
      </li>
      <li> 
        Broadcast the full block: the full block at this point is broadcasted to the network.
      </li>
    </ol>
    <p>
    In case of failures in the validator, such as bad connections or incorrect configurations, the beacon node will attempt to fall back to local execution, reconnecting to a regular execution client to ensure proper block processing.
    </p>
  </div>
</details>

## Builder configuration

<PreGloasBuilderFlow />

<Tabs
  groupId="configure-builder"
  defaultValue="add"
  values={[{label: 'Add Builder', value: 'add'},{label: 'Remove Builder', value: 'remove'}]}>
<TabItem value="add">

## 1. Validator Client: register validator

To `register` the validator against the builder and enable the use of custom builders, the `proposer-settings` will need to be configured.

It is **recommended** to configure with the validator client with the `--suggested-fee-recipient` and `--enable-builder` flags. All validators will be registered periodically by using the `--enable-builder` flag.
**note:**  `--proposer-settings-file` or `--proposer-settings-url` flags with builder settings will override values provided from `--suggested-fee-recipient` and `--enable-builder`flags.

:::warning `--enable-builder` and `--suggested-gas-limit` are legacy

If you have already migrated to [version 2 proposer settings](/configure-prysm/proposer-settings.md), a non-empty `builders` list opts a key into this periodic registration before the fork (an explicit empty list opts it out), so you don't need `--enable-builder` alongside a v2 file.

On Gloas-ready Prysm releases both flags produce pre-fork content only: they still drive MEV-Boost registrations until the fork, but they never override v2 proposer settings, and Prysm warns that they have no effect after it. See the [v1 to v2 field mapping](/configure-prysm/proposer-settings.md#what-replaces-what) for what replaces them.

:::


## 2. Beacon Node: connect to the builder

To use a builder the beacon node needs to start with the following configuration:

- `--http-mev-relay` flag pointed to any [Builder API](https://ethereum.github.io/builder-specs/) compatible endpoint. The most common use case is to target a [MEV-Boost](https://boost.flashbots.net/) instance. A less common use case is to directly target a relay ([5. Builder: connected via relay URL](#5-builder-connected-via-relay-url)).

Each relay's URL will correspond to a specific network and will need to be chosen accordingly, i.e., running a beacon node on mainnet will require the mainnet relay.


## 3. Is builder configured?

When a validator is proposing a block, the following is checked before attempting to use the builder through the relay:
- `--http-mev-relay` flag was provided and is pointed to MEV-Boost or an active relay of the correct network
- circuit breaker is not triggered 
- validator is registered (beacon API was successfully called and validator registration info is stored in the beacon node's db)

If all checks are satisfied, then we go to [Step 5](#5-builder-connected-via-relay-url) which will be used to get the execution payload (which contains the transactions) and build a blinded block. However, if the checks do not pass, then the beacon node will proceed to [Step 4](#4-local-execution-client-kept-in-sync-and-up-to-date).

## 4. Local execution client: kept in sync and up to date

Local execution clients such as Geth or Nethermind must continue to run as usual even while using a builder and will be used in case the builder does not pass the `Is Builder Configured?` check. The execution client should be synced and running alongside your beacon node, and earnings from the block will be compared to the earnings from the builder's payload. If the local execution payload fails then the entire function will fail.

## 5. Builder: connected via relay URL

The EthStaker community provides a list of some of the relays that can be used as well as any censorship they may have [here](https://github.com/eth-educators/ethstaker-guides/blob/main/MEV-relay-list.md). You can also run your own relay locally such as MEV-Boost but each relay on the list will have their own instructions on how to run it. If running your own relay, instead of using a provided URL due to latency, you will simply need to update the `--http-mev-relay` flag on your beacon node with the appropriate URL for the specific network in use. The relay will connect to a builder which connects to block searchers. 

:::info

Make sure you are using the correct version that supports the current version of the beacon node. Hard-forks will typically require updates to relays.

:::

</TabItem>
<TabItem value="remove">

## 1. Validator Client: unregister validator

Update the following configurations and restart the validator client to stop the periodic registration of the validator. 
- remove the `--enable-builder` flag.
- remove the `--suggested-gas-limit` flag, though it should already be disabled once removing the `--enable-builder` flag.
- remove all wanted references of the `builder` field from the associated file/json for the validators you no longer want to register within the `--proposer-settings-file` and `--proposer-settings-url` flag.

On [version 2 proposer settings](/configure-prysm/proposer-settings.md), prefer setting `"builders": []` on the keys you want to unregister rather than deleting the `builder` object. An explicit empty list means "use no builders" — it opts the key out of registration before the fork and out of builder bids after it. Deleting the object instead makes the key inherit whatever `default_config` says, which may be the opposite of what you want.

## 2. Beacon Node: remove builder related flags

The following flag should be removed to disable builder use on the beacon node:
 - `--http-mev-relay` flag

:::info

The [register validator Beacon API](https://ethereum.github.io/beacon-APIs/?urls.primaryName=dev#/Validator/registerValidator) will also stop working with the removal of the `--http-mev-relay` flag and will no longer know the URL to MEV-Boost or the active relay.

:::

The following flags will be disabled after this flag is removed, and can safely be removed:
 - `--max-builder-consecutive-missed-slots`
 - `--max-builder-epoch-missed-slots`
 - `--local-block-value-boost`

## 3. Is builder configured?

Once the appropriate flags are fully removed this check shouldn't pass and will fall back to local execution.

## 4. Local execution client: kept the same

The execution client can safely continue to run "as-is" with no changes. Once the validator client and beacon node have their settings updated and restarted without builder changes, blocks will continue to be produced through with the payloads from local execution.

## 5. Builder: remove relay URL

removing the `--http-mev-relay` flag from the beacon node will disconnect the builder. Once removed, you can safely turn off your builder related services such as your MEV-Boost or relays.

</TabItem>
</Tabs>

## Advanced Validator Client Configurations

### Advanced Validator Registration
There are other ways to configure your validator registrations for more granular control on which validator keys should be registered to use the custom builder and which ones should use local execution.
In these cases you would replace the `--suggested-fee-recipient` flag with  `--proposer-settings-file` flag or `--proposer-settings-url` flag.
- if configuring with the `--proposer-settings-file` flag and provide it with a suitable JSON or YAML file. This file should include the necessary configuration for the builder. For detailed guidance and an example of this configuration, refer to the [Proposer settings](/configure-prysm/proposer-settings.md) reference.
 - if configuring with the `--proposer-settings-url` flag provide a url that returns the JSON response with the suitable proposer-settings. A guide and example on this configuration can be found in the [Proposer settings](/configure-prysm/proposer-settings.md) reference.
 - if configuring with the `--proposer-settings-file` or `--proposer-settings-url` flag with no builder settings but providing the `--enable-builder` flag instead. Optionally, you can also add the `--suggested-gas-limit` to adjust the default gas limit for the builder, this only applies with `--enable-builder`. Both flags are legacy, pre-fork content — see the [warning above](#1-validator-client-register-validator) and the [v1 to v2 field mapping](/configure-prysm/proposer-settings.md#what-replaces-what).
 
:::info

Validators updated through the [Keymanager-API's](/apis/keymanager-api.md) fee recipient APIs will take on the default `proposer-settings` provided.

If the `--enable-builder` flag is used without providing `--suggested-fee-recipient`, `--proposer-settings-file`, or `--proposer-settings-url` it will override builder settings from the db if proposer settings are saved, or it will set default builder settings and only save to the db if fee-recipient settings are saved through the keymanager APIs.

The validator client utilizes `proposer-settings` to interact with the beacon node's [Beacon API](https://ethereum.github.io/beacon-APIs/?urls.primaryName=dev#/Validator/registerValidator). Subsequently, the beacon node calls the builder by making use of the [Builder API](https://ethereum.github.io/builder-specs/#/Builder/registerValidator).

Registration against the builder will only occur for active validators. Registration for eligible validators occurs at the beginning of the validator clients execution and at the middle of each epoch. It is important to note that the success of the API is not guaranteed, and the client will attempt registration again at the middle of each epoch.

The beacon node must also be configured to enable the builder via the `--http-mev-relay` flag.

:::

## Advanced Beacon Node Configurations

### Circuit breaker

The circuit breaker is a safety feature for falling back to local execution when using a builder.
This occurs when the builder or client using the builder endpoints encounters issues that cause missed blocks. 
By default, the circuit breaker will be triggered after three slots are consecutively missed or five slots are missed in an epoch, but this can be configured through the `--max-builder-consecutive-missed-slots` and `max-builder-epoch-missed-slots` flags.

:::note

This circuit breaker guards the pre-fork relay flow. After the Gloas fork the protection becomes per-builder rather than global: a builder that wins an auction and then fails to reveal its payload is recorded and temporarily blacklisted, so its bids are neither used for block production nor propagated, and your proposal falls back to the local block. These two flags apply to the pre-fork flow only.

:::

### Registration cache

Validator registrations for Builder APIs are stored in a cache by default as of `4.0.7` instead of bolt db when starting the beacon node. The cache will enable:
  - in-memory storage of the validator registrations, this clears all validator registrations on restart.
This feature solves the unintended issue of wanting some validators unregistered while maintaining MEV-Boost on others. In the future the db used to store registrations will be removed completely and the flag will no longer be required for this feature. Validator settings will be persisted on the validator client side.

`--disable-registration-cache` flag can be used on the beacon node to fall back onto the using the bolt db. 

:::note

Values stored in the bolt db will not be cleared and you will not be able to unregister validators unless using the cache and restarting.

:::

### Prioritizing local blocks

`--local-block-value-boost` flag is a `uint64` value that provides an additional percentage to multiply the local block value. Use builder block if: `builder_bid_value * 100 > local_block_value * (local-block-value-boost + 100)`. This will encourage your setup to use the local execution if the value earned is not above your threshold, helping to mitigate censorship concerns. After the Gloas fork, the equivalent control is the per-key `builder_boost_factor` in [proposer settings](/configure-prysm/proposer-settings.md).

## Frequently asked questions: MEV-Boost

The provided guide offered explanations on configuring the Prysm client to utilize a [custom builder](https://docs.flashbots.net/flashbots-mev-boost/block-builders) through a [relay](https://docs.flashbots.net/flashbots-mev-boost/relay). The relay acts as a middleware that connects validators to block builders. This configuration involves both the validator client and the beacon node. It's important to note this guide does not cover setting up your own relay, builder, or MEV-Boost software. 

:::info

In the Prysm client, the builder is used through the relay to get transactions that maximize the validator's benefits, prioritizing them over local ones. However, the execution client will still be necessary as a fallback option in case any issues arise while utilizing the builder. The builder will only come into play when there is a validator proposal.

:::

#### What are the risks of running Prysm with a custom builder instead of using local execution?
The custom builder, whether connected through MEV-Boost or as a relay URL, will need to be updated consistently with Prysm, adding another layer of complexity. Depending on the relay used some rewards may be missed due to the relay's connectivity or any builder bugs. Transactions may be censored under certain conditions.

#### How do I recover if the circuit breaker is triggered?
Once the circuit breaker is triggered, local execution will continue to be used until both conditions: max consecutive slots missed and slots missed in epoch are no longer true. The beacon node does not need to be restarted.

#### What happens if the execution client goes down while connected to the builder?
The earnings from the local execution payload will be compared to the bid from the builder payload and will error if local execution is offline or unavailable. 

#### My setup is no longer using the builder. What happened?
There are multiple reasons why this could happen, including an incorrect relay URL, a relay that is offline or outdated compared to your Ethereum node setup, or a possible bug. Additionally, it's possible that the circuit breaker has been activated.

#### What if the earnings from the builder are lower than from local execution?
The block from local execution will be used. This could also be triggered through `--local-block-value-boost` if the earnings from the builder don't pass some percentage threshold.
