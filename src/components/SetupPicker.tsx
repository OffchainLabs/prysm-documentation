/**
 * Page-level setup picker: the reader picks their OS, network, execution
 * client and Engine API connection once (and, on pages that ask for them, what
 * to run, the initial sync, the validator options and how the validator client
 * talks to the beacon node), and every <When> block
 * on the page follows that choice.
 * The choice is stored in the Quickstart's localStorage entry, so a setup
 * picked on either page carries over to the other.
 *
 *   <SetupPicker />
 *   <SetupPicker groups="os net" />   (only these chips; the rest keep their saved value)
 *   <SetupPicker groups="net el conn role sync opts" />   (opts: MEV-Boost and fee recipient)
 *   <SetupPicker groups="os net" nets="mainnet hoodi" />   (only these networks; another saved one shows as the first)
 *   <SetupPicker groups="os net api" />   (api: gRPC or the Beacon API between validator client and beacon node)
 *   <SetupPicker groups="os net tool" />   (tool: prysmctl or the validator binary for account commands)
 *   <SetupPicker groups="devos" />   (devos: Linux or macOS, for building from source)
 *   <SetupPicker groups="os svc" />   (svc: systemd, Docker Compose or neither; systemd is Linux only)
 *   <When os="win" el="geth nethermind" conn="jwt" role="validator" mev="on">…</When>
 *
 * A heading inside a hidden <When> is also left out of the table of contents.
 *
 * <When> also fills `{net}` (mainnet, hoodi, sepolia), `{checkpoint}` (the
 * network's checkpoint sync URL), `{checkpoint2}` (a second, independent
 * provider to check it against) and `{explorer}` (the network's block
 * explorer) in the text and code blocks it contains, `{relays}` (the network's
 * MEV relay list) and `{fee}` (the fee recipient address, or a placeholder
 * until a valid one is entered).
 */
import React, { Children, cloneElement, isValidElement, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { NETWORKS, type NetworkId } from '@site/src/data/networks';
import { RELAYS } from '@site/src/data/relays';
import './SetupPicker.css';

type Key = 'os' | 'devos' | 'svc' | 'net' | 'el' | 'conn' | 'api' | 'tool' | 'role' | 'sync' | 'mev' | 'fee';
type ChipKey = Exclude<Key, 'mev' | 'fee'>;
type Setup = Record<Key, string>;

const STORAGE_KEY = 'prysm-quickstart';
const FEE_RE = /^0x[0-9a-fA-F]{40}$/;

const GROUPS: { key: ChipKey; legend: string; options: { value: string; label: string }[] }[] = [
	{
		key: 'os',
		legend: 'Operating system',
		options: [
			{ value: 'unix', label: 'Linux or macOS' },
			{ value: 'win', label: 'Windows' },
		],
	},
	{
		key: 'devos',
		legend: 'Operating system',
		options: [
			{ value: 'linux', label: 'Linux' },
			{ value: 'macos', label: 'macOS' },
		],
	},
	{
		key: 'svc',
		legend: 'Service manager',
		options: [
			{ value: 'systemd', label: 'systemd' },
			{ value: 'compose', label: 'Docker Compose' },
			{ value: 'none', label: 'None' },
		],
	},
	{
		key: 'net',
		legend: 'Network',
		options: NETWORKS.map((n) => ({ value: n.id, label: n.id === 'mainnet' ? n.name : `${n.name} testnet` })),
	},
	{
		key: 'el',
		legend: 'Execution client',
		options: [
			{ value: 'besu', label: 'Besu' },
			{ value: 'erigon', label: 'Erigon' },
			{ value: 'ethrex', label: 'Ethrex' },
			{ value: 'geth', label: 'Geth' },
			{ value: 'nethermind', label: 'Nethermind' },
			{ value: 'reth', label: 'Reth' },
		],
	},
	{
		key: 'conn',
		legend: 'Engine API connection',
		options: [
			{ value: 'jwt', label: 'HTTP with JWT' },
			{ value: 'ipc', label: 'IPC socket' },
		],
	},
	{
		key: 'api',
		legend: 'Beacon node connection',
		options: [
			{ value: 'grpc', label: 'gRPC' },
			{ value: 'rest', label: 'Beacon API (experimental)' },
		],
	},
	{
		key: 'tool',
		legend: 'Command',
		options: [
			{ value: 'prysmctl', label: 'prysmctl' },
			{ value: 'validator', label: 'validator' },
		],
	},
	{
		key: 'role',
		legend: 'What you want to run',
		options: [
			{ value: 'node', label: 'Beacon node only' },
			{ value: 'validator', label: 'Beacon node and validator client' },
		],
	},
	{
		key: 'sync',
		legend: 'Initial sync',
		options: [
			{ value: 'checkpoint', label: 'From a checkpoint' },
			{ value: 'genesis', label: 'From genesis' },
		],
	},
];

/** Chips shown when a page doesn't pass `groups`. */
const DEFAULT_GROUPS = 'os net el conn';

// Same defaults as the Quickstart.
const DEFAULTS: Setup = { os: 'unix', devos: 'linux', svc: 'systemd', net: 'mainnet', el: 'besu', conn: 'jwt', api: 'grpc', tool: 'prysmctl', role: 'node', sync: 'checkpoint', mev: '', fee: '' };

/** IPC is only documented for Geth, as in the Quickstart. */
const ipcAllowed = (el: string) => el === 'geth';

/** systemd is Linux only. */
const systemdAllowed = (os: string) => os !== 'win';

const listeners = new Set<() => void>();
let cache: Setup | null = null;
// Choices made on this page, kept even when localStorage is unavailable.
const chosen: Partial<Setup> = {};
// Networks the current page's picker offers, or null for all of them.
let allowedNets: string[] | null = null;

function readSaved(): Record<string, unknown> {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
	} catch {
		return {};
	}
}

function read(): Setup {
	if (!cache) {
		const saved: Record<string, unknown> = { ...readSaved(), ...chosen };
		cache = { ...DEFAULTS };
		for (const g of GROUPS) {
			const v = saved[g.key];
			if (typeof v === 'string' && g.options.some((o) => o.value === v)) cache[g.key] = v;
		}
		cache.mev = saved.mev === 'on' ? 'on' : '';
		cache.fee = typeof saved.fee === 'string' ? saved.fee : '';
		if (!ipcAllowed(cache.el)) cache.conn = 'jwt';
		if (!systemdAllowed(cache.os) && cache.svc === 'systemd') cache.svc = 'none';
		if (allowedNets && !allowedNets.includes(cache.net)) cache.net = allowedNets[0];
		// Sepolia's validator set is permissioned, so only a beacon node makes sense there.
		if (cache.net === 'sepolia') cache.role = 'node';
	}
	return cache;
}

function notify() {
	cache = null;
	listeners.forEach((l) => l());
}

function write(key: Key, value: string) {
	chosen[key] = value;
	// Keep the Quickstart's other settings (role, MEV-Boost, …) as they are.
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSaved(), [key]: value }));
	} catch {}
	notify();
}

/** Limits the networks for this page without changing the saved choice. */
function useAllowedNets(nets: string | undefined) {
	useEffect(() => {
		if (!nets) return;
		allowedNets = nets.split(/\s+/);
		notify();
		return () => {
			allowedNets = null;
			notify();
		};
	}, [nets]);
}

function subscribe(listener: () => void) {
	const onStorage = (e: StorageEvent) => {
		if (e.key !== STORAGE_KEY) return;
		cache = null;
		listener();
	};
	listeners.add(listener);
	window.addEventListener('storage', onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener('storage', onStorage);
	};
}

export function useSetup(): Setup {
	return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}

/** The fee recipient, or a placeholder until a valid address is entered. */
export const feeOrPlaceholder = (fee: string) => (FEE_RE.test(fee) ? fee : '<YOUR_WALLET_ADDRESS>');

/** Hides the table of contents entries whose heading is inside a hidden <When>. */
function syncToc() {
	document.querySelectorAll<HTMLAnchorElement>('.table-of-contents a[href^="#"]').forEach((a) => {
		const heading = document.getElementById(decodeURIComponent(a.hash.slice(1)));
		const li = a.closest('li');
		if (heading && li) li.hidden = heading.closest('[hidden]') !== null;
	});
}

function useTocSync(setup: Setup) {
	useEffect(syncToc, [setup]);
	// The mobile table of contents is only rendered when opened.
	useEffect(() => {
		const observer = new MutationObserver(syncToc);
		observer.observe(document.body, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, []);
}

/**
 * `groups` is a space-separated list of the chip groups to show, `opts` for the validator options.
 * `nets` is a space-separated list of the networks to offer, all of them when omitted.
 */
export function SetupPicker({ groups = DEFAULT_GROUPS, nets }: { groups?: string; nets?: string }) {
	const setup = useSetup();
	useTocSync(setup);
	useAllowedNets(nets);
	const netList = nets?.split(/\s+/);
	const wanted = groups.split(/\s+/);
	const shown = GROUPS.filter((g) => wanted.includes(g.key));
	const badFee = setup.fee !== '' && !FEE_RE.test(setup.fee);
	return (
		<form className="setup-picker" aria-label="Your setup" onSubmit={(e) => e.preventDefault()}>
			{shown.map((g) => (
				<fieldset key={g.key}>
					<legend>{g.legend}</legend>
					<div className="setup-picker-seg">
						{g.options
							.filter((o) => !(g.key === 'role' && o.value === 'validator' && setup.net === 'sepolia'))
							.filter((o) => !(g.key === 'net' && netList && !netList.includes(o.value)))
							.map((o) => (
								<label key={o.value}>
									<input
										type="radio"
										name={`setup-${g.key}`}
										value={o.value}
										checked={setup[g.key] === o.value}
										disabled={
											(g.key === 'conn' && o.value === 'ipc' && !ipcAllowed(setup.el)) ||
											(g.key === 'svc' && o.value === 'systemd' && !systemdAllowed(setup.os))
										}
										onChange={() => write(g.key, o.value)}
									/>
									<span>{o.label}</span>
								</label>
							))}
					</div>
				</fieldset>
			))}
			{wanted.includes('opts') && setup.role === 'validator' && (
				<fieldset className="setup-picker-wide">
					<legend>Options</legend>
					<label className="setup-picker-check">
						<input type="checkbox" checked={setup.mev === 'on'} onChange={(e) => write('mev', e.target.checked ? 'on' : '')} />
						<span>Use MEV-Boost for block building</span>
					</label>
					<label className="setup-picker-text">
						<span>Fee recipient address</span>
						<input
							type="text"
							placeholder="0x… an address you control"
							spellCheck={false}
							autoComplete="off"
							pattern="^0x[0-9a-fA-F]{40}$"
							value={setup.fee}
							onChange={(e) => write('fee', e.target.value)}
						/>
						<small className={badFee ? 'bad' : undefined}>
							{badFee
								? 'Enter a 20-byte address: 0x followed by 40 hex characters.'
								: 'Priority fees and MEV rewards from your proposals go here.'}
						</small>
					</label>
				</fieldset>
			)}
			{wanted.includes('role') && setup.net === 'sepolia' && (
				<p className="setup-picker-note setup-picker-wide">
					Sepolia’s validator set is permissioned, so only a beacon node is offered. Pick Hoodi to practise running a validator.
				</p>
			)}
		</form>
	);
}

const checkpoints: Record<string, string> = Object.fromEntries(NETWORKS.map((n) => [n.id, n.checkpointSyncUrl]));
const verifiers: Record<string, string> = Object.fromEntries(NETWORKS.map((n) => [n.id, n.checkpointVerifyUrl]));
const explorers: Record<string, string> = Object.fromEntries(NETWORKS.map((n) => [n.id, n.explorer]));

/** Replaces the placeholders in every string below `node`, code blocks and link targets included. */
function fill(node: ReactNode, setup: Setup): ReactNode {
	if (typeof node === 'string') {
		return node
			.replaceAll('{net}', setup.net)
			.replaceAll('{checkpoint}', checkpoints[setup.net])
			.replaceAll('{checkpoint2}', verifiers[setup.net])
			.replaceAll('{explorer}', explorers[setup.net])
			.replaceAll('{relays}', RELAYS[setup.net as NetworkId].list)
			.replaceAll('{fee}', feeOrPlaceholder(setup.fee));
	}
	if (Array.isArray(node)) return Children.map(node, (child) => fill(child, setup));
	if (isValidElement<{ children?: ReactNode; href?: string }>(node)) {
		const { children, href } = node.props;
		if (children === undefined && typeof href !== 'string') return node;
		// MDX percent-encodes the braces in link targets.
		const target = typeof href === 'string' ? href.replaceAll('%7B', '{').replaceAll('%7D', '}') : undefined;
		const props = target !== undefined ? { href: fill(target, setup) as string } : undefined;
		return children === undefined ? cloneElement(node, props) : cloneElement(node, props, fill(children, setup));
	}
	return node;
}

/** Each prop is a space-separated list of values; content shows when every given prop matches. */
export function When({ children, ...conditions }: Partial<Setup> & { children: ReactNode }) {
	const setup = useSetup();
	const match = (Object.entries(conditions) as [Key, string | undefined][]).every(
		([key, values]) => values === undefined || values.split(/\s+/).includes(setup[key]),
	);
	// Hidden rather than removed, so search still indexes every variant.
	return <div hidden={!match}>{fill(children, setup)}</div>;
}
