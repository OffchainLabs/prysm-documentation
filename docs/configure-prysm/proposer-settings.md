---
id: proposer-settings
title: Proposer settings
sidebar_label: Proposer settings
description: Reference for Prysm's proposer settings — fee recipients, gas limits, graffiti, and Gloas builder configuration — including the v2 schema, migration from v1, and flag deprecations.
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget commaDelimitedContributors="James" />

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**Proposer settings** define how your validator client proposes blocks: the fee recipient address, gas limit, graffiti, and builder configuration for each of your validator keys, plus a default that applies to every key you don't configure individually.

This page is the canonical reference for the **version 2 (v2) proposer settings schema** introduced for the [Gloas](https://eips.ethereum.org/EIPS/eip-7732) fork, which enshrines proposer-builder separation (ePBS) into the protocol. It covers every field, how values are inherited and merged, how v2 behaves on networks that haven't forked yet, what happens to v1 settings at the fork, and which flags are deprecated.

If you only need to set a fee recipient, start with [Configure Fee Recipient](/configure-prysm/configure-fee-recipient.md). For the end-to-end builder workflow (MEV-Boost today, in-protocol builders after Gloas), see [Configure MEV Builder](/configure-prysm/configure-mev-builder.md).

:::tip Update to v2

If your proposer settings file configures builders, move it to the v2 builder fields. v1 builder settings describe the MEV-Boost world: they keep working **until** the Gloas fork, and are then dropped and replaced with defaults. Fee recipients and graffiti carry over either way. You don't have to add a `version` field to do this — Prysm reads the schema from the fields you use. See [Migrating from v1 to v2](#migrating-from-v1-to-v2).

:::

## Why there is a v2

Before Gloas, external block building happens outside the protocol: validators register with relays (MEV-Boost), and the beacon node requests blinded blocks from a relay. The v1 proposer settings schema reflects that world — its `builder` section is essentially a registration toggle (`enabled`) plus a registration gas limit.

Gloas changes the model. Builders become on-chain actors with their own indices, public keys, and staked balances. Your validator no longer registers with a relay; instead it decides, per proposal, **which builder bids to consider and how to value them**. That requires expressing things v1 has no words for: which builders you'll talk to, how much of a builder's promised payment you're willing to trust, a minimum acceptable bid, and how to weigh builder bids against your own locally built block. The v2 schema adds those fields and moves the gas limit to its natural, builder-independent home.

v2 proposer settings are supported in Prysm releases with Gloas support (releases after v7.1.8).

## How proposer settings are supplied

Nothing changes here with v2 — the same sources work, in the same way:

- `--suggested-fee-recipient=<address>`: sets only the default fee recipient.
- `--proposer-settings-file=<path>`: a local JSON or YAML file using the schema on this page.
- `--proposer-settings-url=<url>`: a remote endpoint returning the same schema as a JSON payload (Prysm issues a GET request and expects a JSON response body).
- [Keymanager APIs](/apis/keymanager-api.md): per-key fee recipient, gas limit, graffiti, and (new) builder configuration endpoints.

`--proposer-settings-file` and `--proposer-settings-url` are mutually exclusive — the validator client refuses to start with both.

Loaded settings are persisted in the validator client database, so changes made through the keymanager APIs survive restarts. On startup, a file or URL takes precedence over what's in the database: if the source contains a `proposer_config` section, it replaces the stored per-key section entirely, and a `default_config` in the source replaces the stored default. If you manage per-key settings through the keymanager APIs, be aware that restarting with a settings file resets per-key entries to the file's contents.

## The v2 schema

A complete example configuring one validator key explicitly, with a default for all other keys:

<Tabs groupId="format" defaultValue="json" values={[
        {label: 'JSON', value: 'json'},
        {label: 'YAML', value: 'yaml'}
    ]}>
  <TabItem value="json">

```json
{
  "version": 2,
  "proposer_config": {
    "0xa057816155ad77931185101128655c0191bd0214c201ca48ed887f6c4c6adf334070efcd75140eada5ac83a92506dd7a": {
      "fee_recipient": "0x50155530FCE8a85ec7055A5F8b2bE214B3DaeFd3",
      "gas_limit": "60000000",
      "graffiti": "prysm-validator",
      "builder": {
        "min_bid": "10000000",
        "builder_boost_factor": "100",
        "builders": [
          {
            "url": "https://builder-a.example",
            "max_execution_payment": "100000000"
          },
          {
            "url": "https://builder-b.example"
          }
        ]
      }
    }
  },
  "default_config": {
    "fee_recipient": "0x6e35733c5af9B61374A128e6F85f553aF09ff89A",
    "builder": {
      "builders": []
    }
  }
}
```

  </TabItem>
  <TabItem value="yaml">

```yaml
---
version: 2
proposer_config:
  '0xa057816155ad77931185101128655c0191bd0214c201ca48ed887f6c4c6adf334070efcd75140eada5ac83a92506dd7a':
    fee_recipient: '0x50155530FCE8a85ec7055A5F8b2bE214B3DaeFd3'
    gas_limit: '60000000'
    graffiti: 'prysm-validator'
    builder:
      min_bid: '10000000'
      builder_boost_factor: '100'
      builders:
        - url: 'https://builder-a.example'
          max_execution_payment: '100000000'
        - url: 'https://builder-b.example'
default_config:
  fee_recipient: '0x6e35733c5af9B61374A128e6F85f553aF09ff89A'
  builder:
    builders: []
```

  </TabItem>
</Tabs>

In this example, the explicitly configured key will consider bids from two builders — trusting builder A's promised execution payments up to 0.1 ETH, and builder B only for what the protocol can enforce — while ignoring bids whose value to the proposer is below 0.01 ETH. Every other key in the client uses the default: self-built (local) blocks only, because `builders` is an explicit empty list.

Numeric values may be written as strings (`"60000000"`) or bare numbers (`60000000`); strings are recommended for consistency with the keymanager API wire format. All amounts (`min_bid`, `max_execution_payment`) are denominated in **gwei**.

### Top-level fields

| Field | Description |
|---|---|
| `version` | **Optional.** Schema version; `2` is the current schema. You rarely need to set it: Prysm reads a source as version 2 as soon as it contains any v2 builder field (`builders`, `min_bid`, `builder_boost_factor`, or `max_execution_payment`), logging that it did so. For a file that only sets fee recipients, gas limits, and graffiti, the version makes no difference at all — those fields behave identically in both schemas. Set it when you want the file to state its own intent, or to keep the inference log out of your startup output. |
| `proposer_config` | A map from validator BLS public key (98-character `0x`-prefixed hex) to a per-key options object. |
| `default_config` | An options object applied to every validator public key not listed in `proposer_config`. |

### Options (per key, and in `default_config`)

| Field | Description |
|---|---|
| `fee_recipient` | The Ethereum address that receives priority fees (and, after Gloas, builder payments). A per-key value overrides `default_config`, which overrides `--suggested-fee-recipient`. |
| `gas_limit` | The gas limit your validator advertises as its preference for blocks built on its behalf. **New in v2 at this level.** Leave it unset to follow the network's scheduled gas limit ([EIP-8261](https://eips.ethereum.org/EIPS/eip-8261)) or chain default — currently `60000000` — automatically. Set it only to deliberately opt out of the network schedule; Prysm logs a warning once per epoch when your explicit value is above or below the scheduled value. In v1 the gas limit lived inside `builder`; that placement is legacy and stops applying at the Gloas fork. |
| `graffiti` | Graffiti string included in blocks proposed by this key. |
| `builder` | Builder configuration for this key — see below. Omit it entirely if you only self-build. |

### The `builder` object

| Field | Description |
|---|---|
| `builders` | The list of builders this key will request bids from (see [Builder entries](#builder-entries)). **The list's presence matters**: omitting `builders` in a per-key config inherits the `default_config` list, while an explicit empty list (`[]`) means "use no builders" — self-build only — for that key. At most 64 entries; duplicate or invalid entries are dropped at load time with a warning. |
| `min_bid` | Minimum acceptable bid value in gwei, applied to the [effective value](#how-a-bid-is-valued) of a bid. Bids below the floor are ignored. Unset means no floor. Can be overridden per builder entry. |
| `max_execution_payment` | The maximum execution-layer payment, in gwei, you are willing to count toward a builder's bid. **This is a trust decision — read [Trusting builders](#trusting-builders-max_execution_payment) before setting it.** Unset or `0` means trustless-only. Can be overridden per builder entry. |
| `builder_boost_factor` | Percentage multiplier applied to builder bid values when comparing them against your locally built block. `100` (the default) is neutral, values above `100` favor builders, values below `100` favor local blocks, and `0` means builder bids can never win. Can be overridden per builder entry. |
| `enabled` | **Legacy (v1).** Opts the key into MEV-Boost validator registration before the Gloas fork. Ignored by the v2 builder flow and dropped at the fork. In v2 files, a non-empty `builders` list serves this purpose pre-fork — see [Before the fork](#running-v2-settings-before-the-gloas-fork). |
| `gas_limit` | **Legacy (v1).** The pre-Gloas registration gas limit. In v2, set `gas_limit` at the option level (next to `fee_recipient`) instead. |

The v1 `relays` field has been removed from the schema. A file that still contains it loads fine — the field is simply ignored.

### Builder entries

Each entry in a `builders` list describes one builder your validator is willing to request bids from:

| Field | Description |
|---|---|
| `url` | **Required.** The builder's HTTP endpoint (up to 2048 bytes). Entries with the same `url` and auth data are deduplicated. |
| `min_bid` | Per-entry override of the enclosing config's `min_bid`. |
| `max_execution_payment` | Per-entry override of the enclosing config's `max_execution_payment`. Setting trust ceilings per entry, rather than config-wide, is the recommended pattern. |
| `builder_boost_factor` | Per-entry override of the enclosing config's `builder_boost_factor`. |
| `pubkeys` | Optional allowlist of builder BLS public keys. When set, only bids signed by these on-chain builder identities are accepted from this entry; when omitted, any active builder responding at the URL is accepted. (The keymanager API calls this field `builder_pubkeys`.) |
| `auth_data` | Optional opaque bytes your validator signs to authenticate its requests to this builder. When omitted, it defaults to the UTF-8 bytes of `url`, which is the spec convention — most operators never set this. At most 4096 bytes. |

Fields left unset on an entry fall back to the enclosing `builder` config, then to `default_config`'s builder config.

:::note

`pubkeys` and `auth_data` are byte fields: in a JSON/YAML settings file they take standard JSON byte encoding (base64), not hex. The [keymanager builder API](#keymanager-apis) accepts the friendlier `0x`-hex form, so prefer managing these two fields through the API.

:::

## How a bid is valued

Understanding `min_bid`, `max_execution_payment`, and `builder_boost_factor` requires knowing how Prysm picks a payload after Gloas. When your validator is about to propose, the beacon node gathers candidate execution payload bids from your configured builders (and from bids gossiped on the P2P network), plus your own locally built payload, then:

1. **Effective value.** Each builder bid carries two amounts: `value`, which is enforced by the protocol against the builder's staked on-chain balance, and `execution_payment`, an additional payment the builder promises to deliver inside the execution payload itself. The bid's effective value is `value` plus the execution payment **capped at your `max_execution_payment`**. With the cap unset or `0`, promised payments count for nothing and only the collateral-backed `value` matters. Bids that arrive over P2P gossip must carry a zero execution payment, so gossiped bids are always fully collateral-backed.
2. **Floor.** A bid whose effective value is below the applicable `min_bid` is discarded.
3. **Validity.** Bids are checked the same way the chain will check them: the builder must be active and able to cover the bid's `value` from its balance, the bid must target your slot, parent block, fee recipient, and gas limit preference, and the signature must verify. Builders temporarily blacklisted by the circuit breaker (for winning an auction and then failing to reveal the payload) are skipped.
4. **Comparison.** Each surviving bid's effective value is multiplied by its `builder_boost_factor` divided by 100, then compared against the value of your locally built payload and every other bid. The highest boosted value wins; ties go to the local payload.

If no builder bid wins — or none was configured — the validator self-builds using the local execution client, exactly as it does today. A synced local execution client remains mandatory.

## Trusting builders: `max_execution_payment`

:::caution This setting hands trust to a builder

A builder bid's `value` is safe by construction: the protocol verifies the builder's staked balance covers it before the bid can win, and settles the payment on-chain when the builder delivers its payload — a builder cannot bid money it doesn't have. Its `execution_payment` is **only a promise**: an amount the builder claims it will pay your fee recipient inside the payload it later reveals. The protocol neither escrows it nor checks that it is ever paid.

- Setting `max_execution_payment` above `0` means bids can win your auction on the strength of promised money. A malicious or buggy builder can outbid everyone with a large promised payment it never delivers. Treat the value as the amount of credit you extend to that builder per block, and set it per builder entry — only for builders you have a reason to trust — rather than config-wide.
- Leaving it unset (or `0`) keeps you trustless, but the flip side is that builders whose bids rely mainly on execution payments will rarely or never beat your local blocks — **your builders may effectively go unused**, and Prysm logs a warning at startup naming the builder entries this applies to.
- The maximum value `18446744073709551615` (2^64 − 1) means "accept any promised amount" and is not recommended.

Prysm has no separate opt-in flag gating this behavior: writing a non-zero `max_execution_payment` into your settings **is** the opt-in. Some other clients guard the equivalent setting behind an explicitly named flag; in Prysm, review this field with the same care you would give such a flag.

:::

## Inheritance and merge rules

Scalar builder fields (`min_bid`, `max_execution_payment`, `builder_boost_factor`) are inherited field-by-field: a per-key value wins, an unset per-key value falls back to `default_config`, and a value unset in both resolves to its neutral default (no floor, trustless-only, boost factor 100). The same logic applies one level down, from builder entries to their enclosing config.

The `builders` list is **replaced, not merged**: a per-key list (including an explicit `[]`) fully replaces the default list, and omitting the key inherits the default list unchanged. This is what makes `[]` the per-key "self-build only" opt-out.

`gas_limit` at the option level follows the same per-key-wins pattern; when unset at both levels, the network's scheduled gas limit or chain default applies.

## Running v2 settings before the Gloas fork

You can and should switch to v2 ahead of the fork. During the transition window — after upgrading Prysm but before your network reaches the Gloas fork epoch — the two builder worlds coexist, and v2 settings drive the old one by convention:

| Your v2 settings say | Pre-fork MEV-Boost behavior | Post-fork Gloas behavior |
|---|---|---|
| Non-empty `builders` list | Key is registered with MEV-Boost relays (equivalent to v1 `enabled: true`) | Bids requested from the listed builders |
| Explicit empty list (`builders: []`) | Key is **not** registered | Self-build only |
| No `builders` key, but other builder fields set (`min_bid`, etc.) | No registration signal from this key — the `default_config` choice (or none) applies | Inherits the default `builders` list |
| Legacy `enabled: true` alongside v2 fields | Key is registered | `enabled` ignored, then dropped at the fork |

In other words: listing builders in v2 keeps your MEV-Boost registrations flowing until the fork, then seamlessly becomes your Gloas builder list. Registration still uses your fee recipient and gas limit (the option-level `gas_limit` wins over a legacy builder-level one), and the beacon node's `--http-mev-relay` wiring is unchanged until the fork.

Two more transition behaviors to be aware of:

- **Version inference.** A file or URL without `version` that contains any v2 builder field is treated as version 2, with an info log, so a missing version stamp can never get your Gloas builder configuration dropped as v1 content. Inference keys off the `builder` fields only — but an option-level `gas_limit` applies regardless of schema version, so a file that sets one without any builder config needs nothing else.
- **Keymanager builder endpoints.** `GET`/`POST`/`DELETE /eth/v1/validator/{pubkey}/builder_config` respond `501 Not Implemented` on networks that have no Gloas fork scheduled, since builder configuration cannot take effect there. Once your network schedules the fork (testnets first), the endpoints go live — before the fork epoch itself.

## Migrating from v1 to v2

v1 builder settings are **not migrated automatically**, because the v1 fields answer a question ("register with relays?") that no longer exists after the fork.

### What replaces what

| What you want to express | v1 | v2 |
|---|---|---|
| Which schema this file uses | no `version` field, or `version: 1` | `version: 2` — optional, since any v2 builder field below implies it |
| Use builders for a key | `builder.enabled: true` | a non-empty `builder.builders` list |
| Don't use builders for a key | `builder.enabled: false` | `builder.builders: []`, or no `builder` object at all to inherit the default |
| Choose *which* builders | not expressible — the beacon node's `--http-mev-relay` picked one relay for every key | `builders[].url`, per key |
| Accept bids only from specific builders | not expressible | `builders[].pubkeys` |
| Authenticate your requests to a builder | not expressible | `builders[].auth_data` (defaults to the URL bytes) |
| Set a gas limit | `builder.gas_limit`, or `--suggested-gas-limit` | `gas_limit` at the option level, beside `fee_recipient` — or leave it unset to follow the network schedule |
| Ignore bids below a floor | beacon node `--min-builder-bid`, applied to every key | `min_bid`, per builder config or per entry |
| Favor your local block over builder bids | beacon node `--local-block-value-boost`, applied to every key | `builder_boost_factor`, per builder config or per entry |
| Count a builder's promised execution payment | not expressible — trust in the relay was implicit | `max_execution_payment`, per builder config or per entry; unset means trustless-only |
| List relays | `relays` | gone — relays don't exist in the Gloas builder market |
| Set a fee recipient or graffiti | `fee_recipient`, `graffiti` | unchanged |

### The same file, both ways

Here is the same intent expressed in both schemas:

<Tabs groupId="format" defaultValue="v1" values={[
        {label: 'v1 (legacy)', value: 'v1'},
        {label: 'v2', value: 'v2'}
    ]}>
  <TabItem value="v1">

```json
{
  "proposer_config": {
    "0xa057816155ad77931185101128655c0191bd0214c201ca48ed887f6c4c6adf334070efcd75140eada5ac83a92506dd7a": {
      "fee_recipient": "0x50155530FCE8a85ec7055A5F8b2bE214B3DaeFd3",
      "builder": {
        "enabled": true,
        "gas_limit": "60000000"
      }
    }
  },
  "default_config": {
    "fee_recipient": "0x6e35733c5af9B61374A128e6F85f553aF09ff89A",
    "builder": {
      "enabled": false
    }
  }
}
```

  </TabItem>
  <TabItem value="v2">

```json
{
  "version": 2,
  "proposer_config": {
    "0xa057816155ad77931185101128655c0191bd0214c201ca48ed887f6c4c6adf334070efcd75140eada5ac83a92506dd7a": {
      "fee_recipient": "0x50155530FCE8a85ec7055A5F8b2bE214B3DaeFd3",
      "gas_limit": "60000000",
      "builder": {
        "builders": [
          { "url": "https://builder-a.example" }
        ]
      }
    }
  },
  "default_config": {
    "fee_recipient": "0x6e35733c5af9B61374A128e6F85f553aF09ff89A",
    "builder": {
      "builders": []
    }
  }
}
```

  </TabItem>
</Tabs>

Migration checklist:

1. Optionally add `"version": 2`. The builder fields in the next step are what actually move the file to v2; the version field only makes that explicit.
2. Replace each `"enabled": true` with a concrete `builders` list of builder endpoints you choose, and each `"enabled": false` with `"builders": []` (or remove the `builder` object entirely to inherit the default).
3. Move any `gas_limit` out of `builder` up to the option level — or better, delete it and follow the network's gas limit schedule automatically.
4. Delete `relays` if present (the field is gone; leaving it in place is harmless but misleading).
5. Decide your trust posture per builder: leave `max_execution_payment` unset to stay trustless, or set a deliberate per-entry cap for builders you trust.
6. Restart the validator client and check the startup logs — the [warnings below](#startup-warnings-explained) tell you if Prysm read your intent differently than you meant it.

### What happens if you don't migrate

Nothing breaks before the fork: v1 files keep driving MEV-Boost registrations exactly as they always have. From the moment your network schedules Gloas, Prysm warns at startup that the settings contain deprecated v1 builder fields. At the fork epoch:

- `enabled` and builder-level `gas_limit` values are dropped and replaced with defaults, with a warning.
- Fee recipients and graffiti carry over untouched.
- Your effective gas limit becomes the network's scheduled value (unless you set an option-level `gas_limit`).
- No builders are configured, so every proposal self-builds until you provide v2 settings or use the keymanager API.

Dropping v1 builder content is deliberately safe-by-default: the failure mode is "self-build with protocol defaults," never "trust a builder you didn't name."

## Flag changes and deprecations

| Flag | Status |
|---|---|
| `--suggested-fee-recipient` (validator) | Unchanged. |
| `--proposer-settings-file` / `--proposer-settings-url` (validator) | Unchanged; still mutually exclusive. |
| `--enable-builder` / `--enable-validator-registration` (validator) | **Legacy.** Still opts all keys into MEV-Boost registration before the fork; has no effect after it and never overrides v2 settings. Prysm warns when it's combined with version 2 settings. Post-fork equivalent: a `builders` list in v2 settings or the keymanager API. |
| `--suggested-gas-limit` (validator) | **Legacy.** Applies to pre-fork registrations only; never overrides v2 option-level gas limits or the network schedule, and warns likewise. Post-fork equivalent: option-level `gas_limit`, or nothing (follow the schedule). |
| `--stateless` (validator) | New with Gloas: the validator requests the block and execution payload envelope together and republishes the envelope itself. Forced on automatically when multiple beacon nodes are configured. |
| `--http-mev-relay` (beacon node) | Drives the MEV-Boost flow, which ends at the Gloas fork. After the fork the beacon node contacts builders using the entries your validator client supplies — no beacon node builder flag is needed. |
| `--min-builder-bid`, `--local-block-value-boost` (beacon node) | Pre-fork MEV-Boost controls. Their post-fork equivalents are per-key `min_bid` and `builder_boost_factor` in v2 proposer settings. |
| `--with-builder` (prysmctl validator) | **Legacy.** Generates pre-fork MEV-Boost builder settings and warns when used. |

## Keymanager APIs

All existing proposer-related keymanager endpoints keep working, with two behavioral updates and one new endpoint group. See the [Keymanager APIs](/apis/keymanager-api.md) page for authentication.

- **Gas limit endpoints** now read and write the option-level (v2) gas limit and no longer require a builder to be enabled. Deleting a gas limit unsets it — the key then follows the network's scheduled gas limit — instead of pinning the current default value.
- **Fee recipient, gas limit, and graffiti writes** no longer snapshot `default_config`'s builder settings onto the key; the key keeps following the default builder config as it changes.
- **`GET`/`POST`/`DELETE /eth/v1/validator/{pubkey}/builder_config`** (new, per [keymanager-APIs #88](https://github.com/ethereum/keymanager-APIs/pull/88)) manage the per-key builder config:
  - `GET` returns the key's config **resolved against `default_config`**, with concrete values for every field (no floor is reported as `"0"`, neutral boost as `"100"`, trustless-only as `"0"`), safe to re-submit as-is.
  - `POST` replaces the key's builder config **in full** — it is not a partial update. Fee recipient, gas limit, and graffiti are untouched. An empty body object clears the per-key builder config, so the key follows the client defaults.
  - `DELETE` removes the per-key builder config; the key inherits `default_config` again.
  - On the wire, integers are decimal strings and byte fields (`builder_pubkeys`, `auth_data`) are `0x`-hex.
  - The endpoints respond `501` on networks with no Gloas fork scheduled.

## Startup warnings explained

Prysm validates proposer settings at load time and prefers dropping bad input over failing block production. The warnings you may see, and what to do:

| Log message (abbreviated) | Meaning | Action |
|---|---|---|
| "Proposer settings contain v2 builder fields but no version; treating the source as version 2" | Version inference did its job — your builder configuration is being read as v2. | None needed. Add `"version": 2` if you'd rather state it explicitly and silence the log. |
| "Proposer settings contain deprecated v1 builder fields (enabled, builder-level gas limits); they stop applying at the gloas fork…" | You're on a Gloas-scheduled network with v1 builder content. | Migrate to v2 before the fork epoch. |
| "V1 builder settings, including gas limits, do not apply to gloas and were replaced with defaults…" | The fork cutover dropped your v1 builder content. | Provide v2 settings if you want builders (or an explicit gas limit). |
| "Builder entries have no max_execution_payment: their execution layer payment is ignored and only collateral-backed bid value counts…" | Your builder entries are in trustless-only mode. | Intentional? No action. Otherwise set a deliberate per-entry cap — after reading [Trusting builders](#trusting-builders-max_execution_payment). |
| "Removed N invalid or duplicate builder entries from proposer settings" | Entries failed spec limits (missing or oversized `url`, more than 64 entries, invalid pubkeys, oversized `auth_data`) or duplicated another entry. | Fix the listed entries in your source. |
| "--enable-builder is legacy (pre-gloas) mev-boost content and has no effect after the gloas fork…" (same pattern for `--suggested-gas-limit`) | A legacy flag is set alongside v2 settings. | Drop the flag once you've expressed the intent in v2 settings. |

## Frequently asked questions

#### Do I have to do anything if I never use builders?

Set your fee recipient (flag or file) and you're done. You don't need `"version": 2`, a `builder` section, or any new flags. At the fork your validator keeps self-building local blocks, and your gas limit follows the network schedule automatically.

#### Is v2 backwards compatible with v1?

For everything except builders, yes — `fee_recipient`, `graffiti`, and the file mechanics are identical, and option-level `gas_limit` is additive. For builders, v2 is a replacement, with a compatibility convention during the transition: a non-empty `builders` list doubles as the pre-fork registration opt-in, and an empty list as the opt-out.

#### Do I need to set `version` in my file?

Usually not. Prysm reads your file as version 2 the moment it uses any v2 builder field, and a file that only sets fee recipients, gas limits, or graffiti behaves identically either way. Set it when you want the file to document its own intent, or to silence the inference log at startup.

#### Which networks does this apply to right now?

The v2 builder fields only have effect on networks with a Gloas fork epoch scheduled — testnets and devnets first, mainnet once the fork is scheduled there. On other networks, the keymanager builder endpoints return `501` and the Gloas-related warnings stay quiet, but a v2 file loads fine everywhere.

#### Where did `relays` go?

Relays are a MEV-Boost concept and don't exist in the Gloas builder market. The field was removed from the schema; files still containing it load normally and the field is ignored.

#### Can I mix the flags and a v2 file?

Yes, and the file wins. Give the file an explicit `default_config` rather than relying on `--suggested-fee-recipient` as a fallback, and note that `--enable-builder` and `--suggested-gas-limit` only influence pre-fork registrations — Prysm warns that they're legacy when they're combined with v2 settings.
