/**
 * An interactive 4-bit Lamport key. The reader signs messages with one key and
 * sees which secrets each signature reveals, then picks a message a forger
 * wants and sees whether the revealed secrets are enough to sign it. Shows why
 * a Lamport key can sign only once. Hashes are real Keccak-256.
 */
import React, { useEffect, useState } from 'react';
import { keccak_256 } from '@noble/hashes/sha3';
import './LamportPanel.css';

type Bits = number[];
type Key = { secrets: Uint8Array[][]; hashes: Uint8Array[][] }; // [value][bit]

const NAMES = ['a', 'b', 'c', 'd'];

function newKey(): Key {
	const secrets: Uint8Array[][] = [[], []];
	const hashes: Uint8Array[][] = [[], []];
	for (let v = 0; v < 2; v++) {
		for (let i = 0; i < 4; i++) {
			const s = new Uint8Array(32);
			crypto.getRandomValues(s);
			secrets[v][i] = s;
			hashes[v][i] = keccak_256(s);
		}
	}
	return { secrets, hashes };
}

const short = (b?: Uint8Array) =>
	b ? `0x${Array.from(b.slice(0, 3), (x) => x.toString(16).padStart(2, '0')).join('')}…` : '…';
const str = (m: Bits) => m.join('');

function BitRow({ label, bits, onFlip }: { label: string; bits: Bits; onFlip: (i: number) => void }) {
	return (
		<div className="lp-field">
			<span className="lp-label">{label}</span>
			<div className="lp-bits" role="group" aria-label={label}>
				{bits.map((b, i) => (
					<button
						key={i}
						type="button"
						aria-pressed={b === 1}
						aria-label={`bit ${i} = ${b}`}
						onClick={() => onFlip(i)}
					>
						{b}
					</button>
				))}
			</div>
		</div>
	);
}

export default function LamportPanel() {
	const [key, setKey] = useState<Key>();
	const [msg, setMsg] = useState<Bits>([1, 0, 1, 1]);
	const [want, setWant] = useState<Bits>([0, 0, 1, 1]);
	const [signed, setSigned] = useState<Bits[]>([]);

	// Generate the key in the browser only, so server and client render the same markup.
	useEffect(() => setKey(newKey()), []);

	const revealed = (v: number, i: number) => signed.some((m) => m[i] === v);
	const flip = (set: React.Dispatch<React.SetStateAction<Bits>>) => (i: number) =>
		set((bits) => bits.map((b, j) => (j === i ? b ^ 1 : b)));

	const sign = () => {
		if (!signed.some((m) => str(m) === str(msg))) setSigned([...signed, [...msg]]);
	};
	const reset = () => {
		setKey(newKey());
		setSigned([]);
	};

	const missing = want.map((v, i) => (revealed(v, i) ? null : `${NAMES[i]}${v}`)).filter(Boolean);
	const wantedWasSigned = signed.some((m) => str(m) === str(want));

	let verdict: { kind: string; title: string; text: string };
	if (wantedWasSigned) {
		verdict = { kind: 'safe', title: 'That message was really signed', text: 'The forger can only copy the existing signature.' };
	} else if (missing.length) {
		verdict = {
			kind: 'safe',
			title: 'Forgery blocked',
			text: `To sign ${str(want)}, the forger needs ${missing.join(', ')}, which ${missing.length > 1 ? 'were' : 'was'} never revealed. Only ${missing.length > 1 ? 'their hashes are' : 'its hash is'} public, and a hash can't be reversed.`,
		};
	} else {
		verdict = {
			kind: 'bad',
			title: `Forged: ${str(want)} was never signed`,
			text: 'Every secret it needs was already revealed by earlier signatures. This is why a Lamport key must sign only one message.',
		};
	}

	return (
		<figure className="lamport-panel not-content">
			<div className="lp-head">
				<strong>A 4-bit Lamport key</strong>
				<span className="lp-label">real Keccak-256 · values shortened</span>
			</div>

			<div className="lp-controls">
				<BitRow label="Message to sign" bits={msg} onFlip={flip(setMsg)} />
				<button type="button" className="lp-primary" onClick={sign}>
					Sign it
				</button>
				<button type="button" className="lp-ghost" onClick={reset}>
					New key
				</button>
			</div>

			<div className="lp-gridwrap">
				<div className="lp-grid">
					<div />
					{NAMES.map((_, i) => (
						<div key={i} className="lp-hd">
							bit {i}
						</div>
					))}
					{[0, 1].map((v) => (
						<React.Fragment key={v}>
							<div className="lp-rl">if bit is {v}</div>
							{NAMES.map((n, i) => {
								const r = revealed(v, i);
								const both = revealed(0, i) && revealed(1, i);
								return (
									<div key={i} className={`lp-cell${both ? ' both' : r ? ' rev' : ''}`}>
										<span className="lp-sec">
											{n}
											{v} = {r ? short(key?.secrets[v][i]) : 'hidden'}
										</span>
										<span className="lp-hash">
											H({n}
											{v}) = {short(key?.hashes[v][i])}
										</span>
									</div>
								);
							})}
						</React.Fragment>
					))}
				</div>
			</div>

			<div className="lp-legend">
				<span>
					<i className="k-hidden" />
					secret, still hidden
				</span>
				<span>
					<i className="k-rev" />
					revealed by a signature
				</span>
				<span>
					<i className="k-both" />
					both secrets of this bit revealed
				</span>
			</div>

			<p className="lp-status">
				{signed.length
					? signed
							.map((m) => `signed ${str(m)} → revealed ${m.map((b, i) => `${NAMES[i]}${b}`).join(', ')}`)
							.join('  ·  ')
					: 'No signatures yet. The public key is published, and every secret is hidden.'}
			</p>

			<div className="lp-controls">
				<BitRow label="Message a forger wants" bits={want} onFlip={flip(setWant)} />
			</div>

			<div className={`lp-verdict ${verdict.kind}`} aria-live="polite">
				<strong>{verdict.title}</strong>
				<span>{verdict.text}</span>
			</div>
		</figure>
	);
}
