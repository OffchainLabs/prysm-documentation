/**
 * Where a message's leaf lands. The reader picks a message type and a slot;
 * the panel computes the leaf index with the PQ Gasper rules
 * (ethereum/consensus-specs, pq branch, commit 4dabe73), then splits it: the
 * first 16 bits pick the bottom tree b (and the top key that signs its root),
 * the last 16 bits the key k inside it.
 */
import React, { useEffect, useState } from 'react';
import './LamportPanel.css';
import './HashChainPanel.css';
import './LeafIndexPanel.css';

const RESERVED = 2 ** 15; // XMSS_RESERVED_LEAVES
const ATTESTATION = 2 ** 29; // XMSS_ATTESTATION_LEAVES
const PER_SLOT = 8; // XMSS_LEAVES_PER_SLOT
const SLOTS_PER_EPOCH = 32;
const MAX = 2 ** 32 - 1;
const GENESIS = 1606824023; // mainnet beacon chain genesis, Unix seconds

type Kind = 'reserved' | 'epoch' | 'slot';
const MESSAGES: { name: string; kind: Kind; n: number; who?: string }[] = [
	{ name: 'Attestation', kind: 'epoch', n: 0 },
	{ name: 'Block', kind: 'slot', n: 0 },
	{ name: 'Aggregate', kind: 'slot', n: 1 },
	{ name: 'Payload timeliness vote', kind: 'slot', n: 2 },
	{ name: 'Proposer preferences', kind: 'slot', n: 3 },
	{ name: 'Payload bid', kind: 'slot', n: 4, who: 'builders' },
	{ name: 'Payload', kind: 'slot', n: 5, who: 'builders' },
	{ name: 'Preregistration', kind: 'reserved', n: 0 },
	{ name: 'Voluntary exit', kind: 'reserved', n: 1 },
];

const fmt = (n: number) => n.toLocaleString('en-US');
const currentSlot = () => Math.max(0, Math.floor((Date.now() / 1000 - GENESIS) / 12));

export default function LeafIndexPanel() {
	const [m, setM] = useState(0);
	const [slotText, setSlotText] = useState('15000000');
	// The current slot depends on the clock, so set it after the first render to match the server.
	useEffect(() => setSlotText(String(currentSlot())), []);
	const msg = MESSAGES[m];

	const slot = Number(slotText.replace(/[,_\s]/g, ''));
	const slotOk = msg.kind === 'reserved' || (slotText.trim() !== '' && Number.isInteger(slot) && slot >= 0);
	const epoch = Math.floor(slot / SLOTS_PER_EPOCH);

	let idx = 0;
	let formula = '';
	if (msg.kind === 'reserved') {
		idx = msg.n;
		formula = `leaf index = ${msg.n}, one of the first ${fmt(RESERVED)} leaves`;
	} else if (msg.kind === 'epoch') {
		idx = RESERVED + epoch;
		formula = `leaf index = ${fmt(RESERVED)} + target epoch = ${fmt(RESERVED)} + ${fmt(epoch)} = ${fmt(idx)}`;
	} else {
		idx = RESERVED + ATTESTATION + PER_SLOT * slot + msg.n;
		formula = `leaf index = ${fmt(RESERVED)} + ${fmt(ATTESTATION)} + ${PER_SLOT} × ${fmt(slot)} + ${msg.n} = ${fmt(idx)}`;
	}
	const tooFar =
		slotOk && (idx > MAX || (msg.kind === 'epoch' && epoch >= ATTESTATION))
			? msg.kind === 'epoch'
				? `Epoch ${fmt(epoch)} is past the ${fmt(ATTESTATION)} attestation leaves: the key has run out of them.`
				: `Leaf ${fmt(idx)} is past the last leaf, ${fmt(MAX)}: the key has run out of leaves for this slot.`
			: '';
	const valid = slotOk && !tooFar;

	const b = Math.floor(idx / 65_536);
	const k = idx % 65_536;
	const bits = idx.toString(2).padStart(32, '0');

	return (
		<figure className="lamport-panel chain-panel leaf-index not-content">
			<div className="lp-head">
				<strong>Where does a message's leaf land?</strong>
				<span className="lp-label">PQ Gasper rules · 2¹⁶ bottom trees of 2¹⁶ keys</span>
			</div>

			<div className="lp-field">
				<span className="lp-label">Message to sign</span>
				<div className="li-msgs" role="group" aria-label="Message to sign">
					{MESSAGES.map((x, i) => (
						<button key={x.name} type="button" aria-pressed={i === m} onClick={() => setM(i)}>
							{x.name}
							{x.who && <small> ({x.who})</small>}
						</button>
					))}
				</div>
			</div>

			{msg.kind !== 'reserved' && (
				<div className="lp-controls">
					<div className="lp-field li-slot">
						<label className="lp-label" htmlFor="li-slot">
							Slot
						</label>
						<input
							id="li-slot"
							type="text"
							inputMode="numeric"
							value={slotText}
							onChange={(e) => setSlotText(e.target.value)}
						/>
					</div>
					<button type="button" className="lp-ghost" onClick={() => setSlotText(String(currentSlot()))}>
						Now on mainnet
					</button>
					<button type="button" className="lp-ghost" onClick={() => setSlotText('0')}>
						Genesis
					</button>
				</div>
			)}

			{!slotOk ? (
				<p className="lp-status">Type a whole number of slots, 0 or more.</p>
			) : (
				<ol className="cp-path">
					{msg.kind === 'epoch' && (
						<li>
							<span className="lp-label">The target epoch</span>
							<code>
								{fmt(slot)} ÷ {SLOTS_PER_EPOCH} = epoch {fmt(epoch)}
							</code>
						</li>
					)}
					<li>
						<span className="lp-label">The leaf index</span>
						<code>{formula}</code>
					</li>
					{valid && (
						<>
							<li>
								<span className="lp-label">The leaf index in binary, 32 bits</span>
								<code className="li-bits">
									<span className="li-hi">{bits.slice(0, 16)}</span>
									<span className="li-lo">{bits.slice(16)}</span>
								</code>
							</li>
							<li>
								<span className="lp-label li-hi-label">First 16 bits: the bottom tree, and the top key that signs its root</span>
								<code>
									b = {fmt(idx)} ÷ 65,536 = {fmt(b)}
								</code>
							</li>
							<li>
								<span className="lp-label li-lo-label">Last 16 bits: the key inside the bottom tree</span>
								<code>
									k = {fmt(idx)} mod 65,536 = {fmt(k)}
								</code>
							</li>
						</>
					)}
				</ol>
			)}

			{tooFar && <p className="lp-status">{tooFar}</p>}

			{valid && (
				<div className="lp-gridwrap">
					<LandingTree b={b} k={k} />
				</div>
			)}
		</figure>
	);
}

/** The top tree with top key b marked, bottom tree b among its neighbors, and key k marked in it. */
function LandingTree({ b, k }: { b: number; k: number }) {
	const tx = 300 + 300 * (b / 65_535);
	const right = tx >= 450;
	const lx = 385 + 130 * (k / 65_535);
	const centers = [130, 290, 450, 610, 770];
	return (
		<svg className="li-svg" viewBox="0 0 900 300" role="img" aria-label={`Top key ${b} signs the root of bottom tree ${b}; key ${k} of that tree signs the message`}>
			<polygon className="li-top" points="450,30 300,110 600,110" />
			<text className="li-start" x="470" y="38">
				top tree · its root is the public key
			</text>
			<line className="li-hi-line" x1={tx} y1="110" x2="450" y2="170" />
			<circle className="li-hi-dot" cx={tx} cy="110" r="5" />
			<text className={`li-hi-text ${right ? 'li-end' : 'li-start'}`} x={right ? tx - 10 : tx + 10} y="130">
				top key {fmt(b)} signs the root of tree {fmt(b)}
			</text>
			{centers.map((cx, i) => {
				const id = b - 2 + i;
				if (id < 0 || id > 65_535) return null;
				const on = i === 2;
				return (
					<g key={i}>
						<polygon className={on ? 'li-bottom li-on' : 'li-bottom'} points={`${cx},170 ${cx - 65},240 ${cx + 65},240`} />
						<text className={on ? 'li-mid li-strong' : 'li-mid li-dim'} x={cx} y="258">
							tree {fmt(id)}
						</text>
					</g>
				);
			})}
			{b > 1 && (
				<text className="li-mid li-dim" x="30" y="214">
					…
				</text>
			)}
			{b < 65_534 && (
				<text className="li-mid li-dim" x="870" y="214">
					…
				</text>
			)}
			<line className="li-lo-line" x1="450" y1="170" x2={lx} y2="240" />
			<circle className="li-lo-dot" cx={lx} cy="240" r="4.5" />
			<text className="li-mid li-lo-text" x="450" y="286">
				key {fmt(k)} of tree {fmt(b)} signs the message
			</text>
		</svg>
	);
}
