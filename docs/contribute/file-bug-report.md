---
id: bugreports
title: Report a bug
sidebar_label: Report a bug
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Bug reports are critical to the rapid development of the Prysm client. In order to make the process quick and efficient for all parties, it is best to follow some common reporting etiquette when filing to avoid double issues or miscommunications.

## Checking if your issue exists

Duplicate tickets are a hindrance to the development process and, as such, it is crucial to first check through Prysm's existing issues to see if what you are experiencing has already been indexed.

To do so, head over to the [issue page](https://github.com/OffchainLabs/prysm/issues) and enter some related keywords into the search bar. This may include a sample from the output or specific components it affects. If this is unsuccessful, check the [issue labels index](https://github.com/OffchainLabs/prysm/labels) for related categories and review the tickets within.

If searches have shown the issue in question has not been reported yet, feel free to open up a new issue ticket.

## Writing quality bug reports

A good bug report is structured to help the developers and contributors visualize the issue in the clearest way possible. It's important to be concise and use comprehensive language, while also providing all relevant information available. Use short and accurate sentences without any unnecessary additions, and include all existing specifications with a list of steps to reproduce the expected problem. Issues that cannot be reproduced **cannot be solved**.

If you are experiencing multiple issues, it is best to open each as a separate ticket. This allows them to be closed individually as they are resolved.

An original bug report will very likely be preserved and used as a record and sounding board for users that have similar experiences in the future. Because of this, it is a great service to the community to ensure that reports meet these standards and follow the template closely.


## The bug report template

Below is the standard bug report template used by all of Prysm's official repositories.

```sh
<!--- Provide a general summary of the issue in the Title above -->

## Expected Behaviour
<!--- What should be happening? -->

## Current Behaviour
<!--- What happens instead? -->

## Steps to Reproduce
<!--- Provide a concise set of steps to reproduce this bug.  -->
1.
2.
3.
4.
5.

## Detailed Description
<!--- Provide some context for the issue you are experiencing. -->

## Specifications
<!--- Provide some information regarding your local system. --->
Operating system:
Version(s) used:

## Possible Solution
<!--- (Optional) Suggest a fix, reason or implementation for the bug. -->

## Further Information
<!--- Anything else to add?
```
