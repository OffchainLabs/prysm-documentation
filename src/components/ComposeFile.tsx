/**
 * The Docker Compose page's generated commands: the command that prepares the
 * node's folder, and the compose file itself, both built from the reader's
 * choices in the page's <SetupPicker>. Each setup gets one complete file, with
 * no environment variables or profiles.
 *
 *   <ComposeDirs />
 *   <ComposeFile />
 */
import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import { NETWORKS, type NetworkId } from '@site/src/data/networks';
import { RELAYS } from '@site/src/data/relays';
import { PRYSM_VERSION } from '@site/src/data/site';
import { feeOrPlaceholder, useSetup } from '@site/src/components/SetupPicker';

const checkpoints: Record<string, string> = Object.fromEntries(NETWORKS.map((n) => [n.id, n.checkpointSyncUrl]));

/** The node's folder; the compose file sits in it and the services keep their data in `data/<network>`, as in the Quickstart. */
const FOLDER = '~/ethereum-docker';
const P2P = ['"30303:30303/tcp" # P2P', '"30303:30303/udp" # P2P discovery'];

interface ExecutionClient {
	image: string;
	command: (net: string, ipc: boolean) => string[];
	ports: string[];
}

// Images and flags checked against the versions in each tag, and against the
// per-client tabs in /setup/connect-execution-client/, 2026-09.
const CLIENTS: Record<string, ExecutionClient> = {
	besu: {
		// Its entrypoint starts as root, hands the data folder to its besu user, then runs as that user.
		image: 'hyperledger/besu:26.9.0',
		command: (net) => [
			`--network=${net}`,
			'--data-path=/data',
			'--engine-jwt-secret=/jwt/jwt.hex',
			'--engine-host-allowlist=*',
			'--rpc-http-host=0.0.0.0',
		],
		ports: P2P,
	},
	erigon: {
		// Runs as UID 1000: the page has the reader hand it its data folder before the first start.
		image: 'erigontech/erigon:v3.7.0',
		command: (net) => [
			`--chain=${net}`,
			'--datadir=/data',
			'--externalcl',
			'--authrpc.addr=0.0.0.0',
			'--authrpc.vhosts=*',
			'--authrpc.jwtsecret=/jwt/jwt.hex',
		],
		ports: [...P2P, '"42069:42069/tcp" # history downloads', '"42069:42069/udp" # history downloads'],
	},
	ethrex: {
		image: 'ghcr.io/lambdaclass/ethrex:27.0.0',
		command: (net) => [`--network=${net}`, '--datadir=/data', '--authrpc.addr=0.0.0.0', '--authrpc.jwtsecret=/jwt/jwt.hex'],
		ports: P2P,
	},
	geth: {
		image: 'ethereum/client-go:v1.17.6',
		command: (net, ipc) =>
			ipc
				? [`--${net}`, '--datadir=/data', '--ipcpath=/ipc/geth.ipc']
				: [`--${net}`, '--datadir=/data', '--authrpc.addr=0.0.0.0', '--authrpc.vhosts=*', '--authrpc.jwtsecret=/jwt/jwt.hex'],
		ports: P2P,
	},
	nethermind: {
		image: 'nethermind/nethermind:2.0.0',
		command: (net) => [
			`--config=${net}`,
			'--data-dir=/data',
			'--jsonrpc-enginehost=0.0.0.0',
			'--jsonrpc-engineport=8551',
			'--jsonrpc-jwtsecretfile=/jwt/jwt.hex',
			'--History.Pruning=Rolling',
		],
		ports: P2P,
	},
	reth: {
		image: 'ghcr.io/paradigmxyz/reth:v2.7.0',
		command: (net) => ['node', `--chain=${net}`, '--datadir=/data', '--full', '--authrpc.addr=0.0.0.0', '--authrpc.jwtsecret=/jwt/jwt.hex'],
		ports: P2P,
	},
};

function useCompose() {
	const s = useSetup();
	const ipc = s.conn === 'ipc' && s.el === 'geth';
	const validator = s.role === 'validator';
	const genesis = s.sync === 'genesis' && s.net !== 'mainnet';
	return { s, ipc, validator, mev: validator && s.mev === 'on', genesis, el: CLIENTS[s.el] };
}

export function ComposeDirs() {
	const { s, validator, genesis } = useCompose();
	// Docker creates the other data folders on first start.
	const lines = [`mkdir -p ${FOLDER} && cd ${FOLDER}`];
	if (validator) lines.push(`mkdir -p data/${s.net}/validator`);
	if (genesis) lines.push(`curl -L --create-dirs https://github.com/eth-clients/${s.net}/raw/main/metadata/genesis.ssz --output data/${s.net}/genesis.ssz`);
	return <CodeBlock language="bash">{lines.join('\n')}</CodeBlock>;
}

export function ComposeFile() {
	const { s, ipc, validator, mev, genesis, el } = useCompose();
	const net = s.net;
	const list = (key: string, items: string[]) => [`    ${key}:`, ...items.map((i) => `      - ${i}`)];
	const dependsOn = (services: string[]) => [
		'    depends_on:',
		...services.flatMap((name) => [
			`      ${name}:`,
			`        condition: ${name === 'jwt-init' ? 'service_completed_successfully' : 'service_started'}`,
		]),
	];
	// Over HTTP, both Engine API ends wait for jwt-init to write the secret; over IPC there is none.
	const secret = ipc ? [] : ['jwt-init'];
	// The IPC socket lives in a Docker-managed volume: a socket in a host folder can't be shared
	// between containers on Docker Desktop (macOS, Windows).
	const engineVolume = ipc ? 'ipc:/ipc' : './data/jwt:/jwt:ro';

	const jwtInit = [
		'  jwt-init:',
		'    container_name: jwt-init',
		'    image: alpine:3.22',
		...list('volumes', ['./data/jwt:/jwt']),
		...list('command', ['sh', '-c', "test -f /jwt/jwt.hex || od -An -tx1 -N32 /dev/urandom | tr -d ' \\n' > /jwt/jwt.hex"]),
		'',
	];

	const execution = [
		`  ${s.el}:`,
		`    container_name: ${s.el}`,
		`    image: ${el.image}`,
		'    restart: unless-stopped',
		'    stop_grace_period: 10m',
		...(secret.length ? dependsOn(secret) : []),
		...list('command', el.command(net, ipc)),
		...list('volumes', [`./data/${net}/${s.el}:/data`, engineVolume]),
		...list('ports', el.ports),
	];

	const mevBoost = [
		'',
		'  mev-boost:',
		'    container_name: mev-boost',
		'    image: flashbots/mev-boost:1.12.0',
		'    restart: unless-stopped',
		...list('command', [`-${net}`, '-addr=0.0.0.0:18550', '-color', '-relay-check', ...RELAYS[net as NetworkId].urls.map((u) => `-relay=${u}`)]),
	];

	const beacon = [
		'',
		'  beacon:',
		'    container_name: beacon',
		`    image: gcr.io/offchainlabs/prysm/beacon-chain:${PRYSM_VERSION}`,
		'    restart: unless-stopped',
		// With a validator, a stop waits for upcoming proposals (--postpone-shutdown-for-proposals).
		`    stop_grace_period: ${validator ? '15m' : '2m'}`,
		...dependsOn([...secret, s.el, ...(mev ? ['mev-boost'] : [])]),
		...list(
			'command',
			[
				`--${net}`,
				'--datadir=/data',
				...(ipc ? ['--execution-endpoint=/ipc/geth.ipc'] : [`--execution-endpoint=http://${s.el}:8551`, '--jwt-secret=/jwt/jwt.hex']),
				s.sync === 'checkpoint' ? `--checkpoint-sync-url=${checkpoints[net]}` : '',
				genesis ? '--genesis-state=/genesis.ssz' : '',
				validator ? `--suggested-fee-recipient=${feeOrPlaceholder(s.fee)}` : '',
				mev ? '--http-mev-relay=http://mev-boost:18550' : '',
				'--beacon-db-pruning',
				'--http-host=0.0.0.0',
				validator ? '--rpc-host=0.0.0.0' : '',
				validator ? '--postpone-shutdown-for-proposals' : '',
				'--accept-terms-of-use',
			].filter(Boolean),
		),
		...list('volumes', [`./data/${net}/beacon:/data`, engineVolume, genesis ? `./data/${net}/genesis.ssz:/genesis.ssz:ro` : ''].filter(Boolean)),
		...list('ports', [
			'"13000:13000/tcp" # libp2p',
			'"13000:13000/udp" # libp2p (QUIC)',
			'"12000:12000/udp" # discv5',
			'"127.0.0.1:3500:3500" # beacon REST API, this machine only',
		]),
	];

	const validatorService = [
		'',
		'  validator:',
		'    container_name: validator',
		`    image: gcr.io/offchainlabs/prysm/validator:${PRYSM_VERSION}`,
		'    restart: unless-stopped',
		'    stop_grace_period: 2m',
		...dependsOn(['beacon']),
		...list(
			'command',
			[
				`--${net}`,
				'--datadir=/data',
				'--wallet-dir=/data/wallet',
				'--wallet-password-file=/data/wallet-password.txt',
				'--beacon-rpc-provider=beacon:4000',
				`--suggested-fee-recipient=${feeOrPlaceholder(s.fee)}`,
				mev ? '--enable-builder' : '',
				'--enable-doppelganger',
				'--accept-terms-of-use',
			].filter(Boolean),
		),
		...list('volumes', [`./data/${net}/validator:/data`]),
	];

	const yaml = [
		'services:',
		...(ipc ? [] : jwtInit),
		...execution,
		...(mev ? mevBoost : []),
		...beacon,
		...(validator ? validatorService : []),
		...(ipc ? ['', 'volumes:', '  ipc:'] : []),
	].join('\n');

	return (
		<CodeBlock language="yaml" title="docker-compose.yml">
			{yaml}
		</CodeBlock>
	);
}
