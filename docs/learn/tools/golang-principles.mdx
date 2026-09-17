---
id: golang-principles
title: Golang principles
sidebar_label: Golang principles
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Prysm adheres to the official [Effective Go guidelines](https://golang.org/doc/effective_go.html), and all code committed to Prysm's master branch goes through extensive lint tools that check formatting correctness and review potential security flaws in the code itself.

For a recommended book on the Go language, see 'The Go Programming Language' by Alan A. A. Donovan and Brian Kernighan, available for purchase on Amazon [here](https://www.amazon.com/Programming-Language-Addison-Wesley-Professional-Computing/dp/0134190440).

## Code comments

Prysm requires all code to adhere to correct commentary conventions for any new packages in order to generate proper Godocs.

#### Good:

```go
// ExecuteStateTransition transforms the current state of a beacon node by applying the
// transformations specified in the official Ethereum Serenity specification.
func ExecuteStateTransition(state *pb.BeaconState, block *pb.BeaconBlock) (*pb.BeaconState, error) {
  ...
}
```

#### Bad:

```go
// This function executes a state transition.
func ExecuteStateTransition(state *pb.BeaconState, block *pb.BeaconBlock) (*pb.BeaconState, error) {
  ...
}
```

## Naming

Ensure your names are clear, concise and make no assumptions about your code without explaining the surrounding context with good commentary. Additionally, ensure all variables are namespaced properly and have a clear purpose to the reader of your code.

#### Good:

```go
// justificationUpperLimit defines a ceiling after which a block cannot pass processing conditions
// as defined in the Ethereum Serenity specification.
slotDuration := params.BeaconConfig().SlotDuration
justificationBoundary := params.BeaconConfig().JustificationBoundary
justificationUpperLimit := slotDuration * justificationBoundary

if block.Slot() > justificationUpperLimit {
  ...
}
```

#### Bad (uses magic numbers with no explanation or context):

```go
if block.Slot() > 12032*(23 + 45 % 15) {
  ...
}
```

## Error handling

Always handle fatal situations gracefully through informative error messaging or logging. Error handling is critical in code paths where critical state mutations occur which affect data persisted to disk. In particular, not handling an error gracefully a few lines above where data is written to disk can cause the system to remain in an inconsistent state (one of the most critical types of failures).

For example:

```go
func UpdateBeaconState(currentState *pb.BeaconState, blockCh chan<- *types.Block) {
  for {
    select {
    case block := <-blockCh:
      if err := processBlock(block); err != nil {
        log.Errorf("block failed processing conditions: %v", err)
      }

      newState := executeStateTransition(currentState, block)
      // BAD: This can lead to a critical, inconsistent state! The line below will save to DB
      // DB even if block failed processing conditions!
      db.SaveState(newState)
    }
  }
}
```

Instead, ensure to handle all errors in critical code paths appropriately. The error above can easily be fixed by a `continue` line added after the `log.Errorf` call to continue the loop and not store a bad state to disk.

```go
func UpdateBeaconState(currentState *pb.BeaconState, blockCh chan<- *types.Block) {
  for {
    select {
    case block := <-blockCh:
      if err := processBlock(block); err != nil {
        log.Errorf("block failed processing conditions: %v", err)
        // GOOD: The line below won't save to DB if block failed processing conditions.
        continue
      }

      newState := executeStateTransition(currentState, block)
      db.SaveState(newState)
    }
  }
}
```
