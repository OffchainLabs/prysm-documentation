---
id: keymanager-api
title: Keymanager APIs
sidebar_label: Keymanager APIs
---

Prysm supports the official [Keymanager APIs](https://github.com/ethereum/keymanager-APIs), a REST API specification for validator clients to provide an alternative to CLI commands for onboarding and offboarding their validator keys on the consensus client. 

All Prysm Validator Client APIs require the use of the `--rpc` flag. 

Please refer to the "local keystores APIs" to manage locally stored validator keys, and to the "remote keystores APIs" to manage public key settings for Web3Signer.
Go to our [Web3Signer](/manage-wallet/use-web3signer.md) docs page for more information.

## Authentication
A bearer token is needed to use the Keymanager APIs. This token is automatically generated and can be found in the contents of the single-line file `auth-token`, located at the path set by the `--keymanager-token-file` flag (default: `$HOME/Eth2Validators/prysm-wallet-v2/auth-token`, which varies by operating system). When the Validator Client starts with `--rpc`, the path is displayed in its logs:

```sh
INFO rpc: Validator Client auth token for API authentication set at /Users/johndoe/Library/Eth2Validators/prysm-wallet-v2/auth-token
```

You can also regenerate the token at any time with `validator generate-auth-token`.

The token needs to be copied and set in the header of the API request:

```sh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ck3J6tcvHcI74IiFjyJqcBH-MmNAq-fMr0ncyZkGvFM
```


## Other Prysm specific errors and usecases

Prysm comes with some client specific edge cases and usages. These cases will be documented on the [Keymanager API repos under flows](https://github.com/ethereum/keymanager-APIs/tree/master/flows/client-specific/prysm).


