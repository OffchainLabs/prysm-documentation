/**
 * The systemd page's generated commands and unit files, built from the
 * reader's choices in the page's <SetupPicker>, as <ComposeFile> does for
 * Docker Compose.
 *
 *   <SystemdLayout />
 *   <SystemdPrepare />
 *   <SystemdUnit name="execution" />   (also mev-boost, beacon, validator)
 *   <SystemdStart />
 *   <SystemdCheck />
 *   <SystemdLogs />
 *   <SystemdRemove part="stop" />   (then part="delete")
 */
import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import { NETWORKS, type NetworkId } from '@site/src/data/networks';
import { RELAYS } from '@site/src/data/relays';
import { feeOrPlaceholder, useSetup } from '@site/src/components/SetupPicker';

const checkpoints: Record<string, string> = Object.fromEntries(NETWORKS.map((n) => [n.id, n.checkpointSyncUrl]));

const ROOT = '/var/lib/ethereum';
const JWT = `${ROOT}/jwt.hex`;
const EL_DIR = `${ROOT}/execution`;
const GENESIS = `${ROOT}/genesis.ssz`;
// Geth creates its IPC socket in its data directory by default.
const IPC = `${EL_DIR}/geth.ipc`;

// Flags mirror the per-client tabs in /setup/connect-execution-client/ and the
// Docker Compose page, checked against Geth v1.17.6, Nethermind 2.0.0, Besu 26.9.0,
// Erigon v3.7.0, Reth v2.7.0 and Ethrex v27.0.0, 2026-09.
const CLIENTS: Record<string, { bin: string; args: (net: string, ipc: boolean) => string[] }> = {
	besu: {
		bin: '/opt/besu/bin/besu',
		args: (net) => [`--network=${net}`, `--data-path=${EL_DIR}`, `--engine-jwt-secret=${JWT}`],
	},
	erigon: {
		bin: '/usr/local/bin/erigon',
		args: (net) => [`--chain=${net}`, `--datadir=${EL_DIR}`, '--externalcl', `--authrpc.jwtsecret=${JWT}`],
	},
	ethrex: {
		bin: '/usr/local/bin/ethrex',
		args: (net) => [`--network=${net}`, `--datadir=${EL_DIR}`, `--authrpc.jwtsecret=${JWT}`],
	},
	geth: {
		bin: '/usr/local/bin/geth',
		args: (net, ipc) => [`--${net}`, `--datadir=${EL_DIR}`, ipc ? '' : `--authrpc.jwtsecret=${JWT}`].filter(Boolean),
	},
	nethermind: {
		bin: '/opt/nethermind/nethermind',
		// Its logs default to the install folder, which the unit makes read-only.
		args: (net) => [
			`--config=${net}`,
			`--data-dir=${EL_DIR}`,
			`--jsonrpc-jwtsecretfile=${JWT}`,
			'--History.Pruning=Rolling',
			`--Init.LogDirectory=${EL_DIR}/logs`,
		],
	},
	reth: {
		bin: '/usr/local/bin/reth node',
		// Its logs default to a home directory, which the unit blocks.
		args: (net) => [`--chain=${net}`, `--datadir=${EL_DIR}`, '--full', `--authrpc.jwtsecret=${JWT}`, `--log.file.directory=${EL_DIR}/logs`],
	},
};

function useSystemd() {
	const s = useSetup();
	const ipc = s.conn === 'ipc' && s.el === 'geth';
	const validator = s.role === 'validator';
	return {
		s,
		ipc,
		validator,
		mev: validator && s.mev === 'on',
		genesis: s.sync === 'genesis' && s.net !== 'mainnet',
		// Geth makes its IPC socket readable by its own user only, so the beacon node runs as that user.
		beaconUser: ipc ? 'execution' : 'beacon',
	};
}

const services = (validator: boolean, mev: boolean) =>
	['execution', mev ? 'mev-boost' : '', 'beacon', validator ? 'validator' : ''].filter(Boolean);

export function SystemdLayout() {
	const { s, validator, mev, ipc, genesis } = useSystemd();
	// Nethermind and Besu ship as a folder, unpacked into /opt; the other binaries go in /usr/local/bin.
	const opt = CLIENTS[s.el].bin.startsWith('/opt/') ? `/opt/${s.el}/` : '';
	const bins = ['beacon-chain', validator ? 'validator' : '', opt ? '' : s.el, mev ? 'mev-boost' : ''].filter(Boolean);
	const lines = [
		`/usr/local/bin/          # ${bins.join(', ')}`,
		opt ? `${opt.padEnd(25)}# ${s.el === 'besu' ? 'Besu' : 'Nethermind'}` : '',
		`${ROOT}/`,
		ipc ? '' : '├── jwt.hex              # shared by the execution client and beacon node',
		genesis ? '├── genesis.ssz          # the network\'s genesis state' : '',
		`├── execution/           # execution client data${ipc ? ', and geth.ipc' : ''}`,
		`${validator ? '├' : '└'}── beacon/              # beacon node data`,
		validator ? '└── validator/           # wallet, wallet-password.txt, slashing protection' : '',
	].filter(Boolean);
	return <CodeBlock language="text">{lines.join('\n')}</CodeBlock>;
}

export function SystemdPrepare() {
	const { s, ipc, validator, genesis, beaconUser } = useSystemd();
	const users = ['execution', ipc ? '' : 'beacon', validator ? 'validator' : ''].filter(Boolean);
	const useradd = 'sudo useradd --system --no-create-home --shell /usr/sbin/nologin';
	// Each group gets a comment and is set apart by a blank line.
	const groups: string[][] = [
		[
			`# Create ${users.length === 1 ? 'a system user' : 'one system user per service'}: no password, no home folder, no login shell.`,
			users.length === 1 ? '' : '# Each service runs as its own user.',
			...(users.length === 1 ? [`${useradd} ${users[0]}`] : [`for u in ${users.join(' ')}; do`, `  ${useradd} $u`, 'done']),
		],
		[
			'# Create the data directories. Each one is readable and writable only by its service\'s user.',
			ipc ? '# The beacon node runs as the execution user, to reach Geth\'s IPC socket.' : '',
			`sudo install -d -m 0755 ${ROOT}`,
			`sudo install -d -m 0700 -o execution -g execution ${EL_DIR}`,
			`sudo install -d -m 0700 -o ${beaconUser} -g ${beaconUser} ${ROOT}/beacon`,
			validator ? `sudo install -d -m 0700 -o validator -g validator ${ROOT}/validator` : '',
		],
		ipc
			? []
			: [
					'# Create an "ethereum" group with the execution client and beacon node in it.',
					'sudo groupadd --system ethereum',
					'sudo usermod -aG ethereum execution',
					'sudo usermod -aG ethereum beacon',
				],
		ipc
			? []
			: [
					'# Create the JWT secret: 32 random bytes, written as hex.',
					'# Only root can change it, and only the "ethereum" group can read it.',
					`openssl rand -hex 32 | tr -d "\\n" | sudo tee ${JWT} > /dev/null`,
					`sudo chown root:ethereum ${JWT}`,
					`sudo chmod 0640 ${JWT}`,
				],
		genesis
			? [
					'# Download the network\'s genesis state.',
					`sudo curl -L https://github.com/eth-clients/${s.net}/raw/main/metadata/genesis.ssz --output ${GENESIS}`,
				]
			: [],
	];
	const lines = groups.map((g) => g.filter(Boolean).join('\n')).filter(Boolean);
	return <CodeBlock language="bash">{lines.join('\n\n')}</CodeBlock>;
}

interface UnitSpec {
	description: string;
	after: string[];
	user?: string;
	exec: string;
	args: string[];
	timeout: number;
	rw?: string;
}

function render({ description, after, user, exec, args, timeout, rw }: UnitSpec) {
	const deps = ['network-online.target', ...after].join(' ');
	return [
		'[Unit]',
		`Description=${description}`,
		`Wants=${deps}`,
		`After=${deps}`,
		'',
		'[Service]',
		// MEV-Boost stores nothing, so systemd can make up a user for it.
		...(user ? [`User=${user}`, `Group=${user}`] : ['DynamicUser=true']),
		[`ExecStart=${exec}`, ...args.map((a) => `  ${a}`)].join(' \\\n'),
		'Restart=on-failure',
		'RestartSec=5',
		`TimeoutStopSec=${timeout}`,
		'NoNewPrivileges=true',
		'ProtectSystem=strict',
		...(rw ? [`ReadWritePaths=${rw}`] : []),
		'ProtectHome=true',
		'PrivateTmp=true',
		'',
		'[Install]',
		'WantedBy=multi-user.target',
	].join('\n');
}

export function SystemdUnit({ name }: { name: 'execution' | 'mev-boost' | 'beacon' | 'validator' }) {
	const { s, ipc, validator, mev, genesis, beaconUser } = useSystemd();
	const net = s.net;
	const fee = feeOrPlaceholder(s.fee);
	const el = CLIENTS[s.el];

	const specs: Record<typeof name, UnitSpec> = {
		execution: {
			description: 'Ethereum execution client',
			after: [],
			user: 'execution',
			exec: el.bin,
			args: el.args(net, ipc),
			timeout: 600,
			rw: EL_DIR,
		},
		'mev-boost': {
			description: 'MEV-Boost',
			after: [],
			exec: '/usr/local/bin/mev-boost',
			args: [`-${net}`, '-relay-check', ...RELAYS[net as NetworkId].urls.map((u) => `-relay=${u}`)],
			timeout: 30,
		},
		beacon: {
			description: 'Prysm beacon node',
			after: ['execution.service', ...(mev ? ['mev-boost.service'] : [])],
			user: beaconUser,
			exec: '/usr/local/bin/beacon-chain',
			args: [
				`--${net}`,
				`--datadir=${ROOT}/beacon`,
				...(ipc ? [`--execution-endpoint=${IPC}`] : ['--execution-endpoint=http://127.0.0.1:8551', `--jwt-secret=${JWT}`]),
				s.sync === 'checkpoint' ? `--checkpoint-sync-url=${checkpoints[net]}` : '',
				genesis ? `--genesis-state=${GENESIS}` : '',
				validator ? `--suggested-fee-recipient=${fee}` : '',
				mev ? '--http-mev-relay=http://127.0.0.1:18550' : '',
				'--beacon-db-pruning',
				validator ? '--postpone-shutdown-for-proposals' : '',
				'--disable-log-colors',
				'--accept-terms-of-use',
			].filter(Boolean),
			// With a validator, a stop waits for upcoming proposals (--postpone-shutdown-for-proposals).
			timeout: validator ? 900 : 120,
			rw: `${ROOT}/beacon`,
		},
		validator: {
			description: 'Prysm validator client',
			after: ['beacon.service'],
			user: 'validator',
			exec: '/usr/local/bin/validator',
			args: [
				`--${net}`,
				`--datadir=${ROOT}/validator`,
				`--wallet-dir=${ROOT}/validator/wallet`,
				`--wallet-password-file=${ROOT}/validator/wallet-password.txt`,
				'--beacon-rpc-provider=127.0.0.1:4000',
				`--suggested-fee-recipient=${fee}`,
				mev ? '--enable-builder' : '',
				'--enable-doppelganger',
				'--disable-log-colors',
				'--accept-terms-of-use',
			].filter(Boolean),
			timeout: 120,
			rw: `${ROOT}/validator`,
		},
	};

	return (
		<CodeBlock language="ini" title={`/etc/systemd/system/${name}.service`}>
			{render(specs[name])}
		</CodeBlock>
	);
}

export function SystemdStart() {
	const { validator, mev } = useSystemd();
	return (
		<CodeBlock language="bash">
			{[
				'# Make systemd read the unit files you just created.',
				'sudo systemctl daemon-reload',
				'',
				'# Start the services at every boot (enable), and right now (--now).',
				'# They start in the order set by the After= lines in the units.',
				`sudo systemctl enable --now ${services(validator, mev).join(' ')}`,
			].join('\n')}
		</CodeBlock>
	);
}

export function SystemdCheck() {
	const { validator, mev } = useSystemd();
	return <CodeBlock language="bash">{`systemctl is-active ${services(validator, mev).join(' ')}`}</CodeBlock>;
}

const SERVICE_NAMES: Record<string, string> = {
	execution: 'the execution client',
	'mev-boost': 'MEV-Boost',
	beacon: 'the beacon node',
	validator: 'the validator client',
};

export function SystemdLogs() {
	const { validator, mev } = useSystemd();
	const lines = services(validator, mev).map((name) => `sudo journalctl -fu ${name.padEnd(9)}   # follow ${SERVICE_NAMES[name]}`);
	return <CodeBlock language="bash">{lines.join('\n')}</CodeBlock>;
}

export function SystemdRemove({ part }: { part: 'stop' | 'delete' }) {
	const { ipc, validator, mev } = useSystemd();
	const names = services(validator, mev);
	const users = ['execution', ipc ? '' : 'beacon', validator ? 'validator' : ''].filter(Boolean);
	const groups: string[][] =
		part === 'stop'
			? [['# Stop the services, and stop them from starting at boot.', `sudo systemctl disable --now ${names.join(' ')}`]]
			: [
					[
						'# Delete the unit files, and make systemd forget them.',
						...names.map((n) => `sudo rm -f /etc/systemd/system/${n}.service`),
						'sudo systemctl daemon-reload',
						'sudo systemctl reset-failed',
					],
					[
						`# Delete all the data: chain data${ipc ? '' : ', JWT secret'}${validator ? ', wallet and slashing protection' : ''}.`,
						`sudo rm -r ${ROOT}`,
					],
					[
						`# Delete the system user${users.length === 1 ? '' : 's'}${ipc ? '' : ' and the "ethereum" group'}.`,
						...users.map((u) => `sudo userdel ${u}`),
						ipc ? '' : 'sudo groupdel ethereum',
					],
				];
	return <CodeBlock language="bash">{groups.map((g) => g.filter(Boolean).join('\n')).join('\n\n')}</CodeBlock>;
}
