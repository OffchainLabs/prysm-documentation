/**
 * Network parameters, taken from Prysm's `config/params/*_config.go`.
 * Genesis time = actual beacon chain genesis (MinGenesisTime + GenesisDelay
 * for testnets). Fork epochs that are unscheduled are omitted.
 */

export const SECONDS_PER_SLOT = 12;
export const SLOTS_PER_EPOCH = 32;

export type NetworkId = 'mainnet' | 'hoodi' | 'sepolia';

export interface Network {
	id: NetworkId;
	name: string;
	flag: string;
	purpose: string;
	chainId: number;
	genesisTime: number;
	depositContract: string;
	checkpointSyncUrl: string;
	/** A provider run by someone else, to check the checkpoint against. */
	checkpointVerifyUrl: string;
	launchpad?: string;
	/** EthStaker console, used instead of the launchpad where set. */
	stakerConsole?: string;
	explorer: string;
	canRunValidator: boolean;
	forks: { name: string; epoch: number }[];
}

export const NETWORKS: Network[] = [
	{
		id: 'mainnet',
		name: 'Mainnet',
		// Shown in brackets: mainnet is the default, so the flag is optional.
		flag: '[--mainnet]',
		purpose: 'The production Ethereum network. Real ETH, real rewards, real penalties.',
		chainId: 1,
		genesisTime: 1606824023,
		depositContract: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
		checkpointSyncUrl: 'https://sync-mainnet.beaconcha.in',
		checkpointVerifyUrl: 'https://mainnet.checkpoint.sigp.io',
		launchpad: 'https://launchpad.ethereum.org/',
		explorer: 'https://beaconcha.in',
		canRunValidator: true,
		forks: [
			{ name: 'Phase 0', epoch: 0 },
			{ name: 'Altair', epoch: 74240 },
			{ name: 'Bellatrix', epoch: 144896 },
			{ name: 'Capella', epoch: 194048 },
			{ name: 'Deneb', epoch: 269568 },
			{ name: 'Electra', epoch: 364032 },
			{ name: 'Fulu', epoch: 411392 },
		],
	},
	{
		id: 'hoodi',
		name: 'Hoodi',
		flag: '--hoodi',
		purpose: 'The public testnet for stakers and infrastructure providers. Rehearse your setup here first.',
		chainId: 560048,
		genesisTime: 1742213400,
		depositContract: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
		checkpointSyncUrl: 'https://hoodi.beaconstate.ethstaker.cc',
		checkpointVerifyUrl: 'https://hoodi.checkpoint.sigp.io',
		launchpad: 'https://hoodi.launchpad.ethereum.org/',
		stakerConsole: 'https://hoodi.console.ethstaker.org/',
		explorer: 'https://hoodi.beaconcha.in',
		canRunValidator: true,
		forks: [
			{ name: 'Deneb', epoch: 0 },
			{ name: 'Electra', epoch: 2048 },
			{ name: 'Fulu', epoch: 50688 },
		],
	},
	{
		id: 'sepolia',
		name: 'Sepolia',
		flag: '--sepolia',
		purpose: 'Testnet for application developers. The validator set is permissioned.',
		chainId: 11155111,
		genesisTime: 1655733600,
		depositContract: '0x7f02C3E3c98b133055B8B348B2Ac625669Ed295D',
		checkpointSyncUrl: 'https://checkpoint-sync.sepolia.ethpandaops.io',
		checkpointVerifyUrl: 'https://beaconstate-sepolia.chainsafe.io',
		explorer: 'https://sepolia.beaconcha.in',
		canRunValidator: false,
		forks: [
			{ name: 'Phase 0', epoch: 0 },
			{ name: 'Altair', epoch: 50 },
			{ name: 'Bellatrix', epoch: 100 },
			{ name: 'Capella', epoch: 56832 },
			{ name: 'Deneb', epoch: 132608 },
			{ name: 'Electra', epoch: 222464 },
			{ name: 'Fulu', epoch: 272640 },
			{ name: 'Gloas', epoch: 353024 },
		],
	},
];

export const epochTime = (n: Network, epoch: number) =>
	n.genesisTime + epoch * SLOTS_PER_EPOCH * SECONDS_PER_SLOT;
