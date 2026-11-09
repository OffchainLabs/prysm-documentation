/** Landing page body, below the hero. */
import React from 'react';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { LINKS } from '@site/src/data/site';
import { NETWORKS, SECONDS_PER_SLOT, SLOTS_PER_EPOCH } from '@site/src/data/networks';
import './Landing.css';

const refLinks = [
	['Common flags', '/reference/cli/', 'The flags most people set, and the config file'],
	['Fee recipient', '/validators/fee-recipient/', 'Per-validator fee recipient, gas limit and builder'],
	['Networks', '/reference/networks/', 'Live slot, upcoming upgrades, deposit contracts'],
	['Ports', '/reference/ports/', 'What to open, what to keep private'],
];

// Glamsterdam is the Gloas consensus fork plus the Amsterdam execution fork.
const GLAMSTERDAM_FORK = 'Gloas';

function forkTime(genesisTime: number, epoch: number): number {
	return (genesisTime + epoch * SLOTS_PER_EPOCH * SECONDS_PER_SLOT) * 1000;
}

function formatDate(ms: number): string {
	return new Date(ms).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function GlamsterdamStatus() {
	const [now, setNow] = React.useState(() => Date.now());
	React.useEffect(() => setNow(Date.now()), []);
	return (
		<div className="upgrade-table">
			<table>
				<thead>
					<tr>
						<th>Network</th>
						<th>Glamsterdam</th>
					</tr>
				</thead>
				<tbody>
					{NETWORKS.map((n) => {
						const f = n.forks.find((x) => x.name === GLAMSTERDAM_FORK);
						const t = f && forkTime(n.genesisTime, f.epoch);
						return (
							<tr key={n.id}>
								<th scope="row">{n.name}</th>
								{!t ? (
									<td className="upgrade-none">Not scheduled yet</td>
								) : t <= now ? (
									<td className="upgrade-live">Live since {formatDate(t)}</td>
								) : (
									<td className="upgrade-scheduled">
										Scheduled for {formatDate(t)}, epoch {f?.epoch}
									</td>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

function FlagSearch() {
	const history = useHistory();
	const target = useBaseUrl('/reference/cli/beacon-chain/');
	return (
		<form
			className="flag-search"
			action={target}
			method="get"
			role="search"
			onSubmit={(e) => {
				e.preventDefault();
				const q = new FormData(e.currentTarget).get('q') ?? '';
				history.push(`${target}?q=${encodeURIComponent(String(q))}`);
			}}
		>
			<label htmlFor="flag-q">Find a beacon node flag</label>
			<div>
				<input id="flag-q" name="q" type="search" placeholder="checkpoint, peers, blob…" autoComplete="off" />
				<button type="submit">Search flags</button>
			</div>
		</form>
	);
}

export default function Landing() {
	return (
		<div className="prysm-landing">

			<section className="band glamsterdam" aria-labelledby="glamsterdam-title">
				<div className="callout">
					<span className="eyebrow">Upcoming upgrade</span>
					<h2 id="glamsterdam-title">Get ready for Glamsterdam</h2>
					<p>
						From Glamsterdam on, your beacon node gets bids from block builders itself, and MEV-Boost becomes optional.
						Builders are listed in a new version of the validator client's proposer settings, and you choose how much
						trusted payment to count. Set it up before the fork reaches your network.
					</p>
					<div className="community-links">
						<Link to="/validators/builders/">Use builders after Gloas (ePBS) →</Link>
					</div>
				</div>
			</section>

			<section className="band split" aria-labelledby="upgrades-title">
				<div>
					<h2 id="upgrades-title">Glamsterdam on each network</h2>
					<p>
						Glamsterdam is the Gloas fork on the consensus layer and Amsterdam on the execution layer. When it's scheduled
						on a network, its date shows here. Every fork of every network is on the{' '}
						<Link to="/reference/networks/">Networks</Link> page.
					</p>
				</div>
				<GlamsterdamStatus />
			</section>

			<section className="band split" aria-labelledby="ref-title">
				<div>
					<h2 id="ref-title">Command-line reference</h2>
					<p>
						Every flag of <code>beacon-chain</code>, <code>validator</code> and <code>prysmctl</code> is detailed: what it
						does, its type and its default value.
					</p>
					<FlagSearch />
				</div>
				<ul className="ref-links">
					{refLinks.map(([label, href, desc]) => (
						<li key={href}>
							<Link to={href}>{label}</Link>
							<span>{desc}</span>
						</li>
					))}
				</ul>
			</section>

			<section className="band community" aria-labelledby="community-title">
				<h2 id="community-title">Talk to the Prysm team</h2>
				<p>
					Core developers and experienced operators answer questions in Discord. Found a bug? Open an issue on GitHub
					with your logs and version.
				</p>
				<div className="community-links">
					<a href={LINKS.discord}>Join the Prysm Discord</a>
					<a href={`${LINKS.github}/issues`}>Open a GitHub issue</a>
					<a href={LINKS.releases}>Read the release notes</a>
				</div>
			</section>
		</div>
	);
}
