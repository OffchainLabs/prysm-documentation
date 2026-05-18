/**
 * From one 32-byte seed to every secret, with the real leanXMSS derivation:
 * S, then P, then one prf call that starts two chains, then the chain itself.
 */
import React, { useState } from 'react';
import { addr, chain, hex, param, prf, schemeSeed, unhex } from './leanxmss';
import { TEST_PK, TEST_SEED } from './testVector';
import './LamportPanel.css';
import './HashChainPanel.css';
import './AddressPanel.css';

const fmt = (n: number) => n.toLocaleString('en-US');
const SEED_HEX = /^(0x)?[0-9a-fA-F]{64}$/;

export default function SeedPanel() {
	const [seedText, setSeedText] = useState(TEST_SEED);
	const [layer, setLayer] = useState(0);
	const [e, setE] = useState(0);
	const [i, setI] = useState(0);

	const ok = SEED_HEX.test(seedText.trim());
	const s0 = ok ? unhex(seedText.trim()) : null;
	const s = s0 && schemeSeed(s0);
	const p = s && param(s);
	const pairIndex = Math.floor(i / 2);
	const out = s && p && prf(p, s, layer, e, pairIndex);
	const x = s && p ? chain(p, s, layer, e, i) : null;
	const isTest = ok && seedText.trim().replace(/^0x/, '').toLowerCase() === TEST_SEED;
	const maxKey = layer === 0 ? 2 ** 32 - 1 : 2 ** 16 - 1;

	return (
		<figure className="lamport-panel chain-panel address-panel not-content">
			<div className="lp-head">
				<strong>From one seed to every secret</strong>
				<span className="lp-label">real leanXMSS derivation</span>
			</div>

			<div className="lp-controls">
				<div className="lp-field cp-text">
					<label className="lp-label" htmlFor="sd-seed">
						Seed S₀, 32 bytes in hex
					</label>
					<input id="sd-seed" type="text" spellCheck={false} value={seedText} onChange={(ev) => setSeedText(ev.target.value)} />
				</div>
				<button
					type="button"
					className="lp-ghost"
					onClick={() => setSeedText(hex(crypto.getRandomValues(new Uint8Array(32))))}
				>
					Random seed
				</button>
				<button type="button" className="lp-ghost" onClick={() => setSeedText(TEST_SEED)}>
					Test seed
				</button>
			</div>

			<div className="lp-controls">
				<div className="lp-field">
					<span className="lp-label">Layer</span>
					<div className="ad-kinds" role="group" aria-label="Layer">
						{['bottom', 'top'].map((name, l) => (
							<button
								key={name}
								type="button"
								aria-pressed={l === layer}
								onClick={() => {
									setLayer(l);
									setE((v) => Math.min(v, l === 0 ? 2 ** 32 - 1 : 2 ** 16 - 1));
								}}
							>
								{name}
							</button>
						))}
					</div>
				</div>
				<div className="lp-field ad-num">
					<label className="lp-label" htmlFor="sd-e">
						Key, 0 to {fmt(maxKey)}
					</label>
					<input
						id="sd-e"
						type="number"
						min={0}
						max={maxKey}
						value={e}
						onChange={(ev) => {
							const n = Math.floor(Number(ev.target.value));
							setE(Number.isFinite(n) ? Math.min(Math.max(n, 0), maxKey) : 0);
						}}
					/>
				</div>
				<div className="lp-field ad-num">
					<label className="lp-label" htmlFor="sd-i">
						Chain, 0 to 57
					</label>
					<input
						id="sd-i"
						type="number"
						min={0}
						max={57}
						value={i}
						onChange={(ev) => {
							const n = Math.floor(Number(ev.target.value));
							setI(Number.isFinite(n) ? Math.min(Math.max(n, 0), 57) : 0);
						}}
					/>
				</div>
			</div>

			{!ok || !s || !p || !out || !x ? (
				<p className="lp-status">Type 64 hex characters.</p>
			) : (
				<ol className="cp-path">
					<li>
						<span className="lp-label">1. Tag the seed with the scheme's name</span>
						<code>
							S = Keccak-256("leanXMSS" ‖ S₀)
							<br />= 0x{hex(s)}
						</code>
					</li>
					<li>
						<span className="lp-label">2. The public parameter</span>
						<code>
							P = Th(16 zero bytes, A_param, S)
							<br />= 0x{hex(p)}
							{isTest ? `, the last 16 bytes of the test public key 0x…${TEST_PK.slice(32)}` : ''}
						</code>
					</li>
					<li>
						<span className="lp-label">
							3. One Keccak call for chains {2 * pairIndex} and {2 * pairIndex + 1}
						</span>
						<code className="cp-hex">
							Keccak-256(P ‖ A_prf ‖ S), with A_prf = 0x{hex(addr.prf(layer, e, pairIndex))}
							<br />= 0x
							{i % 2 === 0 ? <mark>{hex(out.slice(0, 16))}</mark> : hex(out.slice(0, 16))}
							{i % 2 === 1 ? <mark>{hex(out.slice(16))}</mark> : hex(out.slice(16))}
						</code>
					</li>
					<li>
						<span className="lp-label">
							4. Its {i % 2 === 0 ? 'first' : 'last'} 16 bytes start chain {i}
						</span>
						<code>x0 = 0x{hex(x[0])}</code>
					</li>
					<li>
						<span className="lp-label">5. Three steps along chain {i}</span>
						<code>
							x1 = Th(P, A_chain(0), x0 ‖ {i}) = 0x{hex(x[1])}
							<br />
							x2 = Th(P, A_chain(1), x1 ‖ {i}) = 0x{hex(x[2])}
							<br />
							x3 = Th(P, A_chain(2), x2 ‖ {i}) = 0x{hex(x[3])}, the end
						</code>
					</li>
				</ol>
			)}
		</figure>
	);
}
