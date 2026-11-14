/**
 * The public key of a one-time key: every chain runs x0 → x1 → x2 → x3, and
 * the ends of all the chains are hashed together into a single 32-byte value.
 */
import React, { useId } from 'react';
import './ChainEndsDiagram.css';

const NODE_W = 58;
const NODE_H = 30;
const COLS = [96, 176, 256, 336]; // x of x0..x3
const ROWS = [
	{ y: 22, label: 'chain 0', end: 'end0' },
	{ y: 74, label: 'chain 1', end: 'end1' },
	{ y: 166, label: 'chain 127', end: 'end127' },
];
const HASH = { x: 448, y: 76, w: 244, h: 44 };
const PK = { x: 726, y: 70, w: 120, h: 56 };

export default function ChainEndsDiagram() {
	const id = `ce-${useId().replace(/[^\w-]/g, '')}`;
	const arrow = `url(#${id}-arrow)`;
	const midY = HASH.y + HASH.h / 2;
	return (
		<figure className="chain-ends not-content">
			<svg viewBox="0 0 860 214" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
				<title id={`${id}-title`}>One hash of all the chain ends is the public key</title>
				<desc id={`${id}-desc`}>
					Each of the 128 chains starts from a secret x0 and is hashed three times, to x1, x2 and x3. The last value of
					each chain is its end. The 128 ends are put end to end and hashed together. That single 32-byte hash is the
					public key.
				</desc>
				<defs>
					<marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
						<path d="M0 0 10 5 0 10z" className="ce-arrowhead" />
					</marker>
				</defs>

				{ROWS.map((r) => (
					<g key={r.label}>
						<text className="ce-label" x="10" y={r.y + NODE_H / 2 + 4}>
							{r.label}
						</text>
						{COLS.map((x, p) => (
							<g key={p} className={`ce-node${p === 0 ? ' ce-secret' : ''}${p === 3 ? ' ce-end' : ''}`}>
								<rect x={x} y={r.y} width={NODE_W} height={NODE_H} rx="7" />
								<text x={x + NODE_W / 2} y={r.y + NODE_H / 2 + 4}>
									x{p}
								</text>
							</g>
						))}
						{COLS.slice(1).map((x, p) => (
							<line
								key={p}
								className="ce-link"
								x1={COLS[p] + NODE_W + 2}
								y1={r.y + NODE_H / 2}
								x2={x - 3}
								y2={r.y + NODE_H / 2}
								markerEnd={arrow}
							/>
						))}
						<text className="ce-note" x={COLS[3] + NODE_W / 2} y={r.y + NODE_H + 13}>
							{r.end}
						</text>
						<path
							className="ce-link"
							d={`M${COLS[3] + NODE_W + 2} ${r.y + NODE_H / 2} C ${COLS[3] + NODE_W + 50} ${r.y + NODE_H / 2}, ${HASH.x - 50} ${midY}, ${HASH.x - 3} ${midY}`}
							fill="none"
							markerEnd={arrow}
						/>
					</g>
				))}

				<text className="ce-dots" x={COLS[1] + NODE_W / 2 + 40} y="136">
					⋮ 125 more chains
				</text>

				<g className="ce-node ce-op">
					<rect x={HASH.x} y={HASH.y} width={HASH.w} height={HASH.h} rx="10" />
					<text x={HASH.x + HASH.w / 2} y={midY + 5}>
						hash(end0 ‖ end1 ‖ … ‖ end127)
					</text>
				</g>
				<line
					className="ce-link"
					x1={HASH.x + HASH.w + 2}
					y1={midY}
					x2={PK.x - 3}
					y2={midY}
					markerEnd={arrow}
				/>
				<g className="ce-node ce-pk">
					<rect x={PK.x} y={PK.y} width={PK.w} height={PK.h} rx="10" />
					<text className="ce-title" x={PK.x + PK.w / 2} y={PK.y + 24}>
						Public key
					</text>
					<text className="ce-sub" x={PK.x + PK.w / 2} y={PK.y + 42}>
						32 bytes
					</text>
				</g>
			</svg>
		</figure>
	);
}
