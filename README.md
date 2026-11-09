# Prysm documentation

Source for [prysm.offchainlabs.com/docs](https://prysm.offchainlabs.com/docs/), built with [Docusaurus](https://docusaurus.io).

## Develop

```bash
npm install
npm start          # http://localhost:3000/docs/
npm run build      # static site in build/, fails on broken links and anchors
npm run serve      # serve build/ locally (search works only on a build)
```

## Layout

| Path | What lives there |
| --- | --- |
| `docs/` | Pages, one `.mdx` file per page. The URL mirrors the path. |
| `tools/ia.mjs` | Every page and its sidebar group. `sidebars.ts` is built from it. |
| `tools/WRITING.md` | Writing guide: voice, page structure, conventions, accuracy rules. Read it before writing. |
| `src/components/` | React components: Quickstart builder, CLI reference, network table, diagrams, landing page. |
| `src/components/ui.tsx` | `Aside`, `Steps`, `Tabs`/`TabItem`, `LinkCard`, `CardGrid`, `FileTree`, `Badge` used by the pages. |
| `src/data/` | Generated CLI flag dumps, flag notes, network parameters, legacy URL redirects. |
| `src/data/flag-notes/` | Hand-written explanations merged into the generated CLI reference, one JSON file per binary. |
| `src/css/custom.css` | Colours, type and theme overrides for both color modes. |
| `static/` | Images and downloadable assets, served as-is. |
| `docusaurus.config.ts` | Site settings, navbar, footer, plugins. |

When adding a page, add it to `tools/ia.mjs`; `node tools/ia-stubs.mjs` creates placeholders for new entries.

## Writing

- Link to pages by root-relative path with a trailing slash: `[Checkpoint sync](/setup/checkpoint-sync/)`. The `/docs/` base is added automatically.
- Import components from `@site/src/components/...`, for example `import { Aside, Steps } from '@site/src/components/ui';`.
- Use `<PrysmVersion />` instead of hard-coding the current release, and `<Flag name="..." />` to mention a flag: it links to the reference and fails the build if the flag doesn't exist.
- Tabs that share a `syncKey` stay in sync across the site and must use identical labels; see `tools/WRITING.md`.

## Updating the CLI reference

The flag reference is generated from Prysm's source, so it never drifts from the release. The `update-cli-reference` GitHub workflow does this every Monday from the latest Prysm release and opens a PR when anything changes. To do it by hand, generate from the exact release tag, not from `develop`:

```bash
mkdir -p /tmp/prysm-release && git -C ../prysm archive v7.2.0 | tar -x -C /tmp/prysm-release
PRYSM_VERSION=v7.2.0 npm run gen:cli -- /tmp/prysm-release
```

This builds `beacon-chain`, `validator` and `prysmctl` with a Go build overlay that dumps their flags as JSON into `src/data/`. The Prysm checkout isn't modified. The current release shown across the site (`PRYSM_VERSION`) comes from the same step.

## Deploying

`vercel.json` builds the site and moves the output under `build/docs/` to match the `/docs/` base. Old URLs from the previous docs redirect to their new locations, both through `@docusaurus/plugin-client-redirects` (`src/data/legacy-redirects.json`) and through the older redirects carried over in `vercel.json`.

`@signalwire/docusaurus-plugin-llms-txt` writes `llms.txt`, `llms-full.txt` and a `.md` copy of every page. `middleware.js` (Vercel Routing Middleware) serves that `.md` copy to clients that send `Accept: text/markdown`.
