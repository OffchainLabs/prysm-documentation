---
id: ethereum-public-api
title: Ethereum Beacon Node API
sidebar_label: Ethereum Beacon Node API 
description: This section contains information about the official Ethereum beacon API
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Prysm supports the official [Ethereum Beacon Node API specification](https://ethereum.github.io/beacon-APIs/), the official API standard developed by the Ethereum R&D team. The specification describes a RESTful set of endpoints which should be implemented by an Ethereum beacon node or a third-party service. This reduces the overhead of having to learn a new set of APIs when trying out a different client, and it allows network participants to reliably talk to each other over HTTP.

:::caution The official Ethereum specification contains multiple definitions

As of the time of writing, there are three definitions: [v1](https://ethereum.github.io/beacon-APIs/?urls.primaryName=v1), [v2.x.x](https://ethereum.github.io/beacon-APIs/) and [dev](https://ethereum.github.io/beacon-APIs/?urls.primaryName=dev). `dev` is an unstable version and supporting it is **not** to be expected.

:::

## Performing requests against a local Prysm node

:::danger Do not publicly expose the API

The API's purpose is a means of communication between your beacon node and your validator client. Because of this it is not protected against external malicious users. Some endpoints are vulnerable to Denial-of-Service attacks, while others may disclose information about your beacon node. The communication between the beacon node and the validator client should be done privately, either on the same machine or through an SSH connection.

:::


:::caution

`http-host` and `http-port` have replaced `--grpc-gateway-host` and `--grpc-gateway-port` respectively.

:::

The API is exposed by default on `127.0.0.1:3500`. The host can be changed by manipulating the `--http-host` flag and the port can be modified with the `--http-port` flag. 

Performing a request is straightforward - simply concatenate the host with the port and the API's URL, providing any required URL and query parameters. As an example, the finalized state's root can be obtained using:

```sh
http://127.0.0.1:3500/eth/v1/beacon/states/finalized/root
```

Notice that in this example the `{state_id}` URL parameter has been replaced with the literal value `finalized`. Please read the specification carefully to understand how each endpoint behaves.

## Disabling the API

By default the beacon node runs with all available set of APIs enabled. You might want to disable one or more APIs, for example for security reasons. The `--http-modules` flags allows fine-grained control over which APIs are available on your node.


## Tips and Recommendations

If you're experiencing timeouts when using endpoints that require passing a `state_id`, such as `/eth/v1/beacon/states/{state_id}/validators`, and you pass in a state more than a few epochs in the past, consider lowering the value of the `--slots-per-archive-point` flag. The smaller the value, the faster it is to fetch states. For historical state fetching we recommend setting the value to `64` or even `32`. Mind you that decreasing the value will result in the beacon DB taking much more space. Unfortunately there's a trade-off between speed and storage size.


