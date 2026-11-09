/**
 * Interactive quickstart: the reader picks their OS, network, execution
 * client and options once, and every command on the page is generated for
 * that exact setup. Selections are mirrored to the URL hash so a setup can
 * be shared, and remembered locally for the next visit.
 */
import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import { NETWORKS, type NetworkId } from '@site/src/data/networks';
import { RELAYS } from '@site/src/data/relays';
import { Aside } from '@site/src/components/ui';
import './QuickstartBuilder.css';

const checkpoints: Record<string, string> = Object.fromEntries(NETWORKS.map((n) => [n.id, n.checkpointSyncUrl]));
const launchpads: Record<string, string> = Object.fromEntries(NETWORKS.map((n) => [n.id, n.launchpad ?? '']));
const HOODI_CONSOLE_DEPOSIT = `${NETWORKS.find((n) => n.id === 'hoodi')?.stakerConsole ?? ''}deposit`;

type Key = 'os' | 'net' | 'el' | 'conn' | 'role' | 'sync' | 'mev' | 'fee';
type State = Record<Key, string>;
const STORAGE_KEY = 'prysm-quickstart';
const KEYS: Key[] = ['os', 'net', 'el', 'conn', 'role', 'sync', 'mev', 'fee'];
const FEE_RE = /^0x[0-9a-fA-F]{40}$/;
const FEE_HINT = 'Priority fees and MEV rewards from your proposals go here.';

const groups: { key: Key; legend: string; options: { value: string; label: string }[] }[] = [
	{
		key: 'os',
		legend: 'Operating system',
		options: [
			{ value: 'unix', label: 'Linux or macOS' },
			{ value: 'win', label: 'Windows' },
		],
	},
	{
		key: 'net',
		legend: 'Network',
		options: [
			{ value: 'mainnet', label: 'Mainnet' },
			{ value: 'hoodi', label: 'Hoodi testnet' },
			{ value: 'sepolia', label: 'Sepolia testnet' },
		],
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

const DEFAULTS: State = {
	os: 'unix',
	net: 'mainnet',
	el: 'besu',
	conn: 'jwt',
	role: 'node',
	sync: 'checkpoint',
	mev: '',
	fee: '',
};

/** IPC is only documented for Geth. */
const ipcAllowed = (el: string) => ['geth'].includes(el);

/** Drops unknown values and falls back to HTTP with JWT where IPC isn't offered. */
function normalize(raw: Partial<Record<string, unknown>>): State {
	const s = { ...DEFAULTS };
	for (const g of groups) {
		const v = raw[g.key];
		if (typeof v === 'string' && g.options.some((o) => o.value === v)) s[g.key] = v;
	}
	s.mev = raw.mev === 'on' ? 'on' : '';
	s.fee = typeof raw.fee === 'string' ? raw.fee : '';
	if (s.conn === 'ipc' && !ipcAllowed(s.el)) s.conn = 'jwt';
	// Sepolia's validator set is permissioned, so only a beacon node makes sense there.
	if (s.net === 'sepolia') s.role = 'node';
	return s;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Joins flags onto one command, wrapping long lines with the shell's continuation char. */
function command(os: string, parts: string[]) {
	const cont = os === 'win' ? ' ^' : ' \\';
	const [head, ...flags] = parts.filter(Boolean);
	if (flags.length <= 1) return [head, ...flags].join(' ');
	return [head + cont, ...flags.map((f, i) => '  ' + f + (i < flags.length - 1 ? cont : ''))].join('\n');
}

function build(s: State) {
	const win = s.os === 'win';
	const prysm = win ? 'prysm.bat' : './prysm.sh';
	const net = s.net;
	// Programs live in ethereum/consensus, ethereum/execution and ethereum/mev-boost;
	// everything the clients store lives in ethereum/data, one folder per network.
	const sep = win ? '\\' : '/';
	const path = (...parts: string[]) => [win ? '%USERPROFILE%\\ethereum' : '$HOME/ethereum', ...parts].join(sep);
	const jwt = path('data', 'jwt.hex');
	const dd = path('data', net, 'execution');
	const bnDir = path('data', net, 'beacon');
	const vcDir = path('data', net, 'validator');
	const walletDir = path('data', net, 'validator', 'wallet');
	const ipc = win ? '\\\\.\\pipe\\geth.ipc' : path('data', net, 'execution', 'geth.ipc');
	const fee = FEE_RE.test(s.fee) ? s.fee : '<YOUR_WALLET_ADDRESS>';
	const ipcMode = s.conn === 'ipc';
	const validator = s.role === 'validator';
	// MEV-Boost and the fee recipient only matter for proposals, which need a validator.
	const mev = validator && s.mev === 'on';
	const exe = (name: string) => (win ? `${name}.exe` : `./${name}`);
	// curl.exe also works in PowerShell, where plain curl is an alias for Invoke-WebRequest.
	const curl = win ? 'curl.exe' : 'curl';

	// Every folder of the layout below, relative to ethereum/, so the reader creates them all at once.
	const rel = (...parts: string[]) => parts.join(sep);
	const folders = [
		'consensus',
		'execution',
		mev ? 'mev-boost' : '',
		rel('data', net, 'execution'),
		rel('data', net, 'beacon'),
		validator ? rel('data', net, 'validator', 'wallet') : '',
	].filter(Boolean);
	// Blank lines separate creating ethereum/, its subfolders, and the download.
	const install = [
		`${win ? 'mkdir' : 'mkdir -p'} ${path()}\ncd ${path()}`,
		command(s.os, [win ? 'mkdir' : 'mkdir -p', ...folders]),
		win
			? 'cd consensus\ncurl.exe https://raw.githubusercontent.com/OffchainLabs/prysm/master/prysm.bat --output prysm.bat\nreg add HKCU\\Console /v VirtualTerminalLevel /t REG_DWORD /d 1'
			: 'cd consensus\ncurl https://raw.githubusercontent.com/OffchainLabs/prysm/master/prysm.sh --output prysm.sh && chmod +x prysm.sh',
	].join('\n\n');

	const jwtCmd = `${prysm} beacon-chain generate-auth-secret --output-file=${jwt}`;

	// Commands mirror the per-client tabs in /setup/connect-execution-client/,
	// which record the client version each was checked against.
	const el: Record<string, string[]> = {
		geth: [
			exe('geth'),
			`--${net}`,
			`--datadir=${dd}`,
			ipcMode ? '' : `--authrpc.jwtsecret=${jwt}`,
		],
		nethermind: [exe('nethermind'), `-c ${net}`, `--data-dir ${dd}`, `--jsonrpc-jwtsecretfile ${jwt}`, '--History.Pruning=Rolling'],
		besu: [
			exe('besu'),
			`--network=${net}`,
			`--data-path=${dd}`,
			`--engine-jwt-secret=${jwt}`,
		],
		erigon: [
			exe('erigon'),
			`--chain=${net}`,
			`--datadir=${dd}`,
			'--externalcl',
			`--authrpc.jwtsecret=${jwt}`,
		],
		reth: [
			`${exe('reth')} node`,
			`--chain ${net}`,
			`--datadir ${dd}`,
			'--full',
			`--authrpc.jwtsecret ${jwt}`,
		],
		ethrex: [
			exe('ethrex'),
			`--network ${net}`,
			`--datadir ${dd}`,
			`--authrpc.jwtsecret ${jwt}`,
		],
	};
	const elParts = el[s.el];

	const elDocs: Record<string, [string, string]> = {
		geth: ['Geth', 'https://geth.ethereum.org/downloads'],
		nethermind: ['Nethermind', 'https://docs.nethermind.io/get-started/installing-nethermind'],
		besu: ['Besu', 'https://besu.hyperledger.org/public-networks/get-started/install/binary-distribution'],
		reth: ['Reth', 'https://reth.rs/installation/overview'],
		erigon: ['Erigon', 'https://docs.erigon.tech/get-started/installation'],
		ethrex: ['Ethrex', 'https://docs.ethrex.xyz/getting-started/index.html'],
	};
	const [elName, elUrl] = elDocs[s.el];
	const elIntro = (
		<>
			Install <a href={elUrl}>{elName}</a> into your <code>execution</code> folder, then start it from there
			{ipcMode ? '. Geth creates its IPC socket in its data directory, and the beacon node connects to it there' : ''}:
		</>
	);

	// Mirrors /validators/mev-boost/, checked against MEV-Boost v1.12, with every relay in the linked list.
	const relays = RELAYS[net as NetworkId];
	const mevBoost = command(s.os, [exe('mev-boost'), `-${net}`, '-color', '-relay-check', ...relays.urls.map((u) => `-relay ${u}`)]);

	const bn = [
		`${prysm} beacon-chain`,
		`--${net}`,
		`--datadir=${bnDir}`,
		ipcMode ? `--execution-endpoint=${ipc}` : `--jwt-secret=${jwt}`,
		s.sync === 'checkpoint' ? `--checkpoint-sync-url=${checkpoints[net]}` : '',
		s.sync === 'genesis' && net !== 'mainnet' ? `--genesis-state=${path('data', net, 'genesis.ssz')}` : '',
		validator ? `--suggested-fee-recipient=${fee}` : '',
		mev ? '--http-mev-relay=http://localhost:18550' : '',
		// Deletes blocks and states older than the ~5 months peers can request, so the database stays roughly flat.
		'--beacon-db-pruning',
		// With a validator attached, a stop or restart waits for its upcoming proposals.
		validator ? '--postpone-shutdown-for-proposals' : '',
	];
	const genesisRepo: Record<string, string> = {
		hoodi: 'https://github.com/eth-clients/hoodi/raw/main/metadata/genesis.ssz',
		sepolia: 'https://github.com/eth-clients/sepolia/raw/main/metadata/genesis.ssz',
	};
	const bnAfter = (
		<>
			{s.sync === 'checkpoint' ? (
				<>
					<p>
						Checkpoint sync fetches a recent finalized state, so the node follows the chain within minutes. By default,
						the beacon node doesn't backfill blocks older than the checkpoint; if you need them, add{' '}
						<code>--enable-backfill</code>.
					</p>
					<p>
						<code>{checkpoints[net]}</code> is one of
						several <a href="https://eth-clients.github.io/checkpoint-sync-endpoints/">community endpoints</a>; any one you
						trust works.
					</p>
				</>
			) : (
				<p>
					Syncing from genesis replays every block and takes days rather than minutes.
					{net !== 'mainnet' && (
						<>
							{' '}
							Download{' '}
							<a href={genesisRepo[net]}>
								<code>genesis.ssz</code>
							</a>{' '}
							into <code>ethereum/data/{net}</code> first.
						</>
					)}
				</p>
			)}
			<p>
				<code>--beacon-db-pruning</code> deletes blocks and states older than about 5 months, the oldest data other nodes can still ask for, so the database stops growing. Leave it out if you need the full history.
			</p>
			{mev && (
				<p>
					<code>--http-mev-relay</code> points the beacon node at the MEV-Boost instance you started in the previous
					step.
				</p>
			)}
			{validator && (
				<p>
					<code>--postpone-shutdown-for-proposals</code> keeps the node running when you stop it if your validator has a
					block to propose in the next 2 epochs, so updates and restarts don't cost you a proposal. Press{' '}
					<kbd>Ctrl</kbd>+<kbd>C</kbd> again to stop it at once.
				</p>
			)}
		</>
	);

	const keys = command(s.os, [
		win ? 'deposit.exe new-mnemonic' : './deposit new-mnemonic',
		`--chain=${net}`,
	]);
	const importCmd = command(s.os, [
		`${prysm} validator accounts import`,
		`--${net}`,
		'--keys-dir=<PATH_TO_VALIDATOR_KEYS>',
		`--wallet-dir=${walletDir}`,
	]);
	const listCmd = command(s.os, [`${prysm} validator accounts list`, `--${net}`, `--wallet-dir=${walletDir}`]);

	let deposit: ReactNode;
	if (net === 'mainnet') {
		deposit = (
			<>
				<p>
					Upload <code>deposit_data-*.json</code> on the <a href={launchpads[net]}>Staking Launchpad</a> and follow its
					checks before depositing 32 ETH.
				</p>
				<Aside type="danger" title="Only use the official launchpad">
					<p>
						Scam sites copy the launchpad and send your deposit to their own contract. Type the address yourself or use a
						bookmark; never follow links from ads, search results, chats or emails.
					</p>
					<ul>
						<li>
							<strong>Launchpad:</strong> <a href={launchpads[net]}>{launchpads[net]}</a>
						</li>
					</ul>
				</Aside>
			</>
		);
	} else {
		deposit = (
			<>
				<p>
					Upload <code>deposit_data-*.json</code> on the <a href={HOODI_CONSOLE_DEPOSIT}>EthStaker console</a> and deposit
					32 Hoodi ETH. Never send real ETH to a testnet deposit contract.
				</p>
				<Aside type="danger" title="Only use the official console">
					<p>
						Scam sites copy the console and send your deposit to their own contract. Type the address yourself or use a
						bookmark; never follow links from ads, search results, chats or emails.
					</p>
					<ul>
						<li>
							<strong>Deposit page:</strong> <a href={HOODI_CONSOLE_DEPOSIT}>{HOODI_CONSOLE_DEPOSIT}</a>
						</li>
					</ul>
				</Aside>
			</>
		);
	}

	const vc = [
		`${prysm} validator`,
		`--${net}`,
		`--datadir=${vcDir}`,
		`--wallet-dir=${walletDir}`,
		`--suggested-fee-recipient=${fee}`,
		mev ? '--enable-builder' : '',
		'--enable-doppelganger',
	];

	const notes: string[] = [];
	if (validator && net === 'mainnet') notes.push('Running a validator for the first time? It is advised to first try on Hoodi testnet.');
	if (net === 'sepolia') notes.push('Sepolia’s validator set is permissioned, so only a beacon node is offered. Pick Hoodi to practise running a validator.');
	if (ipcMode && !ipcAllowed(s.el)) notes.push(`IPC is shown for Geth only, so ${elName} uses HTTP with JWT.`);
	if (win && ['reth', 'ethrex'].includes(s.el))
		notes.push(`${elName} doesn't publish Windows builds (only Linux and Apple-silicon macOS). Pick another execution client on Windows.`);

	const layout = [
		'ethereum/',
		'├── consensus/',
		'├── execution/',
		mev ? '├── mev-boost/' : '',
		'└── data/',
		`    └── ${net}/`,
		'        ├── execution/',
		validator ? '        ├── beacon/' : '        └── beacon/',
		validator ? '        └── validator/' : '',
		validator ? '            └── wallet/' : '',
	]
		.filter(Boolean)
		.join('\n');

	return {
		install,
		layout,
		jwt: jwtCmd,
		el: command(s.os, elParts),
		elIntro,
		mevBoost,
		relayList: relays.list,
		bn: command(s.os, bn),
		bnAfter,
		keys,
		import: importCmd,
		list: listCmd,
		deposit,
		vc: command(s.os, vc),
		notes,
		syncing: `${curl} http://localhost:3500/eth/v1/node/syncing`,
		validatorStatus: `${curl} -s http://localhost:3500/eth/v1/beacon/states/head/validators/<VALIDATOR_PUBKEY>`,
		explorer: net === 'mainnet' ? 'https://beaconcha.in' : `https://${net}.beaconcha.in`,
		checks: `${curl} -s http://localhost:3500/eth/v1/node/syncing\n${curl} -s http://localhost:3500/eth/v1/node/peer_count`,
	};
}

function highlight(code: string) {
	// Colour flags and placeholders; everything else stays plain.
	return esc(code)
		.replace(/(&lt;[A-Z0-9_]+&gt;)/g, '<mark class="ph">$1</mark>')
		.replace(/(^|\s)(--?[a-zA-Z][\w.-]*)/g, '$1<span class="fl">$2</span>');
}

/** Briefly swaps a button's label after a clipboard write. */
function useFlash(idle: string, ms: number): [string, (text: string) => void] {
	const [label, setLabel] = useState(idle);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);
	return [
		label,
		(text) => {
			setLabel(text);
			clearTimeout(timer.current);
			timer.current = setTimeout(() => setLabel(idle), ms);
		},
	];
}

function Code({ name, code }: { name: string; code: string }) {
	const [label, flash] = useFlash('Copy', 1600);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			flash('Copied');
		} catch {
			flash('Select and copy');
		}
	};
	return (
		<div className="qs-code" data-cmd={name}>
			<pre>
				<code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
			</pre>
			<button type="button" className="qs-copy" aria-label="Copy command" onClick={copy}>
				{label}
			</button>
		</div>
	);
}

const STEP_IDS = [
	'install-prysm',
	'create-a-jwt-secret',
	'start-your-execution-client',
	'start-your-beacon-node',
	'create-validator-keys',
	'start-mev-boost',
	'import-your-keys',
	'check-your-imported-keys',
	'start-your-validator-client',
	'make-your-deposit',
];

export default function QuickstartBuilder() {
	const brokenLinks = useBrokenLinks();
	STEP_IDS.forEach((id) => brokenLinks.collectAnchor(id));

	const [s, setS] = useState<State>(DEFAULTS);
	const [restored, setRestored] = useState(false);
	const [shareLabel, flashShare] = useFlash('Copy link to this setup', 1800);

	// Restore: a shared link in the URL hash wins over the remembered setup.
	// The hash leaves out unset options and the fee address, so only the fee
	// is carried over from the remembered setup.
	useEffect(() => {
		const fromHash = Object.fromEntries(new URLSearchParams(location.hash.slice(1)));
		let saved: Partial<State> = {};
		try {
			saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
		} catch {}
		setS(normalize(fromHash.net ? { fee: saved.fee, ...fromHash } : saved));
		setRestored(true);
	}, []);

	useEffect(() => {
		if (!restored) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
		} catch {}
		const params = new URLSearchParams(Object.entries(s).filter(([k, v]) => v && k !== 'fee'));
		history.replaceState(history.state, '', `#${params}`);
	}, [s, restored]);

	const set = (k: Key, v: string) => setS((prev) => normalize({ ...prev, [k]: v }));
	const out = build(s);
	const badFee = s.fee !== '' && !FEE_RE.test(s.fee);
	const validator = s.role === 'validator';

	const share = async () => {
		try {
			await navigator.clipboard.writeText(location.href);
			flashShare('Link copied');
		} catch {
			flashShare('Copy the address bar');
		}
	};

	return (
		<div className="qs">
			<form className="qs-config" aria-label="Your setup" onSubmit={(e) => e.preventDefault()}>
				<div className="qs-config-head">
					<p className="qs-config-title">Your setup</p>
					<button type="button" className="qs-share" onClick={share}>
						{shareLabel}
					</button>
				</div>
				<div className="qs-groups">
					{groups.map((g) => (
						<fieldset className="qs-group" key={g.key}>
							<legend>{g.legend}</legend>
							<div className="qs-seg">
								{g.options
									.filter((o) => !(g.key === 'role' && o.value === 'validator' && s.net === 'sepolia'))
									.map((o) => (
										<label key={o.value}>
											<input
												type="radio"
												name={g.key}
												value={o.value}
												checked={s[g.key] === o.value}
												disabled={g.key === 'conn' && o.value === 'ipc' && !ipcAllowed(s.el)}
												onChange={() => set(g.key, o.value)}
											/>
											<span>{o.label}</span>
										</label>
									))}
							</div>
						</fieldset>
					))}
					{validator && (
						<fieldset className="qs-group qs-wide">
							<legend>Options</legend>
							<label className="qs-check">
								<input type="checkbox" name="mev" checked={s.mev === 'on'} onChange={(e) => set('mev', e.target.checked ? 'on' : '')} />
								<span>Use MEV-Boost for block building</span>
							</label>
							<label className="qs-text">
								<span>Fee recipient address</span>
								<input
									type="text"
									name="fee"
									placeholder="0x… an address you control"
									spellCheck={false}
									autoComplete="off"
									pattern="^0x[0-9a-fA-F]{40}$"
									value={s.fee}
									onChange={(e) => set('fee', e.target.value)}
								/>
								<small className={badFee ? 'bad' : undefined}>
									{badFee ? 'Enter a 20-byte address: 0x followed by 40 hex characters.' : FEE_HINT}
								</small>
							</label>
						</fieldset>
					)}
				</div>
				{out.notes.map((n) => (
					<p className="qs-note" key={n}>
						{n}
					</p>
				))}
			</form>

			{validator && s.net === 'hoodi' && (
				<div className="qs-card">
					<p className="qs-card-title">Need Hoodi ETH?</p>
					<p>The deposit at the end of this guide takes 32 Hoodi ETH. Get some for free from a faucet:</p>
					<ul>
						<li>
							<a href="https://cloud.google.com/application/web3/faucet/ethereum/hoodi">Google Cloud Hoodi faucet</a>
						</li>
						<li>
							<a href="https://hoodi-faucet.pk910.de/">pk910 Hoodi PoW faucet</a>
						</li>
					</ul>
					<p>A faucet only needs an address. Never give one your mnemonic or private key.</p>
				</div>
			)}

			<ol className="qs-steps">
				<li>
					<h2 id="install-prysm">Install Prysm</h2>
					<p>
						Everything goes into an <code>ethereum</code> folder in your home directory, on your SSD. The programs live in{' '}
						<code>consensus</code> and <code>execution</code>, and everything the clients store goes into{' '}
						<code>ethereum/data</code>, one folder per network. The commands below use this layout:
					</p>
					<pre className="qs-tree" aria-label="Folder layout">
						{out.layout}
					</pre>
					<p>
						Create the folders, then download the Prysm launcher script into <code>consensus</code>:
					</p>
					<Code name="install" code={out.install} />
					<p hidden={s.os !== 'unix'}>
						<code>prysm.sh</code> downloads the latest release binaries on first run and verifies their checksums and
						signatures. Pin a release with <code>USE_PRYSM_VERSION</code>.
					</p>
					<p hidden={s.os !== 'win'}>
						The registry change enables coloured log output in Windows terminals. <code>prysm.bat</code> downloads the
						latest release on first run.
					</p>
				</li>

				<li hidden={s.conn !== 'jwt'}>
					<h2 id="create-a-jwt-secret">Create a JWT secret</h2>
					<p>
						The beacon node and execution client authenticate each other with a shared secret. Generate it from the{' '}
						<code>consensus</code> folder into <code>ethereum/data</code>, where both clients read it:
					</p>
					<Code name="jwt" code={out.jwt} />
				</li>

				<li>
					<h2 id="start-your-execution-client">Start your execution client</h2>
					<p data-cmd-text="elIntro">{out.elIntro}</p>
					<Code name="el" code={out.el} />
					<p>
						The execution client waits for a beacon node before it starts syncing, so don't worry if it looks idle. Leave
						it running in its own terminal.
					</p>
				</li>

				<li hidden={!validator || s.mev !== 'on'}>
					<h2 id="start-mev-boost">Start MEV-Boost</h2>
					<p>
						Download MEV-Boost from its <a href="https://github.com/flashbots/mev-boost/releases">releases</a> into your{' '}
						<code>mev-boost</code> folder, then start it from there:
					</p>
					<Code name="mevBoost" code={out.mevBoost} />
					<p>
						The command uses the working relays from the{' '}
						<a href={out.relayList}>EthStaker relay list for {s.net === 'mainnet' ? 'mainnet' : 'Hoodi'}</a>. Relays differ
						in what they filter and how they share profits; the list describes each one, so remove any you don't want to use.
						MEV-Boost listens on <code>localhost:18550</code>. Leave it running in its own terminal.
					</p>
				</li>

				<li>
					<h2 id="start-your-beacon-node">Start your beacon node</h2>
					<p>
						From the <code>consensus</code> folder, start the beacon node. The first run asks you to accept the terms of
						use.
					</p>
					<Code name="bn" code={out.bn} />
					<div data-cmd-html="bnAfter">{out.bnAfter}</div>
					<p>
						Check progress with <code>{out.syncing}</code>.
					</p>
				</li>

				<li hidden={!validator}>
					<h2 id="create-validator-keys">Create validator keys</h2>
					<p>
						Download the <a href="https://github.com/ethstaker/ethstaker-deposit-cli/releases">EthStaker deposit CLI</a>,
						ideally onto a machine that has never been connected to the internet. Generate a mnemonic and your validator
						keys:
					</p>
					<Code name="keys" code={out.keys} />
					<p>
						The CLI asks how many validators to create and for a withdrawal address. Use an address you control:
						withdrawals and the stake itself go there when you exit. It also asks you to choose a keystore password; you'll
						need it in the next step to import the keys into Prysm. Write the 24-word mnemonic down on paper and keep it
						offline. Anyone who has it controls your validator and its withdrawal. The CLI writes a <code>validator_keys</code> folder containing a{' '}
						<code>deposit_data-*.json</code> file and one <code>keystore-m_*.json</code> per validator.
					</p>
				</li>

				<li hidden={!validator}>
					<h2 id="import-your-keys">Import your keys into Prysm</h2>
					<Code name="import" code={out.import} />
					<p>
						Replace <code>&lt;PATH_TO_VALIDATOR_KEYS&gt;</code> with the path to the <code>validator_keys</code> folder: the
						directory containing all the <code>keystore-m_*.json</code> files created in the previous step.
					</p>
					<p>The import first asks you to choose a password for the new wallet:</p>
					<pre className="qs-tree" aria-label="Wallet password prompts">
						{'New wallet password:\nConfirm password:'}
					</pre>
					<p>You'll need this wallet password later, every time you start the validator client.</p>
					<p>It then asks for the password of the keys you're importing:</p>
					<pre className="qs-tree" aria-label="Keystore password prompt">
						{'Enter the password for your imported accounts:'}
					</pre>
					<p>
						This is the keystore password you chose in the deposit CLI when creating your validator keys. Once the keys
						are imported, the validator client no longer needs it.
					</p>
				</li>

				<li hidden={!validator}>
					<h2 id="check-your-imported-keys">Check your imported keys</h2>
					<p>List the accounts in the wallet to make sure every key was imported:</p>
					<Code name="list" code={out.list} />
					<p>It asks for the wallet password you just chose, then prints one account per imported key:</p>
					<pre className="qs-tree" aria-label="Account list">
						{'(keymanager kind) local wallet\n\nShowing 1 validator account\n\nAccount 0 | <ACCOUNT_NAME>\n[validating public key] 0x<VALIDATOR_PUBKEY>'}
					</pre>
					<p>
						Check that the number of accounts matches the number of validators you created, and that each public key
						matches the <code>pubkey</code> of a validator in your <code>deposit_data-*.json</code> file (which leaves out the{' '}
						<code>0x</code> prefix).
					</p>
				</li>

				<li hidden={!validator}>
					<h2 id="start-your-validator-client">Start your validator client</h2>
					<p>
						From the <code>consensus</code> folder, start the validator client with the wallet you just created:
					</p>
					<Code name="vc" code={out.vc} />
					<p>On startup, it asks for the wallet password:</p>
					<pre className="qs-tree" aria-label="Wallet password prompt">
						{'Wallet password:'}
					</pre>
					<p>
						Enter the password you chose at the <code>New wallet password:</code> prompt when importing your keys. To start
						the validator client without typing the password, pass a file containing it with{' '}
						<code>--wallet-password-file</code>.
					</p>
					<p>
						Until both the beacon node and the execution client are synced, the validator client logs this warning every
						slot. That's expected:
					</p>
					<pre className="qs-tree" aria-label="Validator client warning">
						{'WARN fallback: No responsive beacon node found tried=[127.0.0.1:4000]'}
					</pre>
					<p>Check the beacon node's sync status:</p>
					<Code name="syncing" code={out.syncing} />
					<p>Everything is running correctly once the response shows all three of these as <code>false</code>:</p>
					<ul>
						<li>
							<code>"el_offline": false</code>: the execution client is online. This should be the case as soon as it is
							up and running.
						</li>
						<li>
							<code>"is_syncing": false</code>: the beacon node is synced. This takes{' '}
							{s.sync === 'checkpoint' ? 'a few minutes from a checkpoint' : 'a few days from genesis'}.
						</li>
						<li>
							<code>"is_optimistic": false</code>: the execution client is synced. This takes from a few hours to a few
							days, depending on your execution client.
						</li>
					</ul>
				</li>

				<li hidden={!validator}>
					<h2 id="make-your-deposit">Make your deposit</h2>
					<p>
						Deposit only once the sync check at the end of the previous step shows all three values as <code>false</code>.
					</p>
					<div data-cmd-html="deposit">{out.deposit}</div>
					<p>
						The beacon chain then processes the deposit and puts your validator in the activation queue. Activation takes
						anywhere from hours to weeks depending on the queue. The validator client logs each stage:
					</p>
					<pre className="qs-tree" aria-label="Validator activation logs">
						{
							'Waiting for deposit to be observed by beacon node\nValidator deposited, entering activation queue after finalization\nWaiting for activation... Check validator queue status in a block explorer\nValidator activated'
						}
					</pre>
					<p>
						Keep all your clients running; once active, your validator attests and proposes automatically. To keep them
						running after a reboot, run them as services with Docker Compose or systemd.
					</p>
				</li>
			</ol>

			<h2 id="check-that-it-works">Check that it works</h2>
			<p>Leave both programs running and open a new terminal. Ask the beacon node whether it has caught up:</p>
			<Code name="checks" code={out.checks} />
			<p>Your node is ready when the first command shows all three of these:</p>
			<ul>
				<li>
					<code>"is_syncing":false</code>: the beacon node has caught up with the chain.
				</li>
				<li>
					<code>"is_optimistic":false</code>: the execution client has caught up too. It stays <code>true</code> while
					the execution client is still syncing, which can take hours.
				</li>
				<li>
					<code>"el_offline":false</code>: the beacon node can reach the execution client.
				</li>
			</ul>
			<p>
				The second command should show a <code>connected</code> count that grows over the first minutes. Tens of peers is
				normal; Prysm aims for up to 70.
			</p>
			<p>In the beacon node's terminal, a synced node logs one line per block, about every 12 seconds:</p>
			<pre className="qs-tree" aria-label="Synced beacon node log">
				{
					'INFO blockchain: Synced new block block=0x5b7dd003... epoch=385801 finalizedEpoch=385799 finalizedRoot=0xcdeff59f... sinceSlotStartTime=1.9s slot=12345650'
				}
			</pre>
			<p>
				Every minute it also logs <code>Connected peers</code> with the current <code>total</code>. If you see few peers,
				open your P2P ports: 13000 (TCP and UDP) and 12000 (UDP).
			</p>

			{validator && (
				<>
					<h3 id="check-your-validator">Check your validator</h3>
					<p>
						Once active, the validator attests once per epoch (every 6 min 24 s on average). Look for this line in the
						validator client's output:
					</p>
					<pre className="qs-tree" aria-label="Validator attestation log">
						{
							'INFO client: Submitted new attestations blockRoot=0x5e3a3cb822d6 committeeIndices=[13] pubkeys=[0xa1b2c3d4e5f6] sinceSlotStartTime=4.01s slot=12345651 sourceEpoch=385800 sourceRoot=0xa02cc7706494 targetEpoch=385801 targetRoot=0x72d7a888b2f0'
						}
					</pre>
					<p>
						You can also ask the beacon node for the validator's status. Replace <code>&lt;VALIDATOR_PUBKEY&gt;</code> with
						the public key from your keystore file (<code>0x</code> followed by 96 hex characters):
					</p>
					<Code name="validatorStatus" code={out.validatorStatus} />
					<p>
						<code>"status":"active_ongoing"</code> means your validator is live. Look it up on{' '}
						<a href={out.explorer}>{out.explorer.replace('https://', '')}</a> to follow its rewards.
					</p>
					<p className="qs-warn">
						<strong>Run each key in one place only.</strong> Never run the same validator keys in two validator clients at
						once, not even as a backup. Both would sign, and your validator would be slashed.
					</p>
				</>
			)}
		</div>
	);
}
