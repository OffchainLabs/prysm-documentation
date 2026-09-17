---
id: graffiti-file
title: Add graffiti to blocks
sidebar_label: Add graffiti to blocks
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

The `--graffiti-file` flag for the Prysm validator client allows you to add graffiti to blocks. Different graffiti may be configured for different validators running in the same process.

## Usages

The validator flag: `--graffiti-file=/path/to/graffitis.yaml`

It supports yaml and the following scalar and collections. We will go through each of them in detail below.
 * Specific
 * Ordered
 * Random
 * Default

### Specific usage
Specific chooses the graffiti based on the validator ID. When validator ID is not specified, a graffiti will be chosen from another list. This takes precedent over ordered, random and default.

**Example**:
```yaml
specific:
  163: "validator 163 was here"
  914: "validator 914 was here"
  546: "validator 536 was here"
  237: "validator 237 was here"
random:
  - "Mr A was here"
  - "Mr B was here"
  - "Mr C was here"
default: "Mr F was here"
```
Example output:
![image](/images/graffiti-specific.png)

### Ordered
Ordered chooses each entry of graffiti in order from the list. The validator will start again from the top of the list each time the graffiti file is updated. Once the list is finished, the `random` or `default` graffiti will be used. This takes precedent over both random and default.

**Example**:
```yaml
ordered:
  - "Mr A was here"
  - "Mr B was here"
  - "Mr C was here"
default: "Mr F was here"
```

Example output:
```
INFO validator: Submitted new block blockRoot=0x00000 graffiti="Mr A was here"
INFO validator: Submitted new block blockRoot=0x00000 graffiti="Mr B was here"
INFO validator: Submitted new block blockRoot=0x00000 graffiti="Mr C was here"
INFO validator: Submitted new block blockRoot=0x00000 graffiti="Mr F was here"
INFO validator: Submitted new block blockRoot=0x00000 graffiti="Mr F was here"
```

### Random
Random chooses a random graffiti from the list. If `random` is not specified, the `default` graffiti will be used.
This takes precedent over default.

**Example**:
```yaml
#specific:
#  163: "validator 163 was here"
#  914: "validator 914 was here"
#  546: "validator 536 was here"
#  237: "validator 237 was here"
random:
  - "Mr A was here"
  - "Mr B was here"
  - "Mr C was here"
default: "Mr F was here"
```
Example output:
![image](/images/graffiti-random.png)


### Default
Default specifies the graffiti to be used by all the keys under validator client.

**Example**:
```yaml
#specific:
#  163: "validator 163 was here"
#  914: "validator 914 was here"
#  546: "validator 536 was here"
#  237: "validator 237 was here"
#random:
#  - "Mr A was here"
#  - "Mr B was here"
#  - "Mr C was here"
default: "Mr F was here"
```
Example output:
![image](/images/graffiti-default.png)


