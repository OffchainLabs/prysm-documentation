---
id: web3signer
title: Use Web3Signer
sidebar_label: Use Web3Signer
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

[Web3Signer](https://github.com/ConsenSys/web3signer) is an open-source remote signing service developed by Consensys. Prysm users can use this tool as an alternative to storing keys locally. Web3Signer uses REST APIs to sign transactions and messages.

Web3Signer follows the [Remote Signing API](https://github.com/ethereum/remote-signing-api) specification.

Prysm supports the use of Web3Signer with the following flags:

`--validators-external-signer-url` : base URL for the Web3Signer.

Example:

```sh
--validators-external-signer-url=http://localhost:9000
```

the flag is also aliased to `--remote-signer-url`

Example:

```sh
--remote-signer-url=http://localhost:9000
```

It is recommended to use `https` for the Web3Signer url. Prysm currently supports one to one on Web3Signer and does not support multiple key management systems with the same validator client. Prysm does not support partial local and partial remote key management. Web3Signer does not support authentication between the validator client and the signer.


- `--validators-external-signer-public-keys`: Comma separated list of public validator keys in hex format or an external url endpoint for the validator to retrieve public keys in JSON format.

HEX example:

```sh
--validators-external-signer-public-keys=0xa99a...e44c,0xb89b...4a0b
```

URL example:

```sh
--validators-external-signer-public-keys=https://web3signer.com/api/v1/eth2/publicKeys
```

The flag is also aliased to `--remote-signer-keys`

Example:

```sh
--remote-signer-keys=0xa99a...e44c,0xb89b...4a0b
```

By default, Prysm fetches public keys from the URL once at startup. You can enable polling to refresh keys from the URL without restarting the validator, or use a key file to manage additional keys through the Remote Keymanager API.

:::tip Running Prysm with Web3Signer does not need Prysm Wallet Creation

Most Prysm keymanager types require a corresponding Prysm wallet for storing keys, the `web3signer` type doesn't use any locally stored Prysm wallet.
The `--wallet-dir` flag will still be needed if using the Remote Keymanager API for `auth-token` purposes.

:::

## Public key sources

Prysm combines public keys from all configured sources and removes duplicates before using them for validator duties:

| Source | How keys are updated |
| --- | --- |
| Hex keys passed to `--validators-external-signer-public-keys` | Loaded at startup; changing them requires restarting the validator. |
| URL passed to `--validators-external-signer-public-keys` | Fetched at startup and refreshed when polling is enabled. |
| File passed to `--validators-external-signer-key-file` | Loaded at startup and reloaded on file changes, including Remote Keymanager API updates. |

URL polling and file watching can run together. Each updates only its own keys, so a key remains active as long as any source supplies it.

If a key appears in multiple sources, Prysm assigns ownership to the first source in this order: explicit hex keys, URL, then file. The owner determines whether the Remote Keymanager API reports the key as read-only.

## Public key URL polling

Set `--validators-external-signer-poll-interval` (alias: `--remote-signer-poll-interval`) to a positive duration, such as `30s` or `5m`, to refresh keys from the public-keys URL:

```sh
validator \
  --validators-external-signer-url=http://localhost:9000 \
  --validators-external-signer-public-keys=http://localhost:9000/api/v1/eth2/publicKeys \
  --validators-external-signer-poll-interval=30s
```

The default is `0`. With a zero or negative duration, Prysm fetches keys only at startup. The interval has no effect unless `--validators-external-signer-public-keys` specifies a URL. Setting the signer base URL alone does not enable public-key discovery.

A successful poll that returns at least one key replaces the URL source's keys, adding and removing keys without restarting Prysm. Keys supplied by the flag or file remain active. Polling also works with `--validators-external-signer-key-file` configured.

With polling enabled, Prysm can start without URL keys if the initial fetch fails, then retry on later polls. Without polling, a failed fetch prevents startup. An initial response containing an invalid public key prevents startup even with polling enabled.

:::warning Empty poll responses do not clear keys

Prysm keeps the current URL keys if a poll fails or returns invalid public keys or an empty list. If you remove every key from the URL, Prysm will still attempt validator duties for the keys it previously loaded. To stop all duties, stop the validator client.

:::

## Remote Keymanager API

[Keymanager APIs](https://github.com/ethereum/keymanager-APIs) is a recommended set of REST APIs that validator clients have agreed upon for managing keys.

The Remote Keymanager API lets you list all public keys configured on the validator for Web3Signer and import or delete entries in the key file. It does not modify keys supplied by the flag or URL.

To use the Remote Keymanager API, run the validator with `--web` and `--validators-external-signer-url`. Imports also require `--validators-external-signer-key-file` to point to an existing file, which can be empty. The validator process must have write access to the file's directory because API updates replace the file atomically.

You must set at least one of `--validators-external-signer-public-keys` or `--validators-external-signer-key-file`, or the validator fails to start. If the configured sources supply no keys, such as an empty key file, the validator starts and waits for keys to be added.

Example:

```sh
touch ./web3signer-keys.txt
validator --web \
  --validators-external-signer-url=http://localhost:9000 \
  --validators-external-signer-key-file=./web3signer-keys.txt
```

| Endpoint | Behavior |
| --- | --- |
| `GET /eth/v1/remotekeys` | Lists keys from all sources. File-owned keys have `readonly: false`; flag- and URL-owned keys have `readonly: true`. |
| `POST /eth/v1/remotekeys` | Imports keys into the key file. Without a configured key file, returns an `error` for each key. With a key file configured, keys already supplied by any source or repeated in the request return `duplicate`. Saves successful imports to the file before returning `imported`. |
| `DELETE /eth/v1/remotekeys` | Removes matching entries from the key file. File-only keys return `deleted`; unknown keys return `not_found`. Keys still supplied by the flag or URL return `error` explaining that they remain active, even if a matching file entry was removed. |

To stop validating for a key, remove it from every source that supplies it. URL keys follow the polling rules above: an empty response keeps the previously loaded keys active.

The `--web` flag will enable validator client APIs as well as the web ui ( not supported for `web3signer` ). A JWT token (found in the contents of the single-line file `auth-token`, will be generated in the Prysm default wallet directory otherwise defined by `--wallet-dir` flag. The token will also be printed in the console:

```sh
[2022-04-15 14:07:39]  INFO rpc: http://127.0.0.1:7500/initialize?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ck3J6tcvHcI74IiFjyJqcBH-MmNAq-fMr0ncyZkGvFM
```

The token needs to be copied and set in the header of the API request:

```sh
Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ck3J6tcvHcI74IiFjyJqcBH-MmNAq-fMr0ncyZkGvFM`
```

See the [Remote Key Manager API reference](https://ethereum.github.io/keymanager-APIs/?urls.primaryName=dev#/Remote%20Key%20Manager) for endpoint details, or the [Keymanager APIs GitHub repository](https://github.com/ethereum/keymanager-APIs) for the specification source.

:::warning Prysm Web Interface not supported for Web3Signer

Prysm Web Interface can only support local keys and will not support the Web3Signer keys.[eth2-keymanager-frontend](https://github.com/joaquim-verges/eth2-keymanager-frontend) is a front-end alternative to the Prysm UI for the Keymanager APIs.

:::


:::warning Only supports Web3Signer currently

The remote keymanager API only currently supports Web3Signer types, please use the regular keymanager API for locally stored keys.

:::


:::tip Beacon Chain needs to be synced for use

Both Keymanager APIs are only supported when the beacon chain syncs.

:::

## Public Key Persistence

Use `--validators-external-signer-key-file` to load public keys from a file and save Remote Keymanager API imports and deletions across restarts. The file must exist before the validator starts. The API rejects imports if no file is configured.

Example:

```sh
--validators-external-signer-key-file=/path/to/keyfile.txt
```

The flag is also aliased to `--remote-signer-keys-file`

Example:

```sh
--remote-signer-keys-file=/path/to/keyfile.txt
```

The file contains public keys as hex strings, one key per line. You can edit it directly or manage its entries through the Remote Keymanager API. Prysm watches for changes and reloads the file's keys without restarting.

Flag and URL keys are not automatically written to the file. On restart, Prysm loads each configured source independently and combines their keys.

If you empty or remove the file while the validator is running, Prysm stops using its keys unless the flag or URL also supplies them. The configured file must exist again before you restart the validator.

:::warning Upgrading an existing key file

Earlier versions (up to and including v7.1.8) copied flag and URL keys into the key file. Check existing files and remove copies you want to manage only through the flag or URL. Keep keys you intend to manage through the file. A stale file entry can keep a key active after you remove it from the flag or URL.

If you delete a key through the Remote Keymanager API while the flag or URL still supplies it, the API removes the file entry but returns `error`. Review the response message to confirm whether the file entry has been removed and whether the key is still active.

:::
