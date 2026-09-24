---
id: deterministic
title: Create a Prysm wallet
sidebar_label: Create a Prysm wallet
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

## Background

Prysm features a built-in hierarchical deterministic (HD) wallet. HD wallets let you create new validator private keys deterministically from a seed phrase, shown as an English mnemonic following the [BIP-39 standard](https://en.bitcoin.it/wiki/Seed_phrase) upon wallet creation. If you created a deposit using the official [Ethereum launchpad](https://launchpad.ethereum.org/) and want to run Prysm using it, see our dedicated instructions [here](/install-prysm/install-with-script.mdx).

Validator private keys are encrypted with the wallet's password using the [EIP-2335](https://eips.ethereum.org/EIPS/eip-2335) `keystore.json` standard for storing BLS12-381 private keys. This `keystore.json` file, along with its derivation path, comprises an **account** in an HD wallet.

## Usage

### Wallet creation

To start using the HD wallet, you can create a new wallet using:

```bash
./prysm.sh validator wallet create
```

:::info

You'll need to set a **strong** password for your new HD wallet, containing at least one uppercase letter, one number, a special character, and be at least eight characters long. Any unicode characters can be used for your wallet password.

:::

Then select **HD** wallet when prompted. You can also create a wallet **non-interactively** by using the following command line flags, which are also viewable by typing `./prysm.sh validator wallet create --help`.


| Flag                              | Usage                                                                                                          |
| --------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `--wallet-dir`                    | Path to a wallet directory (default: "$HOME/Eth2Validators/prysm-wallet-v2")                                   |
| `--keymanager-kind`               | Type of wallet to create, either "direct", "derived, or "remote" (default "derived")                           |
| `--wallet-password-file`          | Path to a plain-text, password.txt file to lock your wallet                                                    |
| `--mnemonic-25th-word-file`       | (Advanced) Path to a plain-text, .txt file containing a 25th word passphrase for your mnemonic for HD wallets. |
| `--skip-mnemonic-25th-word-check` | Allows for skipping the check for a mnemonic 25th word passphrase for HD wallets.                              |

Here's a full example on how to create an HD wallet at `$HOME/myhdwallet`

```bash
./prysm.sh validator wallet create --wallet-dir=$HOME/myhdwallet --keymanager-kind=derived --wallet-password-file=password.txt
```

### Wallet recovery

You can fully recover an HD wallet along with all its accounts from a 24-word english mnemonic phrase generated during the wallet's creation process (which you should have stored offline). To recover your HD wallet in Prysm, you can run:

```bash
./prysm.sh validator wallet recover
```

Output

```sh
✔ Enter the wallet recovery phrase: layer write film stuff camp album strong ...
Enter a wallet directory: /Users/johndoe/Library/Eth2Validators/.prysm-wallet-v2
New wallet password: *********
Confirm password: *********
Enter how many accounts you would like to recover: 2
[2020-07-27 11:54:16]  INFO accounts: Successfully recovered HD wallet with 2 accounts. Please use accounts list to view details for your accounts. wallet-path=/Users/johndoe/Library/Eth2Validators/prysm-wallet-v2
```

:::info Recovering many accounts

Your accounts are generated deterministically from your recovery phrase, so you had 100 validator accounts on the wallet you want to recover, you can easily do so in Prysm.

:::

| Flag             | Usage                                                                        |
| ---------------- | :--------------------------------------------------------------------------- |
| `--wallet-dir`   | Path to a wallet directory (default: "$HOME/Eth2Validators/prysm-wallet-v2") |
| `--num-accounts` | Total number of accounts to recover from the wallet (default 1)              |

### List validator accounts

You can list all validator accounts in your HD wallet using the following command:

```bash
./prysm.sh validator accounts list
```

Where you'll see the following output:

```bash
INFO accounts: (wallet path) /Users/johndoe/Library/Eth2Validators/prysm-wallet-v2

Showing **1** validator account

Account 0 | personally-conscious-echidna
[validating public key] 0xa6669aa0381c06470b9a6faf8abf4194ad5148a62e461cbef5a6bc4d292026f58b992c4cf40e50552d301cef19da75b9
[validating private key] 0x50cabc13435fcbde9d240fe720aff84f8557a6c1c445211b904f1a9620668241
```

You can view the `deposit_data` needed to send 32 `ETH` to the Ethereum validator deposit contract.

You can also run the `accounts list` command **non-interactively** by using the following command line flags, which are also viewable by typing `./prysm.sh validator accounts list --help`.

| Flag                     | Usage                                                                         |
| ------------------------ | :---------------------------------------------------------------------------- |
| `--wallet-dir`           | Path to a wallet directory (default: "$HOME/Eth2Validators/prysm-wallet-v2"). |
| `--wallet-password-file` | Path to plain-text file containing your wallet's password.                    |
| `--show-private-keys`    | Display the private keys for validator accounts.                              |
