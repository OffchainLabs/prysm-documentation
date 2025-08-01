---
id: staying-up-to-date
title: Stay up to date
sidebar_label: Stay up to date
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';
import { PrysmVersion } from '@site/src/components/version.js';


<HeaderBadgesWidget />

This section outlines the step-by-step process for how to keep Prysm up to date, how to downgrade versions, and some security recommendations for stakers regarding updates.

## Installing Prysm

There are three main ways of installing Prysm:

* [Using the Prysm installation script (Recommended)](/install-prysm/install-with-script.md)
* [Using Docker](/install-prysm/install-with-docker.md)
* [Building from source with Bazel (Advanced)](/install-prysm/install-with-bazel.md)

## Recommended versions

Regardless of your installation method, we always recommend you are running the latest version in our [releases page](https://github.com/OffchainLabs/prysm/releases) on GitHub, specified in [semver](https://semver.org/) format such as <PrysmVersion/>. You can check your Prysm version by running your beacon node or validator with the `--version` flag. For example, if using `prysm.sh` to run the beacon node, you would run:

```sh
./prysm.sh beacon-chain --version
```

You should see a message that says `Using prysm version` and prints the version number. If you have set environment variable `USE_PRYSM_VERSION` to a specific version, the prysm.sh script will not automatically update your client. Unset the environment variable or set it to a recent version, then restart your processes with prysm.sh.

:::warning Double Check Running Processes

Running `./prysm.sh beacon-chain --version` may not reflect the version of the currently running process. After verifying the version with `prysm.sh`, be sure to check that your process was restarted recently to pick up the latest version. Alternatively, you can query the `/metrics` page for the `prysm_version` value on port `8080` or `8081` for the beacon-chain node and validator node, respectively.

:::

:::info Always Run a Stable Release

If you are running docker or building from source, we **never** recommend running from the `:latest` docker tag nor the `master` branch of Prysm. We always recommend using `:stable` if running Docker, or using a specific version tag from our latest releases. Likewise for Bazel, we recommend doing a `git checkout <COMMIT_HASH>` where `<COMMIT_HASH>` is for our latest release version

:::

## How to subscribe for updates

Prysm has two official channels for release updates: our [Discord](https://discord.gg/prysm) and our [mailing list](https://groups.google.com/g/prysm-dev). All releases will be notified via those channels, and we always recommend reading our release notes on Github in case there are **breaking changes** to running a node. Our team avoids breaking changes whenever possible, and we will make it clear in our release notes or in releases ahead of time that breaking changes are coming.

## How to securely upgrade Prysm

Updating in Prysm can incur a few seconds downtime depending on your installation method. Every validator will attest once per epoch (every 6.4 minutes on average), while proposals are more rare. To check your next assigned slot to attest or propose, we recommend checking your validator on [beaconcha.in](https://beaconcha.in). Although missing a single validator duty is not a big deal, you can wait to update right after you attest or propose for optimal performance.

:::tip Missing a single validator duty is not a big deal

Missing a single duty is really not a big deal for your validator profitability. Unless you want to be at the top of the [leaderboard](https://beaconcha.in/validators/leaderboard), do not worry too much. You will be profitable again in no time once your validator is up next epoch.

:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  groupId="operating-systems"
  defaultValue="lin"
  values={[
    {label: 'Linux', value: 'lin'},
    {label: 'Windows', value: 'win'},
    {label: 'MacOS', value: 'mac'},
    {label: 'Arm64', value: 'arm'},
  ]
}>
<TabItem value="lin">

**Using the Prysm installation script**

If you are running `prysm.sh`, all it takes to upgrade to the latest release is to stop your beacon node and validator (wait for the process to close down gracefully). Then, restart it with the same command you used to start the process. The script will automatically downloaded our latest release for you.

**Using Docker**

To update your Prysm with Docker, we recommend just pulling our `:stable` tag, which will always point to our latest release.

```sh
docker pull gcr.io/OffchainLabs/prysm/beacon-chain:stable
docker pull gcr.io/OffchainLabs/prysm/validator:stable
```

**Using Bazel**

To run our latest release with Bazel, you can look up our [releases page](https://github.com/OffchainLabs/prysm/releases), look at the commit hash of the latest release, then do `git checkout COMMIT_HASH`. Afterwards, you can re-run your beacon chain and validator as you ran them earlier with Bazel.

</TabItem>
<TabItem value="win">

**Using the Prysm installation script**

If you are running `prysm.bat`, all it takes to upgrade to the latest release is to stop your beacon node and validator (wait for the process to close down gracefully). Then, restart it with the same command you used to start the process. The script will automatically downloaded our latest release for you.

**Using Docker**

To update your Prysm with Docker, we recommend just pulling our `:stable` tag, which will always point to our latest release.

```sh
docker pull gcr.io/OffchainLabs/prysm/beacon-chain:stable
docker pull gcr.io/OffchainLabs/prysm/validator:stable
```

</TabItem>
<TabItem value="mac">

**Using the Prysm installation script**

If you are running `prysm.sh`, all it takes to upgrade to the latest release is to stop your beacon node and validator (wait for the process to close down gracefully). Then, restart it with the same command you used to start the process. The script will automatically downloaded our latest release for you.

**Using Docker**

To update your Prysm with Docker, we recommend just pulling our `:stable` tag, which will always point to our latest release.

```sh
docker pull gcr.io/OffchainLabs/prysm/beacon-chain:stable
docker pull gcr.io/OffchainLabs/prysm/validator:stable
```

**Using Bazel**

To run our latest release with Bazel, you can look up our [releases page](https://github.com/OffchainLabs/prysm/releases), look at the commit hash of the latest release, then do `git checkout COMMIT_HASH`. Afterwards, you can re-run your beacon chain and validator as you ran them earlier with Bazel.


</TabItem>
<TabItem value="arm">

**Using the Prysm installation script**

If you are running `prysm.sh`, all it takes to upgrade to the latest release is to stop your beacon node and validator (wait for the process to close down gracefully). Then, restart it with the same command you used to start the process. The script will automatically downloaded our latest release for you.

**Using Docker**

To update your Prysm with Docker, we recommend just pulling our `:stable` tag, which will always point to our latest release.

```sh
docker pull gcr.io/OffchainLabs/prysm/beacon-chain:stable
docker pull gcr.io/OffchainLabs/prysm/validator:stable
```

</TabItem>
</Tabs>

## How to securely downgrade Prysm

Sometimes, a new version might not work best for you and could impact your profitability negatively if there is an unforeseen issue in the software. To downgrade, there are a few important steps to keep in mind.

### Downgrading between patch versions

If you are downgrading between **patch versions**, which means only the last number in the version changed, such as <PrysmVersion patchOverride="1"/> to <PrysmVersion />, then follow the instructions below:

<Tabs
  groupId="operating-systems"
  defaultValue="lin"
  values={[
    {label: 'Linux', value: 'lin'},
    {label: 'Windows', value: 'win'},
    {label: 'MacOS', value: 'mac'},
    {label: 'Arm64', value: 'arm'},
  ]
}>
<TabItem value="lin">

**Using the Prysm installation script**

If you are running `prysm.sh`, all it takes to downgrade to a previous release is to stop your beacon node and validator (wait for the process to close down gracefully). 

Then, find the Prysm version you wish to run from our [releases page](https://github.com/OffchainLabs/prysm/releases),such as <PrysmVersion/>, then run the command <code>set USE_PRYSM_VERSION=<PrysmVersion/></code>.

Then, restart it with the same command you used to start the process. The script will automatically use the release you specified.

**Using Docker**

To run a previous Prysm version with Docker, choose the release you want to run, then change all your docker run commands to use that version tag. For example, instead of <code>docker run gcr.io/OffchainLabs/prysm:stable</code>, do <code>docker run gcr.io/OffchainLabs/prysm:<PrysmVersion/></code> if you want to run version <PrysmVersion/>.

**Using Bazel**

To run our latest release with Bazel, you can look up our [releases page](https://github.com/OffchainLabs/prysm/releases), look at the release tag you want to run, such as <PrysmVersion/>, then do <strong>git checkout <PrysmVersion/></strong> Afterwards, you can re-run your beacon chain and validator as you ran them earlier with Bazel.

**Using Systemd**
  
Edit the systemd files for both validator (`/etc/systemd/system/validator.service`) and beacon (`/etc/systemd/system/beacon.service`). The filename  depends on what you used when you installed, if you forgot the name, just `ls` that directory (`/etc/systemd/system/`) and edit them both. Add the `Environment` key under the `[Service]` group to have <code>Environment     =  USE_PRYSM_VERSION=<PrysmVersion/></code>
  
Example for the beacon chain:
<code>
[Unit]
Description     = Ethereum Beacon Chain Service
Wants           = network-online.target
After           = network-online.target

[Service]
Type            = simple
User            = eth
ExecStart       = /home/eth/prysm/prysm.sh beacon-chain --config-file=/etc/prysm/beacon-chain.yaml
Restart         = on-failure
TimeoutStopSec  = 900
Environment     = USE_PRYSM_VERSION=<PrysmVersion/>

[Install]
WantedBy    = multi-user.target
</code>
  
After you finish editing both of the files, you need to reload the service unit

```sh
sudo systemctl daemon-reload
```

Once you do that, the Prysm beacon and validator are locked in that version, so you need to always update it. If you want to go back to the automatic upgrades after reboot, you just need to remove the `Environment` key.

</TabItem>
<TabItem value="win">

**Using the Prysm installation script**

If you are running `prysm.bat`, all it takes to downgrade to a previous release is to stop your beacon node and validator (wait for the process to close down gracefully). 

Then, find the Prysm version you wish to run from our [releases page](https://github.com/OffchainLabs/prysm/releases), such as <PrysmVersion/> , then run the command <code>set USE_PRYSM_VERSION=<PrysmVersion/></code>.

Then, restart it with the same command you used to start the process. The script will automatically use the release you specified.

**Using Docker**

To run a previous Prysm version with Docker, choose the release you want to run, then change all your docker run commands to use that version tag. For example, instead of <code>docker run gcr.io/OffchainLabs/prysm:stable</code>, do <code>docker run gcr.io/OffchainLabs/prysm:<PrysmVersion/></code> if you want to run version <PrysmVersion/>.

</TabItem>
<TabItem value="mac">

**Using the Prysm installation script**

If you are running `prysm.sh`, all it takes to downgrade to a previous release is to stop your beacon node and validator (wait for the process to close down gracefully). 

Then, find the Prysm version you wish to run from our [releases page](https://github.com/OffchainLabs/prysm/releases), then run the command <code>export USE_PRYSM_VERSION=<PrysmVersion/></code>.

Then, restart it with the same command you used to start the process. The script will automatically use the release you specified.

**Using Docker**

To run a previous Prysm version with Docker, choose the release you want to run, then change all your docker run commands to use that version tag. For example, instead of <code>docker run gcr.io/OffchainLabs/prysm:stable</code>, do <code>docker run gcr.io/OffchainLabs/prysm:<PrysmVersion/></code> if you want to run version <PrysmVersion/>.

**Using Bazel**

To run our latest release with Bazel, you can look up our [releases page](https://github.com/OffchainLabs/prysm/releases), look at the release tag you want to run, such as <PrysmVersion/>, then do <code>git checkout <PrysmVersion/></code> Afterwards, you can re-run your beacon chain and validator as you ran them earlier with Bazel.

</TabItem>
<TabItem value="arm">

**Using the Prysm installation script**

If you are running `prysm.sh`, all it takes to downgrade to a previous release is to stop your beacon node and validator (wait for the process to close down gracefully). 

Then, find the Prysm version you wish to run from our [releases page](https://github.com/OffchainLabs/prysm/releases), then run the command <code>export USE_PRYSM_VERSION=<PrysmVersion/></code>.

Then, restart it with the same command you used to start the process. The script will automatically use the release you specified.

**Using Docker**

To run a previous Prysm version with Docker, choose the release you want to run, then change all your docker run commands to use that version tag. For example, instead of <code>docker run gcr.io/OffchainLabs/prysm:stable</code>, do <code>docker run gcr.io/OffchainLabs/prysm:<PrysmVersion/></code> if you want to run version <PrysmVersion/>.

</TabItem>
</Tabs>

### Downgrading between minor versions

If you are downgrading between **minor versions**, meaning the middle number in the version has changed, such as <PrysmVersion minorOverride="1"/> to <PrysmVersion minorOverride="0"/>, then follow the instructions below carefully:

Prerequisite: the validator.db will be needed in the steps below

:::tip

If you are unsure where your folder location is the directory path will be printed when starting the validator client.
This will typically be the location defined by `--data-dir` and by default found in a path that includes `Eth2`, base path different on each os.
This file could also be found in the Prysm wallet defined by `--wallet-dir` or has a default path that contains `Eth2Validators\prysm-wallet-v2\` which will be different on each os.

:::

<Tabs
  groupId="operating-systems"
  defaultValue="lin"
  values={[
    {label: 'Linux', value: 'lin'},
    {label: 'Windows', value: 'win'},
    {label: 'MacOS', value: 'mac'},
    {label: 'Arm64', value: 'arm'},
  ]
}>
<TabItem value="lin">

**Using the Prysm installation script**

If you are running `prysm.sh`, first stop your beacon node and validator (wait for the process to close down gracefully). 

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
prysm.sh validator db migrate down --datadir=/path/to/folder
```

Then, find the Prysm version you wish to run from our [releases page](https://github.com/OffchainLabs/prysm/releases).then run the command <code>export USE_PRYSM_VERSION=<PrysmVersion/></code>.

Then, restart it with the same command you used to start the process. The script will automatically use the release you specified.

**Using Docker**

To run a previous Prysm version with Docker, choose the release you want to run, such as <PrysmVersion/>.

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
docker run -v /path/to/folder:/data gcr.io/OffchainLabs/prysm/validator:stable db migrate down --datadir=/data
```

Then change all your docker run commands to use that version tag. For example, instead of <code>docker run gcr.io/OffchainLabs/prysm:stable</code>, do <code>docker run gcr.io/OffchainLabs/prysm:<PrysmVersion/></code> if you want to run version <PrysmVersion/>.


**Using Bazel**

To run our latest release with Bazel, you can look up our [releases page](https://github.com/OffchainLabs/prysm/releases), look at the release tag you want to run, such as <PrysmVersion/>.

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
bazel run //cmd/validator:validator -- db migrate down --datadir=/path/to/folder
```

Then do <strong>git checkout <PrysmVersion/></strong> Afterwards, you can re-run your beacon chain and validator as you ran them earlier with Bazel.

</TabItem>
<TabItem value="win">

**Using the Prysm installation script**

If you are running `prysm.bat`, first stop your beacon node and validator (wait for the process to close down gracefully). 

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
prysm.bat validator db migrate down --datadir=\path\to\folder
```

Then, find the Prysm version you wish to run from our [releases page](https://github.com/OffchainLabs/prysm/releases), such as <PrysmVersion/> , then run the command <code>set USE_PRYSM_VERSION=<PrysmVersion/></code>.

:::warning

In Windows, there isn't a native DOS command that directly sets a global environment variable permanently from the command line. The set command in Windows Command Prompt (CMD) only sets environment variables for the current session.
To permanently set this you will need up update your environment variables in the control panel.
Each DOS command prompt will have to be run individually with the set command to set the environment variable. Any schedulers used will also need to be updated manually to set the environment variable.

:::


Then, restart it with the same command you used to start the process. The script will automatically use the release you specified.

**Using Docker**

To run a previous Prysm version with Docker, choose the release you want to run, such as <PrysmVersion/>.

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
docker run -v \path\to\folder:/data gcr.io/OffchainLabs/prysm/validator:stable db migrate down --datadir=/data
```

Then change all your docker run commands to use that version tag. For example, instead of <code>docker run gcr.io/OffchainLabs/prysm:stable</code>, do <code>docker run gcr.io/OffchainLabs/prysm:<PrysmVersion/></code> if you want to run version <PrysmVersion/>.

</TabItem>
<TabItem value="mac">

**Using the Prysm installation script**

If you are running `prysm.sh`, first stop your beacon node and validator (wait for the process to close down gracefully). 

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
prysm.sh validator db migrate down --datadir=/path/to/folder
```

Then, find the Prysm version you wish to run from our [releases page](https://github.com/OffchainLabs/prysm/releases), such as <PrysmVersion/> , then run the command <code>set USE_PRYSM_VERSION=<PrysmVersion/></code>.

Then, restart it with the same command you used to start the process. The script will automatically use the release you specified.

**Using Docker**

To run a previous Prysm version with Docker, choose the release you want to run, such as <PrysmVersion/>.

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
docker run -v /path/to/folder:/data gcr.io/OffchainLabs/prysm/validator:stable db migrate down --datadir=/data
```

Then change all your docker run commands to use that version tag. For example, instead of <code>docker run gcr.io/OffchainLabs/prysm:stable</code>, do <code>docker run gcr.io/OffchainLabs/prysm:<PrysmVersion/></code> if you want to run version <PrysmVersion/>.

**Using Bazel**

To run our latest release with Bazel, you can look up our [releases page](https://github.com/OffchainLabs/prysm/releases), look at the release tag you want to run, such as <PrysmVersion/>.

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
bazel run //cmd/validator:validator -- db migrate down --datadir=/path/to/folder
```

Then do <strong>git checkout <PrysmVersion/></strong> Afterwards, you can re-run your beacon chain and validator as you ran them earlier with Bazel.

</TabItem>
<TabItem value="arm">

**Using the Prysm installation script**

If you are running `prysm.sh`, first stop your beacon node and validator (wait for the process to close down gracefully). 

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
prysm.sh validator db migrate down --datadir=/path/to/folder
```

Then, find the Prysm version you wish to run from our [releases page](https://github.com/OffchainLabs/prysm/releases), such as <PrysmVersion/> , then run the command <code>set USE_PRYSM_VERSION=<PrysmVersion/></code>.

Then, restart it with the same command you used to start the process. The script will automatically use the release you specified.

**Using Docker**

To run a previous Prysm version with Docker, choose the release you want to run, such as <PrysmVersion/>.

Next, we recommend backing up any important important folders such as your beacon node data directory and the validator wallet is important. You can simply make copies of the directories and keep them safe in case the downgrade process goes wrong. 

Next up, run our database rollback command to make sure your database is going to be compatible with your new version. Find the folder where your `validator.db` file lives, then run:

```sh
docker run -v /path/to/folder:/data gcr.io/OffchainLabs/prysm/validator:stable db migrate down --datadir=/data
```

Then change all your docker run commands to use that version tag. For example, instead of <code>docker run gcr.io/OffchainLabs/prysm:stable</code>, do <code>docker run gcr.io/OffchainLabs/prysm:<PrysmVersion/></code> if you want to run version <PrysmVersion/>.

</TabItem>
</Tabs>

### Downgrading between major version bumps

For **major version bumps** such as from <PrysmVersion/> to <PrysmVersion majorOverride="4"/>, you cannot downgrade as these are meant to be backwards incompatible changes.
