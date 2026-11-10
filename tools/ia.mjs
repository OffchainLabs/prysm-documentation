// Information architecture: every page of the site, its sidebar group, and
// which writer owns it. `sidebars.ts` builds the
// sidebar from this file, and `node tools/ia.mjs stubs` creates missing pages.

export const IA = [
	{
		label: 'Welcome',
		items: [
			['get-started/introduction', 'What is Prysm?', 'start'],
			['get-started/system-requirements', 'System requirements', 'start'],
			['get-started/quickstart', 'Quickstart', 'start'],
		],
	},
	{
		label: 'Install and update',
		items: [
			['install', 'Install Prysm', 'start'],
			['install/update', 'Update and roll back', 'start'],
		],
	},
	{
		label: 'Run an Ethereum node',
		items: [
			['setup/connect-execution-client', 'Connect your execution client', 'node'],
			['setup/checkpoint-sync', 'Sync from a checkpoint', 'node'],
			['setup/genesis-sync', 'Sync from genesis', 'node'],
			['setup/networking', 'Ports, peers and router setup', 'node'],
			['setup/run-with-docker-compose', 'Run with Docker Compose', 'node'],
			['setup/run-with-systemd', 'Run with systemd', 'node'],
			['setup/storage', 'Disk space', 'node'],
			['setup/archive-node', 'Run an archive node', 'node'],
			['operate/slasher', 'Run a slasher', 'node'],
		],
	},
	{
		label: 'Run validators',
		items: [
			['validators/doppelganger-protection', 'Turn on doppelganger protection', 'validators'],
			['validators/slashing-protection-history', 'Move your slashing protection history', 'validators'],
			['validators/avoid-slashing', 'Avoid slashing', 'validators'],
			['validators/create-keys', 'Create validator keys', 'validators'],
			['validators/import-keys', 'Import keys', 'validators'],
			['validators/connect-to-beacon-nodes', 'Connect to beacon nodes', 'validators'],
			['validators/fee-recipient', 'Set your fee recipient', 'validators'],
			['validators/mev-boost', 'Use MEV-Boost', 'validators'],
			['validators/builders', 'Use builders after Gloas (ePBS)', 'validators'],
			['validators/remote-signer', 'Use a remote signer', 'validators'],
			['validators/graffiti', 'Set graffiti', 'validators'],
			['validators/deposit', 'Deposit for a new validator', 'validators'],
			['validators/top-up', 'Top up a validator', 'validators'],
			['validators/add-withdrawal-address', 'Convert a `0x00` validator to `0x01`', 'validators'],
			['validators/upgrade-to-compounding', 'Convert a `0x01` validator to `0x02`', 'validators'],
			['validators/consolidate', 'Merge several validators into one', 'validators'],
			['validators/withdrawals', 'Withdraw ETH from a validator', 'validators'],
			['validators/exit', 'Exit a validator', 'validators'],
			['validators/keymanager', 'Use the Keymanager API', 'validators'],
		],
	},
	{
		label: 'Monitor and maintain',
		items: [
			['operate/check-health', 'Is my node healthy?', 'operate'],
			['operate/metrics', 'Beacon node metrics', 'operate'],
			['operate/validator-monitoring', 'Track validator performance', 'operate'],
			['operate/backup-and-restore', 'Back up and restore', 'operate'],
			['operate/move-to-new-machine', 'Move to a new machine', 'operate'],
			['operate/switch-clients', 'Switch clients', 'operate'],
		],
	},
	{
		label: 'Reference',
		items: [
			['reference/networks', 'Networks', 'reference'],
			['reference/cli', 'Common flags and config file', 'reference'],
			['reference/cli/beacon-chain', 'beacon-chain flags', 'reference'],
			['reference/cli/validator', 'validator flags', 'reference'],
			['reference/cli/prysmctl', 'prysmctl commands', 'reference'],
			['reference/apis', 'APIs', 'reference'],
			['reference/ports', 'Ports', 'reference'],
		],
	},
	{
		label: 'Security',
		items: [['security', 'Security checklist', 'operate']],
	},
	{
		label: 'Developer guide',
		items: [
			['developers', 'Overview', 'dev'],
			['developers/environment', 'Install Bazel with Bazelisk', 'dev'],
			['developers/build', 'Build with Bazel', 'dev'],
			['developers/run-from-source', 'Run with Bazel', 'dev'],
			['developers/unit-tests', 'Unit tests', 'dev'],
			['developers/e2e-tests', 'End-to-end tests', 'dev'],
			['developers/gazelle', 'Update BUILD files with Gazelle', 'dev'],
			['developers/docker-images', 'Build Docker images', 'dev'],
		],
	},
	{
		label: 'Learn',
		items: [
			['learn/how-staking-works', 'How staking works', 'reference'],
			['learn/keys-and-withdrawals', 'Keys and withdrawal credentials', 'reference'],
			['resources/mainnet-postmortems', 'Mainnet postmortems', 'reference'],
			['resources/testnet-postmortems', 'Testnet postmortems', 'reference'],
			['resources/help', 'Get help and resources', 'reference'],
		],
	},
];

/**
 * Docusaurus sidebar derived from IA. A slug maps to the doc id `slug`, or
 * `slug/index` when the page is a folder index.
 */
import { existsSync } from 'node:fs';
const docId = (slug) => (existsSync(`docs/${slug}/index.mdx`) ? `${slug}/index` : slug);
export function sidebar(groups = IA) {
	return groups.map((g) => ({
		type: 'category',
		label: g.label,
		collapsed: Boolean(g.collapsed),
		items: g.items.map((it) =>
			Array.isArray(it) ? { type: 'doc', id: docId(it[0]), label: it[1] } : sidebar([it])[0],
		),
	}));
}

/** Flat list of [slug, title, owner]. */
export function pages(groups = IA) {
	return groups.flatMap((g) => g.items.flatMap((it) => (Array.isArray(it) ? [it] : pages([it]))));
}
