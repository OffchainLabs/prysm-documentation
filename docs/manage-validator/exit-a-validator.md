---
id: exiting-a-validator
title: Exit your validator
sidebar_label: Exit your validator
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget  commaDelimitedContributors="James"/>

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Voluntarily exiting your validator from the Ethereum network is a one time command using the [prysmctl tool](/configure-prysm/prysmctl.md). Note that this operation was previously facilitated by a command exposed by the Prysm validator client, and can still be accessed that way. At a high level, you'll follow these steps to exit your validator:

 1. Ensure that you have access to a fully synced beacon node.
 2. Issue the `validator exit` command to your validator and allow the beacon node to access to your validator keys through the `--wallet-dir` flag or [Web3Signer](/manage-wallet/use-web3signer.md) and the `--beacon-rpc-provider` flag (examples provided below).
 3. Select the account(s) that should be exited. This step can be skipped by specifying the account(s) via the `--public-keys` flag when issuing the `validator exit` command.
 4. Confirm your understanding of the consequences of exiting your validator by typing `Exit my validator` when prompted.

:::tip

Looking for a particular phrase to perform a voluntary exit in Prysm? Read Step 4 in the above steps!

:::

After providing confirmation, voluntary exit request will be broadcasted through your beacon node. Visit our [Command-line options documentation](/configure-prysm/command-line-options.md) for more configuration options.

:::caution 

Voluntarily exiting will not withdraw fund, validators must have their `withdrawal_credentials` updated in addition to exiting to withdraw the entire balance. Learn more on how to withdraw earnings or fully withdraw your validator in [our guide](/manage-validator/withdraw-validator.md)

The `validator-exit command` only supports gRPC, which means that the specified `beacon-rpc-provider` needs to be a Prysm beacon node (because Prysm's beacon node client is the only client that supports gRPC)

:::

Examples below use the local Prysm wallet, if you are using [Web3Signer](/manage-wallet/use-web3signer.md), replace the `wallet-dir` flag with the flags used to run the validator with Web3Signer. 

<Tabs
  groupId="operating-systems"
  defaultValue="lin"
  values={[
    {label: 'Linux', value: 'lin'},
    {label: 'Windows', value: 'win'},
    {label: 'Mac', value: 'arm'},
  ]
}>
<TabItem value="lin">

```sh
prysmctl validator exit --wallet-dir=<path/to/wallet> --beacon-rpc-provider=<127.0.0.1:4000> 
```

`prysmctl` is not accessible from `prysm.sh` and will need to be built from source or downloaded from our release page.

:::caution

The following command is a soon-to-be-deprecated alternative that you should avoid using:

```bash
./prysm.sh validator accounts voluntary-exit
```

:::

**Using Docker**

```sh
docker run -it -v $HOME/Eth2Validators/prysm-wallet-v2:/wallet \
  gcr.io/offchainlabs/prysm/cmd/prysmctl:latest \
  validator exit --wallet-dir=/wallet --beacon-rpc-provider=<127.0.0.1:4000> 
```

:::caution

The following command is a soon-to-be-deprecated alternative that you should avoid using:

```sh
docker run -it -v $HOME/Eth2Validators/prysm-wallet-v2:/wallet \
  gcr.io/offchainlabs/prysm/validator:latest \
  accounts voluntary-exit --wallet-dir=/wallet
```

:::

**Using Bazel**

```bash
bazel run //cmd/prysmctl --config=release -- validator exit --wallet-dir=/wallet --beacon-rpc-provider=<127.0.0.1:4000>
```
:::caution

The following command is a soon-to-be-deprecated alternative that you should avoid using:

```bash
bazel run //cmd/validator --config=release -- accounts voluntary-exit
```

:::

</TabItem>
<TabItem value="win">

```sh
prysmctl validator exit --wallet-dir=<path/to/wallet> --beacon-rpc-provider=<127.0.0.1:4000>
```

**Using Prysm.bat**

```sh
prysmctl validator exit --wallet-dir=<path/to/wallet> --beacon-rpc-provider=<127.0.0.1:4000> 
```

`prysmctl` is not accessible from `prysm.bat` and will need to be built from source or downloaded from our release page.

:::caution

The following command is a soon-to-be-deprecated alternative that you should avoid using:

```bash
prysm.bat validator accounts voluntary-exit
```

:::

**Using Docker**

```sh
docker run -it -v %LOCALAPPDATA%\Eth2Validators\prysm-wallet-v2:/wallet \
  gcr.io/offchainlabs/prysm/cmd/prysmctl:latest \
  validator exit --wallet-dir=/wallet --beacon-rpc-provider=<127.0.0.1:4000> 
```

:::caution

The following command is a soon-to-be-deprecated alternative that you should avoid using:

```sh
docker run -it -v %LOCALAPPDATA%\Eth2Validators\prysm-wallet-v2:/wallet gcr.io/offchainlabs/prysm/validator:latest accounts voluntary-exit --wallet-dir=/wallet
```
:::

</TabItem>
<TabItem value="arm">

```sh
prysmctl validator exit --wallet-dir=<path/to/wallet> --beacon-rpc-provider=<127.0.0.1:4000> 
```

`prysmctl` is not accessible from `prysm.sh` and will need to be built from source or downloaded from our release page.

:::caution

The following command is a soon-to-be-deprecated alternative that you should avoid using:

```bash
./prysm.sh validator accounts voluntary-exit
```

:::

**Using Docker**

```sh
docker run -it -v $HOME/Eth2Validators/prysm-wallet-v2:/wallet \
  gcr.io/offchainlabs/prysm/cmd/prysmctl:latest \
  validator exit --wallet-dir=/wallet --beacon-rpc-provider=<127.0.0.1:4000> 
```

:::caution

The following command is a soon-to-be-deprecated alternative that you should avoid using:

```sh
docker run -it -v $HOME/Eth2Validators/prysm-wallet-v2:/wallet \
  gcr.io/offchainlabs/prysm/validator:latest \
  accounts voluntary-exit --wallet-dir=/wallet
```

:::

**Using Bazel**

```bash
bazel run //cmd/prysmctl --config=release -- validator exit --wallet-dir=/wallet --beacon-rpc-provider=<127.0.0.1:4000> 
```
:::caution

The following command is a soon-to-be-deprecated alternative that you should avoid using:

```bash
bazel run //cmd/validator --config=release -- accounts voluntary-exit
```

:::

</TabItem>
</Tabs>

:::note

The above-referenced commands that are being deprecated have not been removed yet, but mirror those found in `prysmctl`.

:::