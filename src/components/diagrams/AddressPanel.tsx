/**
 * Build a leanXMSS address: pick what the hash call computes, on which layer,
 * for which key and position, and see its 16 bytes.
 */
import React, { useState } from 'react';
import { addr, hex } from './leanxmss';
import './LamportPanel.css';
import './HashChainPanel.css';
import './AddressPanel.css';

type Kind = 'chain' | 'leaf' | 'node' | 'msg' | 'prf' | 'rnd' | 'param';
const KINDS: { kind: Kind; name: string; type: number; what: string }[] = [
	{ kind: 'chain', name: 'Chain step', type: 1, what: 'one step along a chain' },
	{ kind: 'leaf', name: 'Leaf', type: 2, what: 'the hash of a one-time key’s chain ends' },
	{ kind: 'node', name: 'Tree node', type: 3, what: 'a parent in a tree, from its two children' },
	{ kind: 'msg', name: 'Digest', type: 12, what: 'the digest of the message and ρ' },
	{ kind: 'prf', name: 'Chain starts', type: 0, what: 'two chain starts, from the seed' },
	{ kind: 'rnd', name: 'Start of the ρ search', type: 7, what: 'where the search for ρ starts' },
	{ kind: 'param', name: 'Public parameter', type: 5, what: 'the public parameter P, from the seed' },
];
const fmt = (n: number) => n.toLocaleString('en-US');

function NumberField({ id, label, value, max, onChange }: { id: string; label: string; value: number; max: number; onChange: (n: number) => void }) {
	return (
		<div className="lp-field ad-num">
			<label className="lp-label" htmlFor={id}>
				{label}, 0 to {fmt(max)}
			</label>
			<input
				id={id}
				type="number"
				min={0}
				max={max}
				value={value}
				onChange={(e) => {
					const n = Math.floor(Number(e.target.value));
					onChange(Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0);
				}}
			/>
		</div>
	);
}

export default function AddressPanel() {
	const [k, setK] = useState(0);
	const [layer, setLayer] = useState(0);
	const [e, setE] = useState(4464);
	const [mu, setMu] = useState(1);
	const [level, setLevel] = useState(1);
	const [j, setJ] = useState(0);
	const [pair, setPair] = useState(0);
	const kind = KINDS[k];

	const maxKey = layer === 0 ? 2 ** 32 - 1 : 2 ** 16 - 1;
	const maxNode = (layer === 0 ? 2 ** (32 - level) : 2 ** (16 - level)) - 1;
	const key = Math.min(e, maxKey);
	const node = Math.min(j, maxNode);

	let a: Uint8Array;
	let lo = '';
	let hi = '';
	switch (kind.kind) {
		case 'chain':
			a = addr.chain(layer, key, mu);
			lo = `key ${fmt(key)}`;
			hi = '0';
			break;
		case 'leaf':
			a = addr.leaf(layer, key);
			lo = `key ${fmt(key)}`;
			hi = '0';
			break;
		case 'node':
			a = addr.node(layer, level, node);
			lo = `node ${fmt(node)} of its level`;
			hi = `level ${level}`;
			break;
		case 'msg':
			a = addr.msg(layer, key);
			lo = `key ${fmt(key)}`;
			hi = '0';
			break;
		case 'prf':
			a = addr.prf(layer, key, pair);
			lo = `key ${fmt(key)}`;
			hi = `pair ${pair}: chains ${2 * pair} and ${2 * pair + 1}`;
			break;
		case 'rnd':
			a = addr.rnd(layer, key);
			lo = `key ${fmt(key)}`;
			hi = '0';
			break;
		default:
			a = addr.param();
			lo = '0';
			hi = '0';
	}
	const h = hex(a);
	const usesLayer = kind.kind !== 'param';
	const usesMu = kind.kind === 'chain';
	const muVal = usesMu ? mu : 0;

	return (
		<figure className="lamport-panel chain-panel address-panel not-content">
			<div className="lp-head">
				<strong>Build an address</strong>
				<span className="lp-label">leanXMSS · 16 bytes</span>
			</div>

			<div className="lp-field">
				<span className="lp-label">What the hash call computes</span>
				<div className="ad-kinds" role="group" aria-label="What the hash call computes">
					{KINDS.map((x, i) => (
						<button key={x.kind} type="button" aria-pressed={i === k} onClick={() => setK(i)}>
							{x.name}
						</button>
					))}
				</div>
			</div>

			<div className="lp-controls">
				{usesLayer && (
					<div className="lp-field">
						<span className="lp-label">Layer</span>
						<div className="ad-kinds" role="group" aria-label="Layer">
							{['bottom', 'top'].map((name, l) => (
								<button key={name} type="button" aria-pressed={l === layer} onClick={() => setLayer(l)}>
									{name}
								</button>
							))}
						</div>
					</div>
				)}
				{['chain', 'leaf', 'msg', 'prf', 'rnd'].includes(kind.kind) && (
					<NumberField id="ad-e" label="Key" value={key} max={maxKey} onChange={setE} />
				)}
				{usesMu && <NumberField id="ad-mu" label="Step from position" value={mu} max={2} onChange={setMu} />}
				{kind.kind === 'node' && (
					<>
						<NumberField id="ad-level" label="Level" value={level} max={16} onChange={(n) => setLevel(Math.max(1, n))} />
						<NumberField id="ad-j" label="Node" value={node} max={maxNode} onChange={setJ} />
					</>
				)}
				{kind.kind === 'prf' && <NumberField id="ad-pair" label="Pair of chains" value={pair} max={28} onChange={setPair} />}
			</div>

			<div className="lp-gridwrap">
				<div className="ad-bytes" aria-label={`Address 0x${h}`}>
					<div className="ad-seg ad-lo">
						<code>{h.slice(0, 8)}</code>
						<span>4 bytes</span>
						<b>{lo}</b>
					</div>
					<div className="ad-seg ad-hi">
						<code>{h.slice(8, 14)}</code>
						<span>3 bytes</span>
						<b>
							{hi}
							{usesLayer && layer === 1 ? ', + 2²³ for the top layer' : ''}
						</b>
					</div>
					<div className="ad-seg ad-type">
						<code>{h.slice(14, 16)}</code>
						<span>1 byte</span>
						<b>
							type {kind.type}
							{usesMu ? ` + 32 × ${muVal}` : ''}
						</b>
					</div>
					<div className="ad-seg ad-zero">
						<code>{h.slice(16)}</code>
						<span>8 bytes</span>
						<b>always 0</b>
					</div>
				</div>
			</div>

			<p className="lp-status">
				0x{h}: the address of {kind.what}. Numbers are written smallest byte first, so {fmt(4464)} (0x1170) is
				stored as 70 11 00 00.
			</p>
		</figure>
	);
}
