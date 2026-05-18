/**
 * Interactive hash chains, with real Keccak-256.
 *
 * - `<HashChainPanel />`: one chain of 4 positions. The reader picks a number
 *   from 0 to 3 to sign, sees which position is revealed, and follows the
 *   verifier hashing it forward to the public end.
 * - `<HashChainPanel mode="message" />`: 4 chains sign an 8-bit message, read
 *   as 4 digits. The reader signs a message, then picks one a forger wants and
 *   sees that any digit can be raised by hashing forward, but never lowered.
 * - `<HashChainPanel mode="checksum" />`: the same, plus 2 checksum chains that
 *   sign Σ(3 − digit). Raising a message digit lowers the checksum, so the
 *   forgery always needs some chain to go down.
 * - `<HashChainPanel mode="fixedodds" />`: without ρ, a message can be signed only
 *   if its hash happens to add up to the target. Shows all 256 possible
 *   hashes and how few qualify, for any target.
 * - `<HashChainPanel mode="fixedsum" />`: 4 chains that only sign digits adding up
 *   to 6. The signer grinds a counter ρ until hash(message ‖ ρ) qualifies; any
 *   forgery with the same total needs some digit to go down.
 * - `<HashChainPanel mode="leaf" />`: the public key is one hash of all chain
 *   ends. The verifier rebuilds the ends from the signature and compares; a
 *   one-bit change on a revealed value breaks the match.
 * - `<HashChainPanel mode="static" />`: the bare chain, no values or controls.
 */
import React, { useEffect, useState } from 'react';
import { keccak_256 } from '@noble/hashes/sha3';
import './LamportPanel.css';
import './HashChainPanel.css';

const POSITIONS = 4;

function newChain(): Uint8Array[] {
	const x0 = new Uint8Array(32);
	crypto.getRandomValues(x0);
	const chain: Uint8Array[] = [x0];
	for (let p = 1; p < POSITIONS; p++) chain.push(keccak_256(chain[p - 1]));
	return chain;
}

const short = (b?: Uint8Array) =>
	b ? `0x${Array.from(b.slice(0, 3), (x) => x.toString(16).padStart(2, '0')).join('')}…` : '…';

const toDigits = (bits: number[]) => [0, 2, 4, 6].map((i) => bits[i] * 2 + bits[i + 1]);

/** The checksum: how far all digits are from the top, Σ(3 − digit). At most 12, so 2 base-4 digits. */
const checksumOf = (digits: number[]) => digits.reduce((s, d) => s + (POSITIONS - 1 - d), 0);
const checksumDigits = (digits: number[]) => {
	const v = checksumOf(digits);
	return [Math.floor(v / POSITIONS), v % POSITIONS];
};

export default function HashChainPanel({
	mode = 'single',
}: {
	mode?: 'single' | 'message' | 'checksum' | 'fixedodds' | 'fixedsum' | 'leaf' | 'static';
}) {
	if (mode === 'static') return <StaticChain />;
	if (mode === 'checksum') return <MessagePanel checksum />;
	if (mode === 'fixedsum') return <FixedSumPanel />;
	if (mode === 'fixedodds') return <FixedSumOdds />;
	if (mode === 'leaf') return <LeafPanel />;
	return mode === 'message' ? <MessagePanel /> : <SinglePanel />;
}

/* ---------- Bare chain ---------- */

function StaticChain() {
	return (
		<figure className="lamport-panel chain-panel cp-static not-content" aria-label="x0 hashes to x1, x1 to x2, x2 to x3">
			<div className="lp-gridwrap">
				<div className="cp-chain">
					{Array.from({ length: POSITIONS }, (_, p) => {
						const state = p === 0 ? 'st-hidden' : p === POSITIONS - 1 ? 'st-calc' : '';
						return (
							<React.Fragment key={p}>
								{p > 0 && <span className="cp-arrow">hash →</span>}
								<div className={`cp-node ${state}`}>
									<span className="cp-val">x{p}</span>
									<span className="cp-tag">
										{p === 0 ? 'private key' : p === POSITIONS - 1 ? 'public key' : '\u00a0'}
									</span>
								</div>
							</React.Fragment>
						);
					})}
				</div>
			</div>
		</figure>
	);
}

/* ---------- One chain ---------- */

function SinglePanel() {
	const [chain, setChain] = useState<Uint8Array[]>();
	const [d, setD] = useState(1);
	useEffect(() => setChain(newChain()), []);

	const steps = POSITIONS - 1 - d;
	return (
		<figure className="lamport-panel chain-panel not-content">
			<div className="lp-head">
				<strong>One hash chain</strong>
				<span className="lp-label">real Keccak-256 · values shortened</span>
			</div>

			<div className="lp-controls">
				<div className="lp-field">
					<span className="lp-label">Number to sign</span>
					<div className="lp-bits" role="group" aria-label="Number to sign">
						{[0, 1, 2, 3].map((n) => (
							<button key={n} type="button" aria-pressed={d === n} onClick={() => setD(n)}>
								{n}
							</button>
						))}
					</div>
				</div>
				<button type="button" className="lp-ghost" onClick={() => setChain(newChain())}>
					New chain
				</button>
			</div>

			<div className="lp-gridwrap">
				<div className="cp-chain">
					{Array.from({ length: POSITIONS }, (_, p) => {
						const state = p < d ? 'st-hidden' : p === d ? 'st-rev' : 'st-calc';
						return (
							<React.Fragment key={p}>
								{p > 0 && <span className="cp-arrow">hash →</span>}
								<div className={`cp-node ${state}`}>
									<span className="cp-name">x{p}</span>
									<span className="cp-val">{state === 'st-hidden' ? 'hidden' : short(chain?.[p])}</span>
									<span className="cp-tag">
										{p === 0 ? 'private key' : p === POSITIONS - 1 ? 'public key' : ' '}
									</span>
								</div>
							</React.Fragment>
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
					the signature
				</span>
				<span>
					<i className="k-calc" />
					anyone can compute it from the signature
				</span>
			</div>

			<div className="lp-verdict safe" aria-live="polite">
				<strong>
					Signature on {d}: reveal x{d}
				</strong>
				<span>
					{steps === 0
						? `The verifier hashes it 0 times: x${d} is already the public key, so it checks out.`
						: `The verifier hashes x${d} ${steps === 1 ? 'once' : `${steps} times`} (3 − ${d} = ${steps}) and lands on ${short(chain?.[POSITIONS - 1])}, the public key. It matches, so the signature is valid.`}
				</span>
			</div>
		</figure>
	);
}

/* ---------- Four chains signing a message ---------- */

function BitPairs({ label, bits, onFlip }: { label: string; bits: number[]; onFlip: (i: number) => void }) {
	const digits = toDigits(bits);
	return (
		<div className="lp-field">
			<span className="lp-label">{label}</span>
			<div className="cp-pairs" role="group" aria-label={label}>
				{digits.map((digit, c) => (
					<div key={c} className="cp-pair">
						<div className="lp-bits">
							{[2 * c, 2 * c + 1].map((i) => (
								<button
									key={i}
									type="button"
									aria-pressed={bits[i] === 1}
									aria-label={`bit ${i} = ${bits[i]}`}
									onClick={() => onFlip(i)}
								>
									{bits[i]}
								</button>
							))}
						</div>
						<span className="cp-digit">= {digit}</span>
					</div>
				))}
			</div>
		</div>
	);
}

function ChecksumLine({ bits }: { bits: number[] }) {
	const d = toDigits(bits);
	const [hi, lo] = checksumDigits(d);
	return (
		<p className="cp-sum">
			checksum = {d.map((x) => `(3 − ${x})`).join(' + ')} = {checksumOf(d)} → in base 4: {hi} {lo}
		</p>
	);
}

function MessagePanel({ checksum = false }: { checksum?: boolean }) {
	const nChains = checksum ? 6 : 4;
	const rows = Array.from({ length: nChains }, (_, c) => c);
	const label = (c: number) => (c < 4 ? `chain ${c}` : `checksum ${c - 4}`);
	const allDigits = (bits: number[]) => {
		const d = toDigits(bits);
		return checksum ? [...d, ...checksumDigits(d)] : d;
	};

	const [chains, setChains] = useState<Uint8Array[][]>();
	const [msg, setMsg] = useState([0, 1, 0, 0, 1, 0, 0, 1]);
	const [want, setWant] = useState([1, 0, 0, 1, 1, 1, 0, 1]);
	const [signed, setSigned] = useState<number[] | null>(null);
	useEffect(() => setChains(rows.map(newChain)), []);

	const flip = (set: React.Dispatch<React.SetStateAction<number[]>>) => (i: number) =>
		set((bits) => bits.map((b, j) => (j === i ? b ^ 1 : b)));

	const wantD = allDigits(want);
	let verdict: { kind: string; title: string; text: string };
	if (!signed) {
		verdict = {
			kind: 'safe',
			title: 'Nothing signed yet',
			text: 'Sign a message first. Without a signature, the forger only has the public chain ends.',
		};
	} else if (signed.join() === wantD.join()) {
		verdict = { kind: 'safe', title: 'That message was really signed', text: 'The forger can only copy the existing signature.' };
	} else {
		const down = wantD.map((w, c) => (w < signed[c] ? c : -1)).filter((c) => c >= 0);
		if (down.length) {
			verdict = {
				kind: 'safe',
				title: 'Forgery blocked',
				text: `${down.map((c) => `${label(c)} would have to go down, from ${signed[c]} to ${wantD[c]}`).join('; ')}. That means reversing a hash, which nobody can do.`,
			};
		} else {
			const hashes = wantD.reduce((s, w, c) => s + w - signed[c], 0);
			verdict = {
				kind: 'bad',
				title: `Forged with ${hashes} hash${hashes === 1 ? '' : 'es'}: ${wantD.slice(0, 4).join(' ')} was never signed`,
				text: 'Every wanted digit is at or above the signed one. The forger hashes the revealed values forward, and the verifier accepts a message the signer never approved.',
			};
		}
	}

	return (
		<figure className="lamport-panel chain-panel not-content">
			<div className="lp-head">
				<strong>{checksum ? 'Four chains plus a checksum' : 'Four chains sign a message'}</strong>
				<span className="lp-label">real Keccak-256 · values shortened</span>
			</div>

			<div className="lp-controls">
				<BitPairs label="Message to sign" bits={msg} onFlip={flip(setMsg)} />
				<button type="button" className="lp-primary" onClick={() => setSigned(allDigits(msg))}>
					Sign it
				</button>
				<button
					type="button"
					className="lp-ghost"
					onClick={() => {
						setChains(rows.map(newChain));
						setSigned(null);
					}}
				>
					New key
				</button>
			</div>
			{checksum && <ChecksumLine bits={msg} />}

			<div className="lp-gridwrap">
				<div className="cp-grid">
					<div />
					{Array.from({ length: POSITIONS }, (_, p) => (
						<div key={p} className="lp-hd">
							x{p}
							{p === POSITIONS - 1 ? ' (public)' : ''}
						</div>
					))}
					{rows.map((c) => (
						<React.Fragment key={c}>
							<div className={`lp-rl${c >= 4 ? ' cp-rl-sum' : ''}`}>{label(c)}</div>
							{Array.from({ length: POSITIONS }, (_, p) => {
								const s = signed?.[c];
								const state =
									s === undefined
										? p === POSITIONS - 1
											? 'st-calc'
											: 'st-hidden'
										: p < s
											? 'st-hidden'
											: p === s
												? 'st-rev'
												: 'st-calc';
								const isWant = signed && p === wantD[c] && signed.join() !== wantD.join();
								return (
									<div key={p} className={`cp-cell ${state}${isWant ? ' want' : ''}`}>
										{state === 'st-hidden' ? 'hidden' : short(chains?.[c][p])}
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
					still secret
				</span>
				<span>
					<i className="k-rev" />
					revealed by the signature
				</span>
				<span>
					<i className="k-calc" />
					anyone can compute it
				</span>
				<span>
					<i className="k-want" />
					what the forger needs
				</span>
			</div>

			<p className="lp-status">
				{signed
					? `signed ${signed.slice(0, 4).join(' ')} → revealed ${signed.map((s, c) => `x${s} of ${label(c)}`).join(', ')}`
					: `No signature yet. The public key is the ${nChains} chain ends.`}
			</p>

			<div className="lp-controls">
				<BitPairs label="Message a forger wants" bits={want} onFlip={flip(setWant)} />
			</div>
			{checksum && <ChecksumLine bits={want} />}

			<div className={`lp-verdict ${verdict.kind}`} aria-live="polite">
				<strong>{verdict.title}</strong>
				<span>{verdict.text}</span>
			</div>
		</figure>
	);
}

/* ---------- Four chains with a fixed sum ---------- */

const TARGET = 6; // 4 digits from 0 to 3 average 6
const MAX_TRIES = 10_000;

/** The 4 base-4 digits of hash(message ‖ ρ): the first byte, two bits per digit. */
/** hash(message ‖ ρ), with ρ appended as 4 bytes. */
function hashFor(message: string, rho: number): Uint8Array {
	const text = new TextEncoder().encode(message);
	const input = new Uint8Array(text.length + 4);
	input.set(text);
	new DataView(input.buffer).setUint32(text.length, rho);
	return keccak_256(input);
}

function digitsFor(message: string, rho: number): number[] {
	const b = hashFor(message, rho)[0];
	return [6, 4, 2, 0].map((shift) => (b >> shift) & 3);
}

/** From a hash to its 4 numbers: the full hash, its first byte as bit pairs, the numbers and their sum. */
function HashPath({ hash, title }: { hash: Uint8Array; title: React.ReactNode }) {
	const hex = Array.from(hash, (x) => x.toString(16).padStart(2, '0')).join('');
	const bits = hash[0].toString(2).padStart(8, '0');
	const pairs = [0, 2, 4, 6].map((i) => bits.slice(i, i + 2));
	const nums = pairs.map((p) => parseInt(p, 2));
	return (
		<ol className="cp-path" aria-label="From the hash to its 4 numbers">
			<li>
				<span className="lp-label">1. {title}</span>
				<code className="cp-hex">
					0x<mark>{hex.slice(0, 2)}</mark>
					{hex.slice(2)}
				</code>
			</li>
			<li>
				<span className="lp-label">2. Its first byte, 8 bits, split into pairs</span>
				<code>
					0x{hex.slice(0, 2)} = {pairs.join(' ')}
				</code>
			</li>
			<li>
				<span className="lp-label">3. Each pair is a number from 0 to 3</span>
				<code>
					{pairs.map((p, c) => `${p} → ${nums[c]}`).join(', ')}, which add up to {nums.join(' + ')} ={' '}
					{nums.reduce((s, n) => s + n, 0)}
				</code>
			</li>
		</ol>
	);
}

const sum = (ds: number[]) => ds.reduce((s, d) => s + d, 0);

/** ρ, kept lowercase inside the uppercase labels. */
const RHO = <span className="cp-rho">ρ</span>;

type Grind = { digits: number[]; rho: number; tried: number[][] };

function grind(message: string): Grind | null {
	const tried: number[][] = [];
	for (let rho = 0; rho < MAX_TRIES; rho++) {
		const ds = digitsFor(message, rho);
		tried.push(ds);
		if (sum(ds) === TARGET) return { digits: ds, rho, tried };
	}
	return null;
}

/** Steps 1 to 4: hash the message with ρ, read 4 numbers, and grind ρ until they add up to TARGET. */
function GrindSteps({ message, signed }: { message: string; signed: Grind | null }) {
	const rho = signed?.rho ?? 0;
	return (
		<>
			<HashPath
				hash={hashFor(message, rho)}
				title={
					<>
						Keccak-256 hash of the message and {RHO} = {rho}, 32 bytes
					</>
				}
			/>
			<ol className="cp-path" start={4}>
				<li>
					<span className="lp-label">
						4. Grinding: try {RHO} = 0, 1, 2… until the numbers add up to {TARGET}
					</span>
					{signed ? (
						<ol className="cp-tries">
							{signed.tried.map((ds, r) => (
								<li key={r} className={sum(ds) === TARGET ? 'ok' : ''}>
									ρ = {r}: digits {ds.join(' ')}, sum {sum(ds)} {sum(ds) === TARGET ? '✓ signed' : '✗ try again'}
								</li>
							))}
						</ol>
					) : (
						<code>Press “Sign it” to start.</code>
					)}
				</li>
			</ol>
		</>
	);
}

function FixedSumPanel() {
	const [chains, setChains] = useState<Uint8Array[][]>();
	const [message, setMessage] = useState('I find your lack of signatures disturbing');
	const [signed, setSigned] = useState<Grind | null>(null);
	const [want, setWant] = useState([2, 1, 2, 1]);
	useEffect(() => setChains([0, 1, 2, 3].map(newChain)), []);

	const sign = () => setSigned(grind(message));

	const bump = (c: number) => setWant((w) => w.map((d, i) => (i === c ? (d + 1) % POSITIONS : d)));

	let verdict: { kind: string; title: string; text: string };
	const wantSum = sum(want);
	if (!signed) {
		verdict = { kind: 'safe', title: 'Nothing signed yet', text: 'Sign a message first.' };
	} else if (want.join() === signed.digits.join()) {
		verdict = { kind: 'safe', title: 'Those are the signed digits', text: 'The forger can only copy the existing signature.' };
	} else if (wantSum !== TARGET) {
		verdict = {
			kind: 'safe',
			title: 'Rejected by the verifier',
			text: `These digits add up to ${wantSum}, not ${TARGET}. The verifier only accepts digits that add up to exactly ${TARGET}.`,
		};
	} else {
		const down = want.map((w, c) => (w < signed.digits[c] ? c : -1)).filter((c) => c >= 0);
		verdict = {
			kind: 'safe',
			title: 'Forgery blocked',
			text: `To keep the total at ${TARGET} while raising some digits, others must go down: ${down
				.map((c) => `chain ${c} from ${signed.digits[c]} to ${want[c]}`)
				.join(', ')}. That means reversing a hash, which nobody can do.`,
		};
	}

	return (
		<figure className="lamport-panel chain-panel not-content">
			<div className="lp-head">
				<strong>Four chains with a fixed sum of {TARGET}</strong>
				<span className="lp-label">real Keccak-256 · values shortened</span>
			</div>

			<div className="lp-controls">
				<div className="lp-field cp-text">
					<label className="lp-label" htmlFor="fs-msg">
						Message to sign
					</label>
					<input
						id="fs-msg"
						type="text"
						value={message}
						onChange={(e) => {
							setMessage(e.target.value);
							setSigned(null);
						}}
					/>
				</div>
				<button type="button" className="lp-primary" onClick={sign}>
					Sign it
				</button>
				<button
					type="button"
					className="lp-ghost"
					onClick={() => {
						setChains([0, 1, 2, 3].map(newChain));
						setSigned(null);
					}}
				>
					New key
				</button>
			</div>

			<GrindSteps message={message} signed={signed} />

			<div className="lp-gridwrap">
				<div className="cp-grid">
					<div />
					{Array.from({ length: POSITIONS }, (_, p) => (
						<div key={p} className="lp-hd">
							x{p}
							{p === POSITIONS - 1 ? ' (public)' : ''}
						</div>
					))}
					{[0, 1, 2, 3].map((c) => (
						<React.Fragment key={c}>
							<div className="lp-rl">chain {c}</div>
							{Array.from({ length: POSITIONS }, (_, p) => {
								const s = signed?.digits[c];
								const state =
									s === undefined
										? p === POSITIONS - 1
											? 'st-calc'
											: 'st-hidden'
										: p < s
											? 'st-hidden'
											: p === s
												? 'st-rev'
												: 'st-calc';
								const isWant = signed && p === want[c] && signed.digits.join() !== want.join();
								return (
									<div key={p} className={`cp-cell ${state}${isWant ? ' want' : ''}`}>
										{state === 'st-hidden' ? 'hidden' : short(chains?.[c][p])}
									</div>
								);
							})}
						</React.Fragment>
					))}
				</div>
			</div>

			<p className="lp-status">
				{signed
					? `signed "${message}" with ρ = ${signed.rho} → digits ${signed.digits.join(' ')}. The verifier hashes ${
							POSITIONS * 3 - TARGET
						} times, as for every signature: 4 × 3 − ${TARGET}.`
					: 'No signature yet.'}
			</p>

			<div className="lp-controls">
				<div className="lp-field">
					<span className="lp-label">Digits a forger wants (click to change)</span>
					<div className="lp-bits" role="group" aria-label="Digits a forger wants">
						{want.map((d, c) => (
							<button key={c} type="button" aria-label={`chain ${c} = ${d}`} onClick={() => bump(c)}>
								{d}
							</button>
						))}
					</div>
				</div>
				<span className="cp-digit">sum = {wantSum}</span>
			</div>

			<div className={`lp-verdict ${verdict.kind}`} aria-live="polite">
				<strong>{verdict.title}</strong>
				<span>{verdict.text}</span>
			</div>
		</figure>
	);
}

/* ---------- How many messages a fixed sum lets you sign ---------- */

/** All 256 possible first bytes of a hash, as 4 base-4 digits each. */
const ALL = Array.from({ length: 256 }, (_, b) => [6, 4, 2, 0].map((shift) => (b >> shift) & 3));

function FixedSumOdds() {
	const [message, setMessage] = useState('The hash is strong with this one');
	const [target, setTarget] = useState(TARGET);
	const [batch, setBatch] = useState<{ ok: number; total: number } | null>(null);

	// No ρ here: read the plain hash of the message.
	const hash = keccak_256(new TextEncoder().encode(message));
	const byte = hash[0];
	const plain = [6, 4, 2, 0].map((shift) => (byte >> shift) & 3);

	const matching = ALL.filter((ds) => sum(ds) === target).length;
	const canSign = sum(plain) === target;

	const tryMany = () => {
		const total = 100;
		let ok = 0;
		for (let i = 1; i <= total; i++) {
			const b = keccak_256(new TextEncoder().encode(`gm #${i}`))[0];
			if (sum([6, 4, 2, 0].map((s) => (b >> s) & 3)) === target) ok++;
		}
		setBatch({ ok, total });
	};

	return (
		<figure className="lamport-panel chain-panel not-content">
			<div className="lp-head">
				<strong>Which messages can be signed?</strong>
				<span className="lp-label">real Keccak-256 · 4 chains</span>
			</div>

			<div className="lp-controls">
				<div className="lp-field cp-text">
					<label className="lp-label" htmlFor="fo-msg">
						Message
					</label>
					<input id="fo-msg" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
				</div>
			</div>

			<HashPath hash={hash} title="Its Keccak-256 hash, 32 bytes" />
			<div className="lp-controls">
				<div className="lp-field">
					<span className="lp-label">Target</span>
					<div className="lp-bits cp-targets" role="group" aria-label="Target">
						{Array.from({ length: 13 }, (_, t) => (
							<button
								key={t}
								type="button"
								aria-pressed={t === target}
								onClick={() => {
									setTarget(t);
									setBatch(null);
								}}
							>
								{t}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className={`lp-verdict ${canSign ? 'safe' : 'bad'}`} aria-live="polite">
				<strong>{canSign ? 'This message can be signed' : "This message can't be signed"}</strong>
				<span>
					Its hash gives the numbers {plain.join(' ')}, which add up to {sum(plain)}
					{canSign ? `, the target.` : `, not ${target}. With a fixed sum and nothing else, the signer is stuck.`}
				</span>
			</div>

			<div className="lp-gridwrap">
				<div className="cp-odds" aria-label={`All 256 possible numbers; ${matching} add up to ${target}`}>
					{ALL.map((ds, b) => (
						<span
							key={b}
							className={`${sum(ds) === target ? 'hit' : ''}${b === byte ? ' here' : ''}`}
							title={`${ds.join(' ')}: sum ${sum(ds)}`}
						>
							{ds.join('')}
						</span>
					))}
				</div>
			</div>

			<div className="lp-legend">
				<span>
					<i className="k-rev" />
					adds up to {target}: can be signed
				</span>
				<span>
					<i className="k-hidden" />
					can't be signed
				</span>
				<span>
					<i className="k-want" />
					this message's hash
				</span>
			</div>

			<p className="lp-status">
				Only {matching} of the 256 possible hashes add up to {target}
				{matching ? `: about 1 message in ${Math.round(256 / matching)} can be signed.` : ': no message can be signed.'}
			</p>

			<div className="lp-controls">
				<button type="button" className="lp-ghost" onClick={tryMany}>
					Try 100 messages
				</button>
				{batch && (
					<span className="cp-digit">
						“gm #1” to “gm #{batch.total}”: {batch.ok} of {batch.total} can be signed.
					</span>
				)}
			</div>
		</figure>
	);
}

/* ---------- One hash of all the chain ends as the public key ---------- */

const concat = (parts: Uint8Array[]) => {
	const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
};

function LeafPanel() {
	const [chains, setChains] = useState<Uint8Array[][]>();
	const [message, setMessage] = useState('May the stake be with you.');
	const [signed, setSigned] = useState<Grind | null>(null);
	const [tamper, setTamper] = useState(false);
	useEffect(() => setChains([0, 1, 2, 3].map(newChain)), []);

	const publicKey = chains && keccak_256(concat(chains.map((c) => c[POSITIONS - 1])));

	const sign = () => setSigned(grind(message));

	// What the verifier sees on each chain, from the revealed position up to the end.
	const seen =
		chains && signed
			? signed.digits.map((d, c) => {
					let v = chains[c][d];
					if (tamper && c === 0) {
						v = v.slice();
						v[0] ^= 1; // the forger flips one bit
					}
					const row: Uint8Array[] = [];
					row[d] = v;
					for (let p = d + 1; p < POSITIONS; p++) row[p] = keccak_256(row[p - 1]);
					return row;
				})
			: null;
	const rebuilt = seen && keccak_256(concat(seen.map((row) => row[POSITIONS - 1])));
	const ok = !!(rebuilt && publicKey && rebuilt.every((b, i) => b === publicKey[i]));

	return (
		<figure className="lamport-panel chain-panel not-content">
			<div className="lp-head">
				<strong>A public key of one hash</strong>
				<span className="lp-label">real Keccak-256 · 4 chains · target 6</span>
			</div>

			<div className="lp-controls">
				<div className="lp-field cp-text">
					<label className="lp-label" htmlFor="lf-msg">
						Message to sign
					</label>
					<input
						id="lf-msg"
						type="text"
						value={message}
						onChange={(e) => {
							setMessage(e.target.value);
							setSigned(null);
						}}
					/>
				</div>
				<button type="button" className="lp-primary" onClick={sign}>
					Sign it
				</button>
				<button
					type="button"
					className="lp-ghost"
					onClick={() => {
						setChains([0, 1, 2, 3].map(newChain));
						setSigned(null);
					}}
				>
					New key
				</button>
			</div>

			<GrindSteps message={message} signed={signed} />

			<p className="lp-status">
				{signed
					? `The signature reveals ${signed.digits.map((d) => `x${d}`).join(', ')} on chains 0 to 3.`
					: 'Only the public key is published. Sign the message to see the verifier at work.'}
			</p>

			<div className="lp-gridwrap">
				<div className="cp-grid">
					<div />
					{Array.from({ length: POSITIONS }, (_, p) => (
						<div key={p} className="lp-hd">
							x{p}
							{p === POSITIONS - 1 ? ' = end' : ''}
						</div>
					))}
					{[0, 1, 2, 3].map((c) => (
						<React.Fragment key={c}>
							<div className="lp-rl">chain {c}</div>
							{Array.from({ length: POSITIONS }, (_, p) => {
								const d = signed?.digits[c];
								const v = seen?.[c][p];
								const bad = tamper && c === 0 && v !== undefined;
								const state =
									d === undefined || p < d ? 'st-hidden' : bad ? 'st-bad' : p === d ? 'st-rev' : 'st-calc';
								return (
									<div key={p} className={`cp-cell ${state}`}>
										{state === 'st-hidden' ? 'hidden' : short(v)}
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
				{tamper && (
					<span>
						<i className="k-bad" />
						changed by the forger
					</span>
				)}
			</div>

			<div className="cp-compare">
				<div className={`cp-box${rebuilt ? (ok ? ' ok' : ' bad') : ''}`}>
					<span className="lp-label">Rebuilt by the verifier</span>
					<code>hash(end0 ‖ end1 ‖ end2 ‖ end3)</code>
					<b>{rebuilt ? short(rebuilt) : '…'}</b>
				</div>
				<span className="cp-eq" aria-hidden="true">
					{rebuilt ? (ok ? '=' : '≠') : '?'}
				</span>
				<div className="cp-box">
					<span className="lp-label">Public key</span>
					<code>published once</code>
					<b>{short(publicKey)}</b>
				</div>
			</div>

			<label className="cp-check">
				<input type="checkbox" checked={tamper} onChange={(e) => setTamper(e.target.checked)} />
				Let a forger flip one bit of the value revealed on chain 0
			</label>

			{signed && (
				<div className={`lp-verdict ${ok ? 'safe' : 'bad'}`} aria-live="polite">
					<strong>{ok ? 'Valid signature' : 'Invalid signature'}</strong>
					<span>
						{ok
							? 'The verifier rebuilt every end from the signature, and their hash is the public key.'
							: 'One flipped bit changes every value after it on chain 0, so end0 changes, and so does the hash of the ends.'}
					</span>
				</div>
			)}
		</figure>
	);
}
