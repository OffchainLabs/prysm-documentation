---
id: phase0
title: Security audits
sidebar_label: Security audits
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

Prysmatic Labs' implementation for Phase 0 of Ethereum proof-of-stake has received the following audits.

## Quantstamp

Quantstamp has reviewed the whole codebase of the Prysm client implementation. We have found a number of issues spanning all severity levels. Some of the high severity issues
were resolved before completion of the review. Overall the code is well-written. There are many ways, however, in which it can be improved to follow best practices. For example, code
clones are relatively common. Furthermore, despite being mostly self-documenting, inline code documentation is lacking. We have no doubt that it would be useful for future contributors.
Despite being accompanied by the official `ETH` 2.0 documentation, the implementation is very nuanced and complex. The code does not always follow the specification (or it is not clear
that it does). We found a number of issues that span both the specification and the implementation. Although we aggregated some of them in the "Adherence to Specification" section,
they are of utmost importance and we highly recommend addressing each and every of them as if they were actual vulnerabilities.

Finally, many pieces of the code lack unit tests, and hence, relatively low coverage. We highly recommend adding meaningful unit tests and improving the coverage to maximize code
quality.

Update: the team addressed almost all of the findings. Mapping between issues and solutions is present in [PR#6327](https://github.com/OffchainLabs/prysm/pull/6327).

**Status**: Completed

**Completion Date**: October 13, 2020

**Report link**: [Quantstamp - Prysm Phase 0 Final Report.pdf](/assets/Quantstamp_Prysm_Phase_0_Final_Report.pdf)

## Trail of Bits

From September 8 through October 2, 2020, the Ethereum Foundation and Prysmatic Labs
engaged Trail of Bits to review the security of Prysm. Trail of Bits conducted this
assessment over the course of 8 person-weeks with three engineers working from
[245c18784eda370ea3218e8704651edad763978d](https://github.com/OffchainLabs/prysm/tree/245c18784eda370ea3218e8704651edad763978d) from the Prysm repository.
During the first week, Trail of Bits familiarized ourselves with the codebase build and test
systems, investigated fuzzing targets, and ran the existing fuzzers with no crashes. We ran
automated tools to produce jumping off points for investigation including, but not limited
to, gosec, errcheck, ineffassign, semgrep, and the unit tests with the race detector
enabled.

Week two included shadowing investigation, arithmetic operation and overflow checks, and
manual review of the slashing code. We also inspected the results from the previous weeks’
tools with deeper scrutiny.

Week three Trail of Bits continued assessing the slashing and slashing protection code. We
began mapping specs against the project and manual code reading of the
beacon-chain/core package. Finally, week three encompassed manual checks for best Go
practices and known libraries whose misuse could produce bugs.

During the fourth week, we continued to review the specification, looking for areas
where Prysm may have diverged. We focused on the p2p and sync packages for potential
denial of service attacks. Finally, we revisited the copy-on-write mechanism used for
beacon-chain states.

Our efforts resulted in 26 findings ranging from high to informational severity. The single
high-severity issue describes a failure scenario that causes a user’s raw password to be
logged (TOB-PRYSM-008). A few interesting medium-severity issues include missed deposits
due to a premature loop exit (TOB-PRYSM-015) and preserving genesis state even on
method failure (TOB-PRYSM-011).

In addition to our findings, there is an appendix (C. Code Quality Recommendations) that
addresses issues that have not produced bugs, but are of concern.
Overall, the Prysm project can improve by focusing on best Go practices and tools to
support them in order to remove risk of logic errors. We recommend extending the test
suite to include more failing cases and develop more fuzzers to improve coverage of
multiple scenarios.

**Status**: Completed

**Completion Date**: October 6, 2020

**Report link**: [Trail of Bits - Prysm Phase 0 Final Report.pdf](/assets/Trail_of_Bits_Prysm_Phase_0_Final_Report.pdf)
