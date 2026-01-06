---
id: p2p-host-ip
title: Configure ports and firewalls for improved peer-to-peer connectivity
sidebar_label: Configure ports and firewalls
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget commaDelimitedContributors="Nishant,Raul"/>


:::info Knowledge Check

Not familiar with nodes, networks, and related terminology? Consider reading [Nodes and networks](/learn/concepts/nodes-and-networks.md) before proceeding. 

:::

In some cases, small changes to your port and firewall configuration can significantly improve your node's **peer-to-peer connectivity**. Improved peer-to-peer connectivity benefits the broader Ethereum ecosystem by making blockchain data more available, and it can also help your validator find more work (and earn a little more `ETH`).

In this how-to, we'll walk through the following tasks:

 1. [Configure your firewall](#configure-your-firewall) for improved peer-to-peer connectivity.
 2. [Determine your IP addresses](#determine-your-ip-addresses) so you can configure your router and beacon node.
 3. [Configure your router](#configure-your-router) for improved peer-to-peer connectivity.
 4. Configure your beacon node to [broadcast your public IP address](#broadcast-your-public-ip-address).
 5. [Verify your node's discoverability](#verify-your-nodes-discoverability) by using a TCP lookup tool.

:::note

As long as you can complete the [Status checklist](/monitoring-alerts-metrics/check-node-and-validator-status.md) without error, this isn't required. These are optimizations targeted at power users.

:::

## Configure your firewall

Your node and validator will try to establish several types of connections:

 1. **Validator nodes** try to connect to a **single, dedicated beacon node**. This beacon node can be local or remote.
 2. **Beacon nodes** try to connect to a **single, dedicated execution node**. This execution node can be local or remote.
 3. **Beacon nodes** try to connect to **many peer beacon nodes**.
 4. **Execution nodes** try to connect to **many peer execution nodes**.

To establish these connections, your client software needs to be able to send and receive messages through specific ports. As a security best practice, we recommend blocking inbound traffic across all local ports, allowing inbound traffic on a port-by-port basis. 

The following firewall rules should be configured on any local operating system, third-party software, or hardware firewalls between your nodes and their internet connection:


| Port/protocol   | Firewall rule                       | Reason/caveats                                                                                                                                                                                                                                                                                               |
|-----------------|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `8545/TCP`      | Block all traffic.                  | This is the JSON-RPC port for your execution node's Query API. You (and apps) can use this port to check execution node status, query execution-layer chain data, and even submit transactions. This port generally shouldn't be exposed to the outside world.                                               |
| `3500/TCP`      | Block all traffic.                  | This is the JSON-RPC port for your beacon node's Query API. You (and apps) can use this port to check beacon node status and query consensus-layer chain data. This port generally shouldn't be exposed to the outside world.                                                                                |
| `8551/TCP`      | Block all traffic.                  | Your beacon node connects to your execution node's [Engine API](https://github.com/ethereum/execution-apis/blob/main/src/engine/specification.md) using this port. Inbound and outbound traffic should be allowed through this port only if your local beacon node is connecting to a remote execution node. |
| `4000/TCP`      | Block all traffic.                  | Your validator uses this port to connect to your beacon node via [gRPC](https://grpc.io). Inbound and outbound traffic should be allowed through this port only if your local validator is connecting to a remote beacon node.                                                                               |
| `*/UDP+TCP`     | Allow outbound traffic.             | To [discover](https://github.com/ethereum/devp2p/wiki/Discovery-Overview) peers, Prysm's beacon node dials out through random ports. Allowing outbound TCP/UDP traffic from any port will help Prysm find peers.                                                                                             |
| `13000/TCP`     | Allow inbound and outbound traffic. | After we discover peers, we dial them through this port to establish an ongoing connection for [`libp2p`](https://libp2p.io/) and through which all gossip/p2p request and responses will flow.                                                                                                                |
| `12000/UDP`     | Allow inbound and outbound traffic. | Your beacon node exposes this UDP port so that other Ethereum nodes can discover your node, request chain data, and provide chain data.                                                                                                                                                                      |
| `30303/TCP+UDP` | Allow inbound and outbound traffic. | `30303/TCP` is your execution node's listener port, while `30303/UDP` is its discovery port. This rule lets your execution node connect to other peers. Note that some clients use `30301` by default.                                                                                                       |

:::note

Both consensus and execution clients allow you to customize many of these ports. The above table of rules is based on default port values.

:::

When configuring `Allow inbound` rules, consider tying the rule to an IP address when possible. For example, if your beacon node on `Machine A` is connecting to a remote execution node on `Machine B`, `Machine B`'s `Allow inbound and outbound traffic over 8551` rule should be tied to `Machine A's` public IP address. More information about IP addresses and port forwarding is available below.

<div className='port-guide'>

## Determine your IP addresses

import MultidimensionalContentControlsPartial from '@site/docs/partials/_multidimensional-content-controls-partial.md';

<MultidimensionalContentControlsPartial />

<div className='hide-tabs'>


<Tabs groupId="os" defaultValue="others" values={[
    {label: 'Windows', value: 'win'},
    {label: 'Linux, MacOS, Arm64', value: 'others'}
]}>
<TabItem value="win">


| IP type | Command                                                            |
|---------|--------------------------------------------------------------------|
| Private | <code>ipconfig &#124; findstr /i "IPv4 Address"</code>             |
| Public  | Visit [v4.ident.me](http://v4.ident.me/) or run `curl v4.ident.me` |
| Router  | <code>ipconfig &#124; findstr /i "Gateway"</code>                  |

  
</TabItem>
<TabItem value="others">


| IP type | Command                                                                                                |
|---------|--------------------------------------------------------------------------------------------------------|
| Private | <code>ifconfig &#124; grep "inet " &#124; grep -v 127.0.0.1</code>                                     |
| Public  | Visit [v4.ident.me](http://v4.ident.me/) or run `curl v4.ident.me`                                     |
| Router  | <code>ip route &#124; grep default</code> (Linux) <code>netstat -nr &#124; grep default</code> (MacOS) |


</TabItem>
</Tabs>

</div>

</div>

## Configure your router

> If you're running on a virtual public cloud (VPC) instance, you can skip this step.

To ensure that other peer nodes can discover your node, you may need to forward ports `13000/TCP` and `12000/UDP` using your router's admin interface. Every router is different, but the procedure is usually something like this:

1. Determine your router's IP address
2. Log in to your router's browser-based admin interface (usually something like http://192.168.1.1)
3. Look for `Port Forwarding`.
4. Configure a port forwarding rule with the following values:
    - External port: `13000`
    - Internal port: `13000`
    - Protocol: `TCP`
    - IP Address: The private IP address of the computer running your beacon node
5. Configure a second port forwarding rule with the following values:
    - External port: `12000`
    - Internal port: `12000`
    - Protocol: `UDP`
    - IP Address: The private IP address of the computer running your beacon node

If your execution node, beacon node, and validator node are split across multiple machines, you may need to forward additional ports. Refer to the above table of firewall rules for information about specific ports that you may need to forward.


## Broadcast your public IP address

Your beacon node will broadcast your **static, public IP address** to peer nodes if you configure either the following flags:

 - `--p2p-host-ip=<your public IP>`: Use this if you haven't configured a DNS record for your public IP. For example: `--p2p-host-ip=67.127.151.89`
 - `--p2p-host-dns="host.domain.com"`: For example: `--p2p-host-dns=host.domain.com`

Broadcasting your static IP can make your beacon node more discoverable, which benefits the Ethereum network by making consensus-layer blockchain data more available. Note that if you're using a dynamic IP address (this is usually the case by default), your node will lose its peers every time your ISP assigns your router/device a new IP address.

:::tip Dynamic IP Users

If you have a dynamic IP address, consider these options:

1. **Use DNS (recommended)**: Set up a dynamic DNS service and use `--p2p-host-dns` instead. This automatically resolves to your current IP.

2. **Wrapper script**: Create a script that fetches your IP and starts the beacon node:
   ```bash
   #!/bin/bash
   PUBLIC_IP=$(curl -s v4.ident.me)
   ./prysm.sh beacon-chain --p2p-host-ip="$PUBLIC_IP" [other flags]
   ```

Note: Using shell substitution directly in the command (e.g., `--p2p-host-ip=$(curl -s v4.ident.me)`) may not work reliably on all systems.

:::

## Verify your node's discoverability

Use the [MX Toolbox TCP Lookup tool](https://mxtoolbox.com/SuperTool.aspx?): 

`https://mxtoolbox.com/SuperTool.aspx?action=tcp%3a{Your-Public-IP-Address}%3a13000&run=toolpage`

Take note of the above placeholder for `Your-Public-IP-Address`, and the specification of `13000/TCP`.

If you see the following results, your beacon node is highly discoverable:

![image](https://user-images.githubusercontent.com/2212651/81552111-7c703400-93a0-11ea-83b5-abeebc63c285.png)

You can perform the same test using `30303/TCP` to test your execution node's discoverability. 

See [Check your node and validator status](/monitoring-alerts-metrics/check-node-and-validator-status.md) for a comprehensive status checklist.