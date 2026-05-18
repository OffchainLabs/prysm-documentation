/**
 * How PQ Gasper aggregates attestations without aggregatable signatures:
 * validators send their own leanXMSS signatures, each committee's aggregator
 * proves them with a STARK, the proposer merges those proofs into one, and
 * every node checks that single proof.
 */
import React, { useId } from 'react';
import './AggregationFlow.css';

const V = { x: 16, w: 132, h: 30 };
const A = { x: 250, w: 190, h: 64 };
const P = { x: 530, w: 160, h: 76 };
const N = { x: 770, w: 120, h: 76 };
const COMMITTEES = [
	{ y: 14, agg: 34 },
	{ y: 164, agg: 184 },
];
const PY = 112;

export default function AggregationFlow() {
	const id = `af-${useId().replace(/[^\w-]/g, '')}`;
	const arrow = `url(#${id}-arrow)`;
	return (
		<figure className="agg-flow not-content">
			<svg viewBox="0 0 900 290" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
				<title id={`${id}-title`}>From individual signatures to one proof per block</title>
				<desc id={`${id}-desc`}>
					Each validator sends its own 2,404-byte signature. The aggregator of each committee proves its committee's
					signatures with one STARK proof. The proposer merges the aggregators' proofs into one proof for the block, and
					every node checks that single proof.
				</desc>
				<defs>
					<marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
						<path d="M0 0 10 5 0 10z" className="af-arrowhead" />
					</marker>
				</defs>

				{COMMITTEES.map((c, ci) => (
					<g key={ci}>
						{[0, 1, 2].map((r) => {
							const y = c.y + r * 38;
							return (
								<g key={r}>
									<g className="af-node">
										<rect x={V.x} y={y} width={V.w} height={V.h} rx="7" />
										<text x={V.x + V.w / 2} y={y + V.h / 2 + 4}>
											validator
										</text>
									</g>
									<path
										className="af-link"
										d={`M${V.x + V.w + 2} ${y + V.h / 2} C ${V.x + V.w + 50} ${y + V.h / 2}, ${A.x - 50} ${c.agg + A.h / 2}, ${A.x - 3} ${c.agg + A.h / 2}`}
										fill="none"
										markerEnd={arrow}
									/>
								</g>
							);
						})}
						<text className="af-note" x={V.x + V.w + 50} y={c.y + 38 * 3 + 2}>
							2,404-byte signatures
						</text>
						<g className="af-node af-op">
							<rect x={A.x} y={c.agg} width={A.w} height={A.h} rx="10" />
							<text className="af-title" x={A.x + A.w / 2} y={c.agg + 24}>
								Aggregator {ci === 0 ? 'A' : 'B'}
							</text>
							<text className="af-sub" x={A.x + A.w / 2} y={c.agg + 44}>
								proves its committee
							</text>
						</g>
						<path
							className="af-link"
							d={`M${A.x + A.w + 2} ${c.agg + A.h / 2} C ${A.x + A.w + 50} ${c.agg + A.h / 2}, ${P.x - 50} ${PY + P.h / 2}, ${P.x - 3} ${PY + P.h / 2}`}
							fill="none"
							markerEnd={arrow}
						/>
					</g>
				))}
				<text className="af-dots" x={V.x + V.w / 2} y="143">
					⋮
				</text>
				<text className="af-dots" x={A.x + A.w / 2} y="152">
					⋮
				</text>
				<text className="af-note" x={(A.x + A.w + P.x) / 2} y="104">
					one proof each
				</text>

				<g className="af-node af-op">
					<rect x={P.x} y={PY} width={P.w} height={P.h} rx="10" />
					<text className="af-title" x={P.x + P.w / 2} y={PY + 26}>
						Proposer
					</text>
					<text className="af-sub" x={P.x + P.w / 2} y={PY + 46}>
						merges the proofs
					</text>
					<text className="af-sub" x={P.x + P.w / 2} y={PY + 62}>
						into one
					</text>
				</g>
				<line className="af-link" x1={P.x + P.w + 2} y1={PY + P.h / 2} x2={N.x - 3} y2={PY + P.h / 2} markerEnd={arrow} />
				<text className="af-note" x={(P.x + P.w + N.x) / 2} y={PY + P.h / 2 - 10}>
					block
				</text>
				<text className="af-note" x={(P.x + P.w + N.x) / 2} y={PY + P.h / 2 + 22}>
					+ one proof
				</text>

				<g className="af-node af-pk">
					<rect x={N.x} y={PY} width={N.w} height={N.h} rx="10" />
					<text className="af-title" x={N.x + N.w / 2} y={PY + 26}>
						Every node
					</text>
					<text className="af-sub" x={N.x + N.w / 2} y={PY + 46}>
						checks one
					</text>
					<text className="af-sub" x={N.x + N.w / 2} y={PY + 62}>
						proof
					</text>
				</g>
			</svg>
		</figure>
	);
}
