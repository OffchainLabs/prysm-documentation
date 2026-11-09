/**
 * Landing-page hero.
 *
 * The Prysm logo is the one moment of motion on the page: it catches a flare
 * of light when the pointer moves, and glows briefly at the start of every
 * real mainnet slot, so it keeps time with the chain.
 */
import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import { PRYSM_VERSION, LINKS } from '@site/src/data/site';
import { NETWORKS, SECONDS_PER_SLOT, SLOTS_PER_EPOCH } from '@site/src/data/networks';
import PrysmLogoFlare from './PrysmLogoFlare';
import './Hero.css';

const mainnet = NETWORKS.find((n) => n.id === 'mainnet')!;
const install =
	'curl https://raw.githubusercontent.com/OffchainLabs/prysm/master/prysm.sh --output prysm.sh && chmod +x prysm.sh';

const fmt = new Intl.NumberFormat('en-US');

function CopyButton({ text }: { text: string }) {
	const [label, setLabel] = useState('Copy');
	return (
		<button
			type="button"
			aria-label="Copy install command"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text);
					setLabel('Copied');
				} catch {
					setLabel('Select to copy');
				}
				setTimeout(() => setLabel('Copy'), 1600);
			}}
		>
			{label}
		</button>
	);
}

interface Chain {
	slot: number;
	epoch: number;
	inEpoch: number;
	remaining: number;
}

function useChainClock(): Chain | null {
	const [chain, setChain] = useState<Chain | null>(null);
	useEffect(() => {
		const tick = () => {
			const elapsed = Date.now() / 1000 - mainnet.genesisTime;
			const slot = Math.floor(elapsed / SECONDS_PER_SLOT);
			setChain({
				slot,
				epoch: Math.floor(slot / SLOTS_PER_EPOCH),
				inEpoch: slot % SLOTS_PER_EPOCH,
				remaining: SECONDS_PER_SLOT - (elapsed % SECONDS_PER_SLOT),
			});
		};
		tick();
		const id = setInterval(tick, 100);
		return () => clearInterval(id);
	}, []);
	return chain;
}

export default function Hero() {
	const chain = useChainClock();

	return (
		<section className="prysm-hero" aria-labelledby="hero-title">
			<div className="hero-inner">
				<div className="hero-copy">
					<a className="hero-release" href={`${LINKS.releases}/tag/${PRYSM_VERSION}`}>
						<span className="dot" aria-hidden="true" />
						Prysm {PRYSM_VERSION} is the latest release
					</a>
					<h1 id="hero-title">Ethereum consensus client, written in Go</h1>
					<p className="hero-lede">
						Prysm is the beacon node and validator client from Offchain.
					</p>
					<div className="hero-actions">
						<Link className="btn btn-primary" to="/get-started/introduction/">
							Read the documentation
						</Link>
					</div>
					<div className="hero-install">
						<code>
							<span className="prompt" aria-hidden="true">
								${' '}
							</span>
							{install}
						</code>
						<CopyButton text={install} />
					</div>
				</div>

				<div className="hero-visual">
					<PrysmLogoFlare slot={chain?.slot} />

					<div className="chain">
						<div className="chain-row">
							<p className="chain-stat">
								<span className="chain-label">Mainnet slot</span>
								<span className="chain-num">{chain ? fmt.format(chain.slot) : '–'}</span>
							</p>
							<p className="chain-stat">
								<span className="chain-label">Epoch</span>
								<span className="chain-num">{chain ? fmt.format(chain.epoch) : '–'}</span>
							</p>
							<p className="chain-stat chain-next">
								<span className="chain-label">Next slot in</span>
								<span className="chain-num">{chain ? `${chain.remaining.toFixed(1)}s` : '–'}</span>
							</p>
						</div>
						<div className="epoch-bar" aria-hidden="true">
							{Array.from({ length: SLOTS_PER_EPOCH }, (_, i) => (
								<span
									key={i}
									className={chain ? (i < chain.inEpoch ? 'done' : i === chain.inEpoch ? 'now' : undefined) : undefined}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
