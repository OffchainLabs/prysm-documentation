# Writing guide for the Prysm docs (v2 rewrite)

Read this before writing any page. It is the contract every writer follows, so pages written in parallel read as one site.

## Audience and goal

Readers are **node operators and stakers** (most), and **developers** (the Developers section). They arrive with a task: install Prysm, connect Geth, add validators, fix a problem. Every page answers "what do I do, and how do I know it worked?" Explain *why* only as much as helps them decide or avoid a mistake; deep background belongs in Learn.

## Keep it simple (the user-first rules)

The site is for people who run Prysm, not people who build it. These rules win over anything else in this guide.

- **Command first.** The first step with a command should appear within the first screen. Background goes after the steps, or in one sentence before them.
- **No internals.** No protocol mechanics, spec constants, Engine API method names, database layouts, p2p internals or Go/Bazel details. If a user needs a concept to make a decision, give it in one or two plain sentences and link to Learn.
- **Only the flags that matter.** Show the 2–5 flags a user actually sets for the task, with their defaults. Link the rest to the generated reference (`/reference/cli/<bin>/`). Never copy flag tables from the reference.
- **One page per task.** Variants (OS, network, execution client, runner) are tabs on one page, not separate pages.
- **Length.** Aim for 400–900 words per how-to page, under 600 for overview pages. If a page runs long, cut explanation, not steps.
- **Every how-to ends with "Check that it works".** Give the real log line, command or metric that proves success.
- **Link to pages, not anchors, on pages you don't own.** Other writers may rename headings.

## Voice

- Second person, active voice, present tense. "Start the beacon node", not "The beacon node should be started".
- Plain words. Say what something does. No marketing ("powerful", "seamless", "robust"), no filler ("simply", "just", "easily", "in order to").
- Sentence case for titles and headings. No title case, no ALL CAPS labels.
- Short paragraphs (1–4 sentences). Prefer lists and tables for anything the reader scans.
- Be specific: real flag names, real ports, real file paths, real log lines.
- British/American: use American spelling.

## Page types and structure

**Task page** (most of Install, Set up, Run validators, Operate, Developers):

1. One-paragraph intro: what this achieves and when you need it.
2. `## Before you begin` — prerequisites as a short list, linking to the pages that cover them.
3. Numbered steps: use `<Steps>` with an ordered list. Each step = one action + the command + what you should see.
4. `## Check that it works` — the command/log/metric that proves success.
5. `## Troubleshooting` (optional) — the 2–5 failures people actually hit, each as a bold symptom followed by the fix.
6. `## Next steps` — 2–4 links.

**Explainer** (Learn, Security overview, Flags explained): lead with the one-sentence answer, then build up. Use a diagram when a relationship or sequence is involved (see Diagrams).

**Flag guide** (Flags explained): organized by task, not alphabetically. For each important flag: what it does, when to change it, a working example, interactions/pitfalls. Always use `<Flag>` (below) so the build catches typos.

## Conventions

- **Network in examples:** use Hoodi (`--hoodi`) by default and tell readers to swap in `--mainnet`. Mainnet-only facts must say so.
- **Folder layout for interactive runs** (script or binaries in a terminal), matching the Quickstart:
  ```
  ~/ethereum/
  ├── consensus/     # prysm.sh, beacon and validator data
  │   └── wallet/    # Prysm wallet (--wallet-dir=./wallet)
  ├── execution/     # execution client binary and data
  └── jwt.hex
  ```
- **Layout for services** (systemd, Docker Compose):
  - Binaries in `/usr/local/bin/` (`beacon-chain`, `validator`, `prysmctl`).
  - Data in `/var/lib/ethereum/<component>/` (`execution`, `beacon`, `validator`), JWT at `/var/lib/ethereum/jwt.hex`.
  - One unprivileged system user per process: `execution`, `beacon`, `validator`.
- **Launcher:** interactive examples use `./prysm.sh beacon-chain …` / `./prysm.sh validator …`; Windows uses `prysm.bat`. Service examples call the binaries directly.
- **Placeholders:** `<ANGLE_BRACKET_CAPS>` inside code, and say what to replace them with. Never put a real-looking address or key in an example; use `0x0000000000000000000000000000000000000000` if a syntactically valid value is required.
- **Long commands:** one flag per line with `\` continuations.
- **Code block languages:** `bash`, `powershell`, `yaml`, `json`, `ini` (systemd units), `text` (log output). Add `title="..."` for files: ` ```yaml title="docker-compose.yml" `.
- **Log output:** show real Prysm log lines. Find them in the Prysm source (`log.WithField(...).Info("...")`) rather than inventing them.

## Tabs (shared `syncKey`s)

Tabs with the same `syncKey` and identical labels sync across the whole site. Use exactly these:

| syncKey | Labels (in this order) |
| --- | --- |
| `os` | `Linux, macOS` · `Windows` |
| `network` | `Hoodi` · `Mainnet` · `Sepolia` |
| `el` | `Geth` · `Nethermind` · `Besu` · `Erigon` · `Reth` · `Ethrex` |
| `runner` | `prysm.sh` · `Binaries` · `Docker` |
| `cl` | `Lighthouse` · `Teku` · `Nimbus` · `Lodestar` · `Grandine` |
| `format` | `YAML` · `JSON` |

Don't nest tabs more than two levels. If a page needs three dimensions, it probably needs splitting.

## Components

```mdx
import { Aside, Steps, Tabs, TabItem, LinkCard, CardGrid, FileTree, Badge } from '@site/src/components/ui';
import Flag from '@site/src/components/Flag';
import PrysmVersion from '@site/src/components/PrysmVersion';
```

- `<Flag name="checkpoint-sync-url" />` → linked `--checkpoint-sync-url` (beacon-chain by default). `bin="validator"` or `bin="prysmctl"` for others; `value="..."` renders `--name=value`. **The build fails if the flag doesn't exist**, which is intended. Use it in prose; inside code blocks write flags normally.
- `<PrysmVersion />` → current release (`v7.2.0`). Never hard-code the current version.
- Asides: `:::note`, `:::tip`, `:::caution`, `:::danger` (with `[Title]` optional). Use `danger` only for loss of funds or slashing.
- `<FileTree>` for directory layouts.


## Links

- Internal links are root-relative with a trailing slash: `[Checkpoint sync](/setup/checkpoint-sync/)`. The `/docs` base is added automatically. Anchors: `/setup/checkpoint-sync/#check-that-it-works` (github-slugger: lowercase, spaces → hyphens, punctuation removed).
- The full page list is `tools/ia.mjs`. Link only to slugs listed there. The build fails on broken links.
- Link flags with `<Flag>`, or to `/reference/cli/<bin>/#<flag-name>`.
- External links: official docs only (client docs, ethereum.org, EIPs, specs, GitHub). No blogs unless they are the primary source.

## Diagrams

For a simple diagram, write inline SVG in a React component under `src/components/diagrams/` and use CSS variables for colors (`var(--sl-color-white)`, `var(--sl-color-gray-3)`, `var(--sl-color-accent)`, `var(--sl-color-bg-nav)`) so it works in both themes. See `src/components/StackDiagram.tsx` for the house style. If a diagram is complex, leave `{/* DIAGRAM: precise description of what it must show */}` and mention it in your report; the lead will draw it.

## Accuracy rules (non-negotiable)

1. **Prysm flags:** every flag you mention must exist in `src/data/cli-*.json` (the `<Flag>` component enforces this in prose). Read the flag's implementation in `../prysm` (`/Users/manu/OffchainLabs/prysm`, at release v7.2.0 plus a few commits) when behavior matters: defaults, interactions, units.
2. **Prysm behavior:** confirm claims in the source, not in the old docs. The old docs are a source of *topics*, not facts. They contain mistakes (e.g. they claimed YAML config overrides CLI flags; the opposite is true).
3. **Other software** (execution clients, MEV-Boost, Web3Signer, deposit CLI): check flags and behavior against the project's official docs or source on GitHub for the current release (use WebFetch/WebSearch). Note the version you checked in an MDX comment near the command: `{/* Verified against Geth v1.16.x docs, 2026-09 */}`.
4. **If you can't verify something**, don't guess. Leave `{/* VERIFY: what and why */}` next to it and list it in your report.
5. Never invent log lines, metrics, URLs, version numbers or benchmark figures.

## Source material

- Pages removed or merged in the user-first restructure: `archive/v2-removed/` (same paths as they had under `docs/`). They were checked against the source during the v2 rewrite, so their facts are a good starting point; their depth is not. `src/data/v2-redirects.json` maps each removed URL to the page that absorbed it.
- Older v1 pages: `archive/v1-pages/` if present.
- Original Docusaurus docs: `/Users/manu/OffchainLabs/prysm-documentation/docs/`.
- Images: `public/images/` (reference as `/images/<file>`).
- Prysm source: `/Users/manu/OffchainLabs/prysm`. **Read only; never modify it, never run the beacon node or validator against a real network, never write to `~/Library/Eth2` or other default data dirs.** Running `--help` or unit-level `go run` tools is fine.

## Working rules

- Write only the pages your assignment owns (see the `owner` column in `tools/ia.mjs`), plus new files under `src/components/diagrams/` or `src/data/flag-notes/` if your assignment says so. Replace the whole stub file, including its frontmatter.
- Every page needs a real `description` (one sentence, used by search and link cards).
- Don't edit `docusaurus.config.ts`, `tools/ia.mjs`, `src/css/`, existing components, or other writers' pages. If you need a new page or a change there, say so in your report.
- **Verify with a build:** `npm run build` must exit 0 (it fails on broken links, broken anchors and unknown `<Flag>` names). If several people build at once, build a private copy instead, because Docusaurus writes a shared `.docusaurus/` folder:
  ```bash
  rsync -a --delete --exclude node_modules --exclude build --exclude .docusaurus --exclude archive ./ /tmp/<you>/site/
  ln -sfn "$PWD/node_modules" /tmp/<you>/site/node_modules
  (cd /tmp/<you>/site && npx docusaurus build)
  ```
- Never use `rm -rf` (blocked); use `trash` if you must delete something.

## Report

When done, reply with: pages written (slug + one line each), anything left as `VERIFY` or `DIAGRAM`, facts from the old docs you found to be wrong, and requests for the lead (new pages, components, sidebar changes).
