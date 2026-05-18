/**
 * Verify the leanXMSS known-answer signature in the browser, with the full
 * 186-permutation check, after optionally tampering with one part of it.
 */
import React, { useState } from 'react';
import { hex, unhex, verifyDetailed, V } from './leanxmss';
import { TEST_MESSAGE, TEST_PK, TEST_SIGNATURE } from './testVector';
import './LamportPanel.css';
import './HashChainPanel.css';
import './AddressPanel.css';

const fmt = (n: number) => n.toLocaleString('en-US');
const flip = (b: Uint8Array, at: number) => {
	const c = b.slice();
	c[at] ^= 1;
	return c;
};

const TAMPER: { name: string; apply: (m: Uint8Array, sig: Uint8Array) => [Uint8Array, Uint8Array] }[] = [
	{ name: 'Nothing', apply: (m, sig) => [m, sig] },
	{ name: 'One bit of the message', apply: (m, sig) => [flip(m, 0), sig] },
	{
		name: 'The leaf index: use the next one',
		apply: (m, sig) => {
			const s = sig.slice();
			const n = (s[0] + s[1] * 2 ** 8 + s[2] * 2 ** 16 + s[3] * 2 ** 24 + 1) % 2 ** 32;
			s.set([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff], 0);
			return [m, s];
		},
	},
	{ name: 'One bit of ρ⁰', apply: (m, sig) => [m, flip(sig, 4)] },
	{ name: 'One bit of a bottom chain value', apply: (m, sig) => [m, flip(sig, 20)] },
	{ name: 'One bit of the bottom path', apply: (m, sig) => [m, flip(sig, 20 + 16 * V)] },
	{ name: 'One bit of a top chain value', apply: (m, sig) => [m, flip(sig, 1204 + 16)] },
	{ name: 'One bit of the top path', apply: (m, sig) => [m, flip(sig, 2404 - 16)] },
];

const PK = unhex(TEST_PK);
const MESSAGE = unhex(TEST_MESSAGE);
const SIGNATURE = unhex(TEST_SIGNATURE);

export default function VerifyPanel() {
	const [t, setT] = useState(0);
	const [m, sig] = TAMPER[t].apply(MESSAGE, SIGNATURE);
	const r = verifyDetailed(PK, m, sig);
	const check = (good: boolean | undefined) => (good === undefined ? '…' : good ? '✓' : '✗');

	return (
		<figure className="lamport-panel chain-panel address-panel not-content">
			<div className="lp-head">
				<strong>Verify the official test signature</strong>
				<span className="lp-label">real leanXMSS · 186 permutations</span>
			</div>

			<ol className="cp-path">
				<li>
					<span className="lp-label">Public key, 32 bytes: the root, then P</span>
					<code>0x{TEST_PK}</code>
				</li>
				<li>
					<span className="lp-label">Message, 32 bytes</span>
					<code>0x{hex(m)}</code>
				</li>
				<li>
					<span className="lp-label">Signature, 2,404 bytes</span>
					<code className="vf-sig">0x{hex(sig)}</code>
				</li>
			</ol>

			<div className="lp-field">
				<span className="lp-label">Let a forger change</span>
				<div className="ad-kinds" role="group" aria-label="Let a forger change">
					{TAMPER.map((x, i) => (
						<button key={x.name} type="button" aria-pressed={i === t} onClick={() => setT(i)}>
							{x.name}
						</button>
					))}
				</div>
			</div>

			<ol className="cp-path">
				<li>
					<span className="lp-label">1. Read the leaf index</span>
					<code>
						leaf index = {fmt(r.idx ?? 0)}, so the bottom tree is b = {fmt(r.b ?? 0)}
					</code>
				</li>
				<li>
					<span className="lp-label">2. Bottom half: the message's digest</span>
					<code>
						{check(r.bottomZeros)} last 6 numbers are 0 · {check(r.bottomSum === 106)} first 58 add up to{' '}
						{r.bottomSum ?? '…'}
					</code>
				</li>
				<li>
					<span className="lp-label">3. Rebuild the leaf of bottom key {fmt(r.idx ?? 0)}, then climb to the root of its tree</span>
					<code>{r.bottomRoot ? `0x${hex(r.bottomRoot)}` : 'not reached'}</code>
				</li>
				<li>
					<span className="lp-label">4. Top half: the digest of that root</span>
					<code>
						{r.topSum === undefined
							? 'not reached'
							: `${check(r.topZeros)} last 6 numbers are 0 · ${check(r.topSum === 106)} first 58 add up to ${r.topSum}`}
					</code>
				</li>
				<li>
					<span className="lp-label">5. Rebuild the leaf of top key {fmt(r.b ?? 0)}, then climb to the top</span>
					<code>{r.topRoot ? `0x${hex(r.topRoot)}` : 'not reached'}</code>
				</li>
			</ol>

			<div className="cp-compare">
				<div className={`cp-box${r.topRoot ? (r.ok ? ' ok' : ' bad') : ' bad'}`}>
					<span className="lp-label">Reached by the verifier</span>
					<b>{r.topRoot ? `0x${hex(r.topRoot)}` : '…'}</b>
				</div>
				<span className="cp-eq" aria-hidden="true">
					{r.ok ? '=' : '≠'}
				</span>
				<div className="cp-box">
					<span className="lp-label">Root in the public key</span>
					<b>0x{TEST_PK.slice(0, 32)}</b>
				</div>
			</div>

			<div className={`lp-verdict ${r.ok ? 'safe' : 'bad'}`} aria-live="polite">
				<strong>{r.ok ? 'Valid signature' : 'Invalid signature'}</strong>
				<span>{r.why}</span>
			</div>
		</figure>
	);
}
