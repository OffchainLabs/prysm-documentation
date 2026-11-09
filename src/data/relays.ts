/**
 * MEV-Boost relays per network: the working relays from the EthStaker relay
 * list, which the Quickstart, the Docker Compose page and the MEV-Boost page all link to.
 * Copied from eth-educators/ethstaker-guides docs/MEV-relay-list.md (main branch), 2026-10,
 * leaving out the mainnet relays that no longer answer MEV-Boost's status check
 * (bloXroute Max Profit, Manifold SecureRPC, Wenmerge, Proof Relay).
 */
import type { NetworkId } from '@site/src/data/networks';

const LIST = 'https://github.com/eth-educators/ethstaker-guides/blob/main/docs/MEV-relay-list.md';

export const RELAYS: Record<NetworkId, { list: string; urls: string[] }> = {
	mainnet: {
		list: `${LIST}#mev-relay-list-for-mainnet`,
		urls: [
			'https://0xa15b52576bcbf1072f4a011c0f99f9fb6c66f3e1ff321f11f461d15e31b1cb359caa092c71bbded0bae5b5ea401aab7e@aestus.live', // Aestus
			'https://0xa7ab7a996c8584251c8f925da3170bdfd6ebc75d50f5ddc4050a6fdc77f2a3b5fce2cc750d0865e05d7228af97d69561@agnostic-relay.net', // Agnostic Gnosis
			'https://0xb0b07cd0abef743db4260b0ed50619cf6ad4d82064cb4fbec9d3ec530f7c5e6793d9f286c4e082c0244ffb9f2658fe88@bloxroute.regulated.blxrbdn.com', // bloXroute Regulated
			'https://0x8c4ed5e24fe5c6ae21018437bde147693f68cda427cd1122cf20819c30eda7ed74f72dece09bb313f2a1855595ab677d@global.titanrelay.xyz', // Titan Relay
			'https://0x8c4ed5e24fe5c6ae21018437bde147693f68cda427cd1122cf20819c30eda7ed74f72dece09bb313f2a1855595ab677d@regional.titanrelay.xyz', // Titan Relay Regional
			'https://0xac6e77dfe25ecd6110b8e780608cce0dab71fdd5ebea22a16c0205200f2f8e2e3ad3b71d3499c54ad14d6c21b41a37ae@boost-relay.flashbots.net', // Flashbots
			'https://0xa1559ace749633b997cb3fdacffb890aeebdb0f5a3b6aaa7eeeaf1a38af0a8fe88b9e4b1f61f236d2e64d95733327a62@relay.ultrasound.money', // Ultra Sound
		],
	},
	hoodi: {
		list: `${LIST}#mev-relay-list-for-hoodi-testnet`,
		urls: [
			'https://0xaa58208899c6105603b74396734a6263cc7d947f444f396a90f7b7d3e65d102aec7e5e5291b27e08d02c50a050825c2f@hoodi.titanrelay.xyz', // Titan
		],
	},
	sepolia: {
		list: `${LIST}#mev-relay-list-for-sepolia-testnet`,
		urls: [
			'https://0xafa4c6985aa049fb79dd37010438cfebeb0f2bd42b115b89dd678dab0670c1de38da0c4e9138c9290a398ecd9a0b3110@boost-relay-sepolia.flashbots.net', // Flashbots
		],
	},
};
