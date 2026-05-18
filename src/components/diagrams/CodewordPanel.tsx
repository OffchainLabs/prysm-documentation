/**
 * A real leanXMSS codeword search. The digest is the first 16 bytes of
 * Keccak-256(message ‖ ρ), read as 64 base-4 digits, smallest first
 * (x_i = ⌊D / 4^i⌋ mod 4, with D read little-endian). It's a codeword when
 * digits 58 to 63 are 0 and digits 0 to 57 add up to 106. The panel grinds ρ
 * in small batches, so the page stays responsive, and shows the 58 chains with
 * the position each one reveals.
 */
import React, { useEffect, useRef, useState } from 'react';
import { keccak_256 } from '@noble/hashes/sha3';
import './LamportPanel.css';
import './HashChainPanel.css';
import './CodewordPanel.css';

const V = 58;
const DIGITS = 64;
const TARGET = 106;
const BATCH = 20_000;
const AVERAGE = 1_050_000;
const fmt = (n: number) => n.toLocaleString('en-US');

/** Keccak-256(message ‖ ρ), all 32 bytes, with ρ as 16 bytes, little-endian. */
function fullHash(text: Uint8Array, rho: number): Uint8Array {
	const input = new Uint8Array(text.length + 16);
	input.set(text);
	new DataView(input.buffer).setUint32(text.length, rho, true);
	return keccak_256(input);
}

/** The digest: the first 16 bytes of the hash. */
const digest = (text: Uint8Array, rho: number) => fullHash(text, rho).slice(0, 16);

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const RHO = <span className="cp-rho">ρ</span>;

/** The 64 base-4 digits of a 16-byte digest, smallest first. */
function digitsOf(d: Uint8Array): number[] {
	const out: number[] = [];
	for (const b of d) out.push(b & 3, (b >> 2) & 3, (b >> 4) & 3, (b >> 6) & 3);
	return out;
}

const zerosOk = (d: Uint8Array) => d[15] === 0 && d[14] >> 4 === 0; // digits 58..63
const chainSum = (ds: number[]) => ds.slice(0, V).reduce((s, x) => s + x, 0);

type Search = { rho: number; tried: number; badZeros: number; badSum: number; done: boolean; found: boolean };

export default function CodewordPanel() {
	const [message, setMessage] = useState("These aren't the blocks you're looking for.");
	const [search, setSearch] = useState<Search | null>(null);
	const run = useRef(0);
	useEffect(() => () => void run.current++, []);

	const stop = () => {
		run.current++;
		setSearch((s) => (s && !s.done ? { ...s, done: true } : s));
	};

	const sign = () => {
		const id = ++run.current;
		const text = new TextEncoder().encode(message);
		const st: Search = { rho: 0, tried: 0, badZeros: 0, badSum: 0, done: false, found: false };
		const step = () => {
			if (id !== run.current) return;
			for (let n = 0; n < BATCH; n++, st.rho++) {
				const d = digest(text, st.rho);
				st.tried++;
				if (!zerosOk(d)) {
					st.badZeros++;
					continue;
				}
				if (chainSum(digitsOf(d)) !== TARGET) {
					st.badSum++;
					continue;
				}
				st.done = true;
				st.found = true;
				setSearch({ ...st });
				return;
			}
			setSearch({ ...st });
			setTimeout(step, 0);
		};
		setSearch({ ...st });
		setTimeout(step, 0);
	};

	const found = !!search?.found;
	const rho = search ? (search.found ? search.rho : Math.max(0, search.rho - 1)) : 0;
	const full = fullHash(new TextEncoder().encode(message), rho);
	const d = full.slice(0, 16);
	const ds = digitsOf(d);
	const sum = chainSum(ds);
	const zeros = zerosOk(d);
	const running = !!search && !search.done;

	return (
		<figure className="lamport-panel chain-panel codeword-panel not-content">
			<div className="lp-head">
				<strong>58 chains and 6 forced zeros</strong>
				<span className="lp-label">real Keccak-256 · 16-byte digest</span>
			</div>

			<div className="lp-controls">
				<div className="lp-field cp-text">
					<label className="lp-label" htmlFor="cw-msg">
						Message to sign
					</label>
					<input
						id="cw-msg"
						type="text"
						value={message}
						onChange={(e) => {
							stop();
							setMessage(e.target.value);
							setSearch(null);
						}}
					/>
				</div>
				{running ? (
					<button type="button" className="lp-ghost" onClick={stop}>
						Stop
					</button>
				) : (
					<button type="button" className="lp-primary" onClick={sign}>
						Sign it
					</button>
				)}
			</div>

			<ol className="cp-path" aria-label="From the message to the 64 numbers">
				<li>
					<span className="lp-label">
						1. Keccak-256 hash of the message and {RHO} = {fmt(rho)}, 32 bytes
					</span>
					<code className="cp-hex">
						0x<mark>{hex(d)}</mark>
						{hex(full.slice(16))}
					</code>
				</li>
				<li>
					<span className="lp-label">2. Keep the first 16 bytes: the digest</span>
					<code>0x{hex(d)}</code>
				</li>
				<li>
					<span className="lp-label">3. Each byte gives 4 numbers, 2 bits each, read from the right</span>
					<div className="lp-gridwrap">
						<div className="cw-bytes">
							{Array.from(d, (b, j) => {
								const pairs = [3, 2, 1, 0].map((q) => ({ i: 4 * j + q, v: (b >> (2 * q)) & 3 }));
								return (
									<div key={j} className="cw-byte">
										<span className="cw-bhead">
											byte {j} · 0x{b.toString(16).padStart(2, '0')}
										</span>
										<span className="cw-pairs">
											{pairs.map((p) => (
												<span key={p.i} className={p.i >= V ? (p.v === 0 ? 'cw-p cw-pz' : 'cw-p cw-pbad') : 'cw-p'}>
													<code>{p.v.toString(2).padStart(2, '0')}</code>
													<small>x{p.i}</small>
													<b>{p.v}</b>
												</span>
											))}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</li>
				<li>
					<span className="lp-label">4. The rule</span>
					<div className="cw-checks">
						<span className={zeros ? 'ok' : 'bad'}>
							{zeros ? '✓' : '✗'} x58 to x63 are all 0
						</span>
						<span className={sum === TARGET ? 'ok' : 'bad'}>
							{sum === TARGET ? '✓' : '✗'} x0 to x57 add up to {sum}
							{sum === TARGET ? '' : `, not ${TARGET}`}
						</span>
					</div>
				</li>
				<li>
					<span className="lp-label">
						5. Grinding: try {RHO} = 0, 1, 2… until the digest meets the rule
					</span>
					<code>
						{!search
							? 'Press “Sign it” to start.'
							: running
								? `Grinding… ${fmt(search.tried)} values of ρ tried (about ${fmt(AVERAGE)} on average).`
								: found
									? `Found ρ = ${fmt(search.rho)} after ${fmt(search.tried)} tries: ${fmt(search.badZeros)} digests failed the forced zeros, and ${fmt(search.badSum)} had the zeros but not the sum.`
									: `Stopped after ${fmt(search.tried)} tries.`}
					</code>
				</li>
				<li>
					<span className="lp-label">6. Each of the 58 chains reveals the position given by its number</span>
				</li>
			</ol>

			<div className="lp-gridwrap">
				<div className="cw-grid" aria-label="The 64 digits of the digest">
					{ds.map((x, i) => {
						const forced = i >= V;
						return (
							<div key={i} className={`cw-cell${forced ? ' cw-forced' : ''}${forced && x !== 0 ? ' cw-bad' : ''}`}>
								<span className="cw-idx">{i}</span>
								{forced ? (
									<span className="cw-nochain">
										<b>{x}</b>
										no chain
									</span>
								) : (
									<span className="cw-chain" title={`chain ${i} reveals position ${x}`}>
										{[3, 2, 1, 0].map((p) => (
											<i key={p} className={p < x ? 'st-hidden' : p === x ? 'st-rev' : 'st-calc'} />
										))}
										<b>{x}</b>
									</span>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="lp-legend">
				<span>
					<i className="k-hidden" />
					still secret
				</span>
				<span>
					<i className="k-rev" />
					revealed by the signature
				</span>
				<span>
					<i className="k-calc" />
					rebuilt by the verifier
				</span>
				<span>
					<i className="k-forced" />
					forced to 0, no chain
				</span>
			</div>

			{found && (
				<p className="lp-status">
					The verifier walks {3 * V} − {TARGET} = {3 * V - TARGET} steps along the chains, as for every signature.
				</p>
			)}
		</figure>
	);
}
