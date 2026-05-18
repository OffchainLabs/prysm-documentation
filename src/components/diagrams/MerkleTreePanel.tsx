/**
 * A Merkle tree of 8 one-time keys, with real Keccak-256. Each leaf is the
 * hash of a one-time key's 4 chain ends; each parent is hash(left ‖ right);
 * the root is the public key. The reader picks a leaf and follows the verifier
 * climbing its path to the root, then lets a forger swap in a leaf of their own.
 */
import React, { useEffect, useState } from 'react';
import { keccak_256 } from '@noble/hashes/sha3';
import './LamportPanel.css';
import './HashChainPanel.css';
import './MerkleTreePanel.css';

const LEAVES = 8;
const LEVELS = 3; // 8 → 4 → 2 → 1

const short = (b?: Uint8Array) =>
	b ? `0x${Array.from(b.slice(0, 3), (x) => x.toString(16).padStart(2, '0')).join('')}…` : '…';

const concat = (...parts: Uint8Array[]) => {
	const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
};

const random32 = () => crypto.getRandomValues(new Uint8Array(32));

/** A one-time key's leaf: the hash of the ends of 4 chains of 4 positions. */
function newLeaf(): Uint8Array {
	const ends = [0, 1, 2, 3].map(() => {
		let v: Uint8Array = random32();
		for (let p = 1; p < 4; p++) v = keccak_256(v);
		return v;
	});
	return keccak_256(concat(...ends));
}

/** levels[0] = the leaves, levels[LEVELS] = [root]. */
function buildTree(leaves: Uint8Array[]): Uint8Array[][] {
	const levels = [leaves];
	for (let l = 0; l < LEVELS; l++) {
		const below = levels[l];
		levels.push(Array.from({ length: below.length / 2 }, (_, j) => keccak_256(concat(below[2 * j], below[2 * j + 1]))));
	}
	return levels;
}

const same = (a?: Uint8Array, b?: Uint8Array) => !!a && !!b && a.length === b.length && a.every((x, i) => x === b[i]);

// Layout, in SVG units.
const W = 86;
const H = 46;
const STEP = 98;
const ROW_Y = [256, 176, 96, 16]; // leaves, level 1, level 2, root
const centerX = (level: number, j: number) => {
	const span = STEP * 2 ** level;
	return 10 + j * span + (span - (STEP - W)) / 2;
};

export default function MerkleTreePanel() {
	const [leaves, setLeaves] = useState<Uint8Array[]>();
	const [index, setIndex] = useState(5);
	const [fake, setFake] = useState<Uint8Array | null>(null);
	useEffect(() => setLeaves(Array.from({ length: LEAVES }, newLeaf)), []);

	const tree = leaves && buildTree(leaves);
	const root = tree?.[LEVELS][0];

	// The climb: the node on our path at each level, its sibling, and the bit that says left or right.
	const climb: { node: Uint8Array; sibling: Uint8Array; bit: number; parent: Uint8Array }[] = [];
	if (tree) {
		let node = fake ?? tree[0][index];
		for (let l = 0; l < LEVELS; l++) {
			const j = index >> l;
			const bit = j & 1;
			const sibling = tree[l][j ^ 1];
			const parent = keccak_256(bit ? concat(sibling, node) : concat(node, sibling));
			climb.push({ node, sibling, bit, parent });
			node = parent;
		}
	}
	const top = climb[LEVELS - 1]?.parent;
	const ok = same(top, root);

	const roleOf = (level: number, j: number) => {
		const mine = index >> level;
		if (j === mine) return level === 0 ? 'mt-leaf' : 'mt-calc';
		if (level < LEVELS && j === (mine ^ 1)) return 'mt-sib';
		return '';
	};
	const valueOf = (level: number, j: number): Uint8Array | undefined => {
		if (!tree) return undefined;
		if (j === index >> level) return level === 0 ? climb[0]?.node : climb[level - 1]?.parent;
		return tree[level][j];
	};

	const bits = index.toString(2).padStart(LEVELS, '0');

	return (
		<figure className="lamport-panel chain-panel merkle-panel not-content">
			<div className="lp-head">
				<strong>A tree of 8 one-time keys</strong>
				<span className="lp-label">real Keccak-256 · values shortened</span>
			</div>

			<div className="lp-controls">
				<div className="lp-field">
					<span className="lp-label">Leaf that signs (click a leaf or a button)</span>
					<div className="lp-bits" role="group" aria-label="Leaf index">
						{Array.from({ length: LEAVES }, (_, i) => (
							<button key={i} type="button" aria-pressed={i === index} onClick={() => setIndex(i)}>
								{i}
							</button>
						))}
					</div>
				</div>
				<button
					type="button"
					className="lp-ghost"
					onClick={() => {
						setLeaves(Array.from({ length: LEAVES }, newLeaf));
						setFake(null);
					}}
				>
					New keys
				</button>
			</div>

			<div className="lp-gridwrap">
				<svg className="mt-svg" viewBox="0 0 804 336" role="img" aria-label="A Merkle tree of 8 leaves">
					{[0, 1, 2].map((level) =>
						Array.from({ length: LEAVES >> (level + 1) }, (_, j) =>
							[0, 1].map((side) => {
								const child = 2 * j + side;
								const onPath = child === index >> level;
								return (
									<line
										key={`${level}-${child}`}
										className={`mt-edge${onPath ? ' mt-up' : ''}`}
										x1={centerX(level, child)}
										y1={ROW_Y[level]}
										x2={centerX(level + 1, j)}
										y2={ROW_Y[level + 1] + H}
									/>
								);
							}),
						),
					)}
					{[0, 1, 2, 3].map((level) =>
						Array.from({ length: LEAVES >> level }, (_, j) => {
							const role = roleOf(level, j);
							const bad = !!fake && (role === 'mt-leaf' || role === 'mt-calc');
							const cx = centerX(level, j);
							const label = level === 0 ? `leaf ${j}` : level === LEVELS ? 'root' : '';
							return (
								<g
									key={`${level}-${j}`}
									className={`mt-node ${role}${bad ? ' mt-bad' : ''}${level === 0 ? ' mt-click' : ''}`}
									onClick={level === 0 ? () => setIndex(j) : undefined}
								>
									<rect x={cx - W / 2} y={ROW_Y[level]} width={W} height={H} rx="8" />
									{label && (
										<text className="mt-name" x={cx} y={ROW_Y[level] + 18}>
											{label}
										</text>
									)}
									<text x={cx} y={ROW_Y[level] + (label ? 36 : 28)}>
										{short(valueOf(level, j))}
									</text>
								</g>
							);
						}),
					)}
					{Array.from({ length: LEAVES }, (_, j) => (
						<text key={j} className="mt-key" x={centerX(0, j)} y={ROW_Y[0] + H + 22}>
							key {j}
						</text>
					))}
				</svg>
			</div>

			<div className="lp-legend">
				<span>
					<i className="k-rev" />
					leaf rebuilt from the one-time signature
				</span>
				<span>
					<i className="k-sib" />
					path: siblings carried in the signature
				</span>
				<span>
					<i className="k-calc" />
					computed by the verifier
				</span>
				{fake && (
					<span>
						<i className="k-bad" />
						from the forger's leaf
					</span>
				)}
			</div>

			<ol className="cp-path" aria-label="The verifier climbs from the leaf to the root">
				<li>
					<span className="lp-label">
						Leaf index {index} = {bits} in binary
					</span>
					<code>
						Read from the right, one bit per level: 0 means the node is on the left, 1 on the right.
					</code>
				</li>
				{climb.map((s, l) => (
					<li key={l}>
						<span className="lp-label">
							Level {l + 1}: bit {s.bit}, the node is on the {s.bit ? 'right' : 'left'}
						</span>
						<code>
							hash({s.bit ? `${short(s.sibling)} ‖ ${short(s.node)}` : `${short(s.node)} ‖ ${short(s.sibling)}`}) ={' '}
							{short(s.parent)}
						</code>
					</li>
				))}
			</ol>

			<div className="cp-compare">
				<div className={`cp-box${top ? (ok ? ' ok' : ' bad') : ''}`}>
					<span className="lp-label">Reached by the verifier</span>
					<code>from leaf {index} and its path</code>
					<b>{short(top)}</b>
				</div>
				<span className="cp-eq" aria-hidden="true">
					{top ? (ok ? '=' : '≠') : '?'}
				</span>
				<div className="cp-box">
					<span className="lp-label">Public key</span>
					<code>the root, published once</code>
					<b>{short(root)}</b>
				</div>
			</div>

			<label className="cp-check">
				<input
					type="checkbox"
					checked={!!fake}
					onChange={(e) => setFake(e.target.checked ? newLeaf() : null)}
				/>
				Let a forger sign with a one-time key of their own, in place of leaf {index}
			</label>

			<div className={`lp-verdict ${ok ? 'safe' : 'bad'}`} aria-live="polite">
				<strong>{ok ? 'Valid signature' : 'Invalid signature'}</strong>
				<span>
					{ok
						? `Leaf ${index} and its ${LEVELS} siblings climb to the root, so this one-time key belongs to the validator.`
						: "The forger's leaf changes every node on the way up, so the climb ends somewhere other than the root."}
				</span>
			</div>
		</figure>
	);
}
