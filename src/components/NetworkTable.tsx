/**
 * Supported networks with live chain position. Slot, epoch and fork are
 * computed in the browser from the genesis time, so they need no API.
 */
import React, { useEffect, useState } from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import { NETWORKS, SECONDS_PER_SLOT, SLOTS_PER_EPOCH, epochTime, type Network } from '@site/src/data/networks';
import './NetworkTable.css';

const fmt = new Intl.NumberFormat('en-US');
const fmtDate = (t: number) =>
	new Date(t * 1000).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtTime = (t: number) =>
	new Date(t * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' });
const fmtDateTime = (t: number) => `${fmtDate(t)}, ${fmtTime(t)} UTC`;

const countdown = (s: number) => {
	const d = Math.floor(s / 86400);
	const h = Math.floor((s % 86400) / 3600);
	const m = Math.floor((s % 3600) / 60);
	return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m ${Math.floor(s % 60)}s`;
};

/** Seconds since the epoch, ticking once a second; null until mounted so SSR and hydration agree. */
function useNow() {
	const [now, setNow] = useState<number | null>(null);
	useEffect(() => {
		const tick = () => setNow(Date.now() / 1000);
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);
	return now;
}

function Card({ n, now }: { n: Network; now: number | null }) {
	const forks = n.forks.map((f) => ({ ...f, time: epochTime(n, f.epoch) }));
	let live: { slot: string; epoch: string; fork: string; next: string } | null = null;
	if (now !== null) {
		const slot = Math.max(0, Math.floor((now - n.genesisTime) / SECONDS_PER_SLOT));
		const epoch = Math.floor(slot / SLOTS_PER_EPOCH);
		const active = [...forks].reverse().find((f) => f.epoch <= epoch);
		const next = forks.find((f) => f.epoch > epoch);
		live = {
			slot: fmt.format(slot),
			epoch: fmt.format(epoch),
			fork: active?.name ?? '–',
			next: next ? `${next.name} activates at epoch ${fmt.format(next.epoch)}, in ${countdown(next.time - now)}.` : '',
		};
	}

	return (
		<section className="nt-card">
			<header>
				<h3 id={n.id}>{n.name}</h3>
				<code className="nt-flag">{n.flag}</code>
			</header>
			<p className="nt-purpose">{n.purpose}</p>
			<dl className="nt-live">
				<div>
					<dt>Slot</dt>
					<dd>{live?.slot ?? '–'}</dd>
				</div>
				<div>
					<dt>Epoch</dt>
					<dd>{live?.epoch ?? '–'}</dd>
				</div>
				<div>
					<dt>Fork</dt>
					<dd>{live?.fork ?? '–'}</dd>
				</div>
			</dl>
			<p className="nt-next" hidden={!live?.next}>
				{live?.next}
			</p>
			<dl className="nt-facts">
				<div>
					<dt>Chain ID</dt>
					<dd>{n.chainId}</dd>
				</div>
				<div>
					<dt>Genesis</dt>
					<dd>{fmtDateTime(n.genesisTime)}</dd>
				</div>
				<div>
					<dt>Deposit contract</dt>
					<dd>
						<code className="nt-addr">{n.depositContract}</code>
					</dd>
				</div>
				<div>
					<dt>Validators</dt>
					<dd>
						{n.canRunValidator ? (
							n.stakerConsole ? (
								<a href={n.stakerConsole}>Open to anyone via the EthStaker console</a>
							) : n.launchpad ? (
								<a href={n.launchpad}>Open to anyone via the launchpad</a>
							) : (
								'Open'
							)
						) : (
							'Permissioned'
						)}
					</dd>
				</div>
				<div>
					<dt>Explorer</dt>
					<dd>
						<a href={n.explorer}>{n.explorer.replace('https://', '')}</a>
					</dd>
				</div>
			</dl>
			<details className="nt-forks">
				<summary>Upgrade history</summary>
				<table>
					<thead>
						<tr>
							<th>Upgrade</th>
							<th>Epoch</th>
							<th>Date and time (UTC)</th>
						</tr>
					</thead>
					<tbody>
						{forks.map((f) => (
							<tr key={f.name} className={now !== null && f.time > now ? 'future' : undefined}>
								<td>{f.name}</td>
								<td>{f.epoch.toLocaleString('en-US')}</td>
								<td>{fmtDate(f.time)}, {fmtTime(f.time)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</details>
		</section>
	);
}

export default function NetworkTable() {
	const brokenLinks = useBrokenLinks();
	NETWORKS.forEach((n) => brokenLinks.collectAnchor(n.id));
	const now = useNow();
	return (
		<div className="nt">
			{NETWORKS.map((n) => (
				<Card key={n.id} n={n} now={now} />
			))}
		</div>
	);
}
