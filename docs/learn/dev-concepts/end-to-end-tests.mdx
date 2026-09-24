---
id: end-to-end
title: End-to-end tests
sidebar_label: End-to-end tests
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Even the best unit tests won't prevent bugs from creeping into the system. They test small pieces of code in isolation, but it might be the interaction between different modules/packages/subsystems that causes issues. Prysm consists of two separate components, the beacon chain and the validator, that interact with each other in non-trivial ways. Additionally, the system contacts an Eth1 endpoint to access various information about the Eth1 chain. It is therefore very important to find integration bugs as soon as possible. The way Prysm achieves this is through having an E2E (end-to-end) test module. Tests inside this module are run on every PR build, which greatly increases confidence that new code can safely be merged.

## Running E2E tests

The below command will run E2E tests using the minimal E2E configuration. It will run for ten epochs. We additionally specify a timeout value and declare `--test_output=streamed` to output logs for all tests in real time.

```sh
bazel test //testing/endtoend:go_default_test --//proto:network=minimal --test_filter=TestEndToEnd_MinimalConfig --test_env=E2E_EPOCHS=10 --test_timeout=10000 --test_output=streamed
```

## How are E2E tests special?

E2E tests are located in https://github.com/OffchainLabs/prysm/tree/develop/testing/endtoend. They are regular Go tests enhanced by Bazel. The main reason why we need Bazel is to prepare binaries for components executed by the test, including the beacon node and validator. This means we are testing the system as a whole, including all inter-process communication. E2E uses a dedicated beacon config that overrides several important parameters, such as time-related values (we don't want the test to take too long given that it's supposed to run for several epochs).

:::info

The difference between `TestEndToEnd_MinimalConfig` and `TestEndToEnd_MinimalConfig_ValidatorAtCurrentRelease` is that the former runs the latest validator code, whereas the latter run the validator's latest release. The idea is to ensure backwards compatibility between `HEAD` and the latest validator release.

:::

## E2E building blocks

There are three main building block types from which E2E tests are constructed: components, evaluators and policies.

### Components

An E2E component is an abstract concept that represents a service that can be started and whose status can be inspected. It is defined as a Go interface type:

```sh
// ComponentRunner defines an interface via which E2E component's configuration, execution and termination is managed.
type ComponentRunner interface {
	// Start starts a component.
	Start(ctx context.Context) error
	// Started checks whether an underlying component is started and ready to be queried.
	Started() <-chan struct{}
}
```

There are several types that implement this interface and they can all be found in https://github.com/OffchainLabs/prysm/tree/develop/testing/endtoend/components.

E2E requires appropriate regular version updates for certain components that run on binary such as Web3Signer. Currently, E2E can only support one version of a component at a time.

Running components correctly is not a simple task. We can't simply start up all components at the same time and expect the system to work. The beacon node requires a running boot node to be able to find peers, as well as an Eth1 node with blocks that include deposits for validators that will be used during the test. This means we need a combination of synchronous and asynchronous behavior. This is achieved by the use of goroutines and the `ComponentRunner` interface inside `run()` in https://github.com/OffchainLabs/prysm/blob/develop/testing/endtoend/endtoend_test.go.

### Evaluators

An E2E evaluator is a type defined as follows:

```sh
// Evaluator defines the structure of the evaluators used to conduct the current beacon state during the E2E.
type Evaluator struct {
	Name       string
	Policy     func(currentEpoch types.Epoch) bool
	Evaluation func(conn ...*grpc.ClientConn) error // A variable amount of conns is allowed to be passed in for evaluations to check all nodes if needed.
}
```

The purpose of an evaluator is to assert an invariant that the system must hold in order to run properly. Examples of such invariants include the ability to undergo a fork transition or the ability to find peers in the network. All evaluators can be found in https://github.com/OffchainLabs/prysm/tree/develop/testing/endtoend/evaluators.

Each evaluator has a name, a policy (which we will cover later) and an evaluation function. The evaluation function is the actual code that asserts if the system behaves correctly. If the invariant is broken, an error is returned from the function, and the test is stopped and considered failed.

:::info

- Evaluators are executed at the beginning of an epoch.
- The list of evaluators to run is specified by each test separately.

:::

### Policies

Not every invariant can be checked at every epoch. As an example, the Altair fork transition invariant should be asserted only after the Altair hard fork occurred. Evaluator timings are controlled with policies, which are simple functions returning boolean values, with `true` indicating that the evaluator should be ran for a specific epoch. All policies can be found in https://github.com/OffchainLabs/prysm/tree/develop/testing/endtoend/policies.

## Investigating failures

If one or more evaluators fail, we get a console output similar to the following:

```sh
--- FAIL: TestEndToEnd_MinimalConfig (234.18s)
    --- PASS: TestEndToEnd_MinimalConfig/chain_started (14.50s)
    --- PASS: TestEndToEnd_MinimalConfig/finished_syncing_0 (0.00s)
    --- PASS: TestEndToEnd_MinimalConfig/validators_active_epoch_0 (0.00s)
    --- PASS: TestEndToEnd_MinimalConfig/peers_connect_epoch_0 (0.10s)
    --- PASS: TestEndToEnd_MinimalConfig/all_nodes_have_same_head_0 (0.10s)
    --- FAIL: TestEndToEnd_MinimalConfig/healthz_check_epoch_1 (0.00s)
    --- PASS: TestEndToEnd_MinimalConfig/finished_syncing_1 (0.00s)
    --- PASS: TestEndToEnd_MinimalConfig/validators_active_epoch_1 (0.00s)
    --- PASS: TestEndToEnd_MinimalConfig/peers_check_epoch_1 (0.00s)
    --- PASS: TestEndToEnd_MinimalConfig/verify_graffiti_in_blocks_epoch_1 (0.00s)
    --- PASS: TestEndToEnd_MinimalConfig/validators_vote_with_the_majority_1 (0.00s)
    --- PASS: TestEndToEnd_MinimalConfig/all_nodes_have_same_head_1 (0.10s)
    --- PASS: TestEndToEnd_MinimalConfig/metrics_check_epoch_1 (0.11s)
FAIL
FAIL: //testing/endtoend:go_default_test (see /home/user/.cache/bazel/_bazel_user/ec3daeb6ce0cd7052bf7c79ca31f19c6/execroot/prysm/bazel-out/k8-fastbuild-ST-02d640e6fd05/testlogs/testing/endtoend/go_default_test/test.log)
Target //testing/endtoend:go_default_test up-to-date:
  bazel-out/k8-fastbuild-ST-02d640e6fd05/bin/testing/endtoend/go_default_test_/go_default_test
INFO: Elapsed time: 235.338s, Critical Path: 235.16s
INFO: 2 processes: 1 internal, 1 linux-sandbox.
INFO: Build completed, 1 test FAILED, 2 total actions
//testing/endtoend:go_default_test                                       FAILED in 235.1s
  /home/user/.cache/bazel/_bazel_user/ec3daeb6ce0cd7052bf7c79ca31f19c6/execroot/prysm/bazel-out/k8-fastbuild-ST-02d640e6fd05/testlogs/testing/endtoend/go_default_test/test.log

INFO: Build completed, 1 test FAILED, 2 total actions
```

This tells us which evaluator failed (`healthz_check_epoch_1`), but we don't know the reason of the failure. Fortunately, there are several logs that we can inspect. First of all, we can take a look at the main test log, whose path is provided in the output:

```sh
/home/user/.cache/bazel/_bazel_user/ec3daeb6ce0cd7052bf7c79ca31f19c6/execroot/prysm/bazel-out/k8-fastbuild-ST-02d640e6fd05/testlogs/testing/endtoend/go_default_test/test.log
```

The directory of the `test.log` file contains a `test.output` directory, which itself contains a zipped file with logs from several components, including all beacon nodes and validator clients started up during the test. They provide invaluable information about our test run. As an example, let's inspect a different error message:

```sh
endtoend_test.go:279: E2E test ended in error: failed to start the ETH1 miner: exit status 1
```

The uzipped output file contains a `eth1-init_miner.log` file with the following contents:

> Fatal: Failed to read genesis file: open /home/user/.cache/bazel/\_bazel\_user/ec3daeb6ce0cd7052bf7c79ca31f19c6/sandbox/linux-sandbox/1779/execroot/prysm/bazel-out/k8-fastbuild-ST-02d640e6fd05/bin/testing/endtoend/go\_default\_test\_/go\_default\_test.runfiles/com\_github\_ethereum\_go\_ethereum/cmd/geth/geth_/genesiss.json: no such file or directory

The issue here is that our repo contains a static file named `genesis.json` that we want to use to initialize Geth, but issuing the command has a typo in the word `genesis` (there is a double `s` at the end).

## Testing features

Prysm supports [feature flags](https://github.com/OffchainLabs/prysm/blob/develop/config/features/README.md), which are very useful when we want to test a particular feature before making it a standard in production. Sometimes you might want to run E2E with your feature flag enabled. To do this, go to https://github.com/OffchainLabs/prysm/blob/develop/config/features/flags.go and append your flag to `E2EBeaconChainFlags`:

```sh
var E2EBeaconChainFlags = []string{
    "--dev",
    "--my-feature",
}
```