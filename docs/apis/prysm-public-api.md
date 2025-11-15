---
id: prysm-public-api
title: Prysm public API
sidebar_label: Prysm-specific API 
description: This section contains service definitions and gRPC instructions to interact with the Prysm public API.
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

:::info This API is only used by Prysm

For a standard API that all Ethereum beacon nodes implement, see [here](/apis/ethereum-beacon-node-api.md). Over the next few quarters, we plan on deprecating this API and replacing it with the standard API.

:::

One of the required components of nodes in the Ethereum beacon chain network is to expose an API server for outside interaction. This API is critical for running validators on Ethereum, as validator clients can connect to nodes and query their API to figure out their assigned duties, to submit block proposals, and more. Prysm's Ethereum consensus API schema is maintained in Prysm itself here: [github.com/OffchainLabs/prysm/proto](https://github.com/OffchainLabs/prysm/tree/develop/proto) and is implemented by Prysm beacon nodes and validators.

![gRPC](https://github.com/OffchainLabs/prysm-documentation/blob/master/static/images/grpc-logo2.png)

Prysm implements its API by using the popular [gRPC](https://grpc.io) project created by Google, providing highly advanced functionality for Ethereum consensus. Interacting with the API requires the use of protocol buffers, also known as protobuf. These [protocol buffer](https://developers.google.com/protocol-buffers/). For information on the functionality of gRPC and protocol buffers more generally, see the [gRPC guide](https://grpc.io/guides/).

## Calling the API on your local beacon node

:::danger Do not publicly expose the API

The API's purpose is a means of communication between your beacon node and your validator client. Because of this it is not protected against external malicious users. Some endpoints are vulnerable to Denial-of-Service attacks, while others may disclose information about your beacon node. The communication between the beacon node and the validator client should be done privately, either on the same machine or through an SSH connection.

:::

By default, the beacon node exposes a [gRPC](https://grpc.io) API on host `127.0.0.1:4000`, which is accessed by the validator client. This is not an HTTP endpoint, so you will not be able to perform API queries via HTTP on that port. 
Instead of using a regular `curl` command you will need to use `gRPCurl` or a similar tool to make API calls via your terminal.

:::caution as of v5.1.1 HTTP for gRPC endpoints is no longer supported

As of v5.1.1, gRPC gateway was removed from Prysm and no longer supports HTTP for gRPC endpoints.
Some Prysm specific endpoints are still supported via REST under the prysm/v1 namespace.

:::

### gRPC tooling and resources

* [Awesome gRPC](https://github.com/grpc-ecosystem/awesome-grpc)
* [Google's API Style Guide](https://cloud.google.com/apis/design/)
* [Language reference for proto 3](https://protobuf.dev/programming-guides/proto3)
* [Protocol Buffer Basics: Go](https://protobuf.dev/getting-started/gotutorial)
* [Transcoding gRPC to JSON/HTTP using Envoy](https://blog.jdriven.com/2018/11/transcoding-grpc-to-http-json-using-envoy/)
* [gRPCurl](https://github.com/fullstorydev/grpcurl)
