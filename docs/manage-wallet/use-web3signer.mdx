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

URLs will only pull once and does not poll. Additional keys can be added or removed via the Remote Keymanager API.

:::tip Running Prysm with Web3Signer does not need Prysm Wallet Creation

Most Prysm keymanager types require a corresponding Prysm wallet for storing keys, the `web3signer` type doesn't use any locally stored Prysm wallet.
The `--wallet-dir` flag will still be needed if using the Remote Keymanager API for `auth-token` purposes.

:::

## Remote Keymanager API 

[Keymanager APIs](https://github.com/ethereum/keymanager-APIs) is a recommended set of REST APIs that validator clients have agreed upon for managing keys.

The Remote Keymanager APIs allows Prysm users to list, update, and delete the public keys set on the validator for Web3Signer.

To use the Remote keymanager API, one would need to run the validator with the `--web` and `--validators-external-signer-url` flags with `--validators-external-signer-public-keys` being optional. 
if `--validators-external-signer-public-keys` is not defined the validator client would simply run in a loop waiting for keys to be set. 

Example:

```sh
validator --web --validators-external-signer-url=http://localhost:9000
```

The `--web` flag will enable validator client APIs as well as the web ui ( not supported for `web3signer` ). A JWT token (found in the contents of the single-line file `auth-token`, will be generated in the Prysm default wallet directory otherwise defined by `--wallet-dir` flag. The token will also be printed in the console:

```sh
[2022-04-15 14:07:39]  INFO rpc: http://127.0.0.1:7500/initialize?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ck3J6tcvHcI74IiFjyJqcBH-MmNAq-fMr0ncyZkGvFM
```

The token needs to be copied and set in the header of the API request:

```sh
Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ck3J6tcvHcI74IiFjyJqcBH-MmNAq-fMr0ncyZkGvFM`
```

For more information on Remote Keymanager API visit the [Keymanager APIs Github Repo](https://github.com/ethereum/keymanager-APIs).

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

The public keys set on the validator for a remote signer are `NOT` persisted by `DEFAULT`. 
This means that if the validator client restarts, only the public keys set via flag options will be used on the validator and keys set via the Remote Keymanager API will be lost.

Keys can be persisted by setting the `--validators-external-signer-key-file` set to a file path.

Example:

```sh
--validators-external-signer-key-file=/path/to/keyfile.txt
```

The flag is also aliased to `--remote-signer-keys-file`

Example:

```sh
--remote-signer-keys-file=/path/to/keyfile.txt
```

Keys updated via the Remote Keymanager API will be persisted to the file as a hex string, one key per line.

If the file is removed or the file is empty, the validator will revert to the public keys set via the `--validators-external-signer-public-keys` flag.

On restart, the validator will read the file and set the public keys from the file.
