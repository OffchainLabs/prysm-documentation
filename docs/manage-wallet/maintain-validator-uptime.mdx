---
id: maintaining-uptime
title: Maintain validator uptime with systemd or Docker
sidebar_label: Maintain validator uptime with systemd or Docker
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Validators should be online as much as possible. If you're running your validator on a cloud server, or if you want your validator to automatically start running when the host machine restarts, consider running your client software as a background service through either Docker or `systemd`. 

:::caution

This may be overkill for at-home stakers who use the `prysm.sh` script to run Prysm. To those users, we recommend **keeping it simple** by occasionally checking the status of your validator. See [Check Software Status](/monitoring-alerts-metrics/check-node-and-validator-status.mdx) to learn more.

:::

### Docker

You can use Docker to run your beacon node and validators as background services. See [Install with Docker](/install-prysm/install-with-docker.mdx). You can monitor and view your running Docker containers using `docker ps`.

### Systemd (Linux)

Linux systems allow for easy running of services in the background through a daemon process called [`systemd`](https://www.digitalocean.com/community/tutorials/systemd-essentials-working-with-services-units-and-the-journal). You can follow the tutorial posted by [Digital Ocean](https://www.digitalocean.com/community/tutorials/systemd-essentials-working-with-services-units-and-the-journal) on setting up `systemd` services.

You can run your beacon node with the following `systemd` configuration, where you can modify some of the fields and flags to your liking. Assuming your `prysm.sh` script is at `/home/prysm/prysm.sh`.

```sh
[Unit]
Description=Prysm Beacon chain daemon
After=network-online.target

[Service]
ExecStart=/home/prysm/prysm.sh beacon-chain
Restart=on-failure
User=YOUR_USER

[Install]
WantedBy=default.target
```

You can also run your validator client in `systemd` using the following configuration.

```sh
[Unit]
Description=Prysm Validator daemon
After=network-online.target
Wants=prysm-beacon.service

[Service]
ExecStart=/home/prysm/prysm.sh validator --wallet-dir DIR/TO/prysm-wallet-v2 --wallet-password-file DIR/TO/YOUR_PASSWORDFILE --graffiti YOUR_GRAFFITI
Restart=on-failure
User=YOUR_USER

[Install]
WantedBy=default.target
```
