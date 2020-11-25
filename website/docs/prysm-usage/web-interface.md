---
id: web-interface
title: Using the Prysm Web Interface
sidebar_label: Using the Prysm Web Interface
---

This section outlines the step-by-step process for how to use Prysm with its built-in web interface.

![Dashboard](/img/webdashboard.png "Main Dashboard")

## Step 1: Get Prysm

To begin, follow the instructions to fetch and install Prysm for your operating system.

* [Using the Prysm installation script (Recommended)](/docs/install/install-with-script)
* [Using Docker](/docs/install/install-with-docker)
* [Building from source with Bazel (Advanced)](/docs/install/install-with-bazel)

Based on the instructions above, you should now have a running beacon node.

## Step 2: Start your validator client

You'll then need to start your validator client with the `--web` flag in a second terminal window. Depending on your platform, issue the appropriate command from the examples below to start the validator.

:::danger Important Caveats
The `--web` interface is currently a beta release and has some limitations. At the moment, it assumes you are running your beacon node and validator client with default RPC ports, and on the same machine or at least within the same network. For more advanced configurations, you can get in touch with our team on Discord or follow the progress of prysm-web [here](https://github.com/prysmaticlabs/prysm-web-ui).
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

```text
./prysm.sh validator --web
```

**Using Docker**

At the moment, docker installations do not work with the web UI due to some assumptions about default ports which will be resolved in future releases. We apologize in advance.

**Using Bazel**

```text
bazel run //validator -- --web
```

</TabItem>
<TabItem value="win">

**Using the prysm.bat script**

```text
prysm.bat validator -- --web
```

**Using Docker**

At the moment, docker installations do not work with the web UI due to some assumptions about default ports which will be resolved in future releases. We apologize in advance.

</TabItem>
<TabItem value="mac">

**Using the Prysm installation script**

```text
./prysm.sh validator --web
```

**Using Docker**

At the moment, docker installations do not work with the web UI due to some assumptions about default ports which will be resolved in future releases. We apologize in advance.

**Using Bazel**

```text
bazel run //validator -- --web
```

</TabItem>
<TabItem value="arm">

**Using the Prysm installation script**

```text
./prysm.sh validator --web
```

**Using Bazel**

```text
bazel run //validator -- --web
```

</TabItem>
</Tabs>

## Step 3: Create a wallet

The Prysm web interface will open in your default browser automatically, and you can then navigate to the Create a Wallet page.

![Onboarding](/img/createawallet.png "Create a Wallet")

We recommend going through the "imported wallet" route, and importing your keys you obtained during the eth2 launchpad deposit-cli process, as this is the most secure setup. Upon completing wallet creation, you will be redirected to your main dashboard, where you can see several important items such as your recent validating performance or your beacon node's sync status.

## Step 4: Monitor your beacon node and validator client logs, manage accounts, and more

You can visualize your beacon node and validator client logs from the web interface easily by navigating to `System Process -> Logs` on the left-hand sidebar.

![Logs](/img/logs.png "Logs")

This page is useful to monitor how your processes are doing without needing to navigate to your terminal! In addition, you can visit your `Wallet and Accounts -> Accounts` page to view all your validating keys in an ordered table, explore their historical performance on https://beaconcha.in, back up your accounts, import new ones, and more. The web UI is an easy way to do a lot of common validator commands without needing to be an expert with CLI or terminal commands.
