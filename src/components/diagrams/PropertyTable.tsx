/**
 * Which mandatory properties each step of the signatures page meets. Rows are
 * the properties, columns the steps so far; `upTo` is how many steps to show,
 * and the last one shown is highlighted as the current step.
 */
import React, { useEffect, useRef } from 'react';
import './PropertyTable.css';

const PROPERTIES = [
	'Keys that are practical to create and store',
	'Small public keys',
	'Small signatures',
	'One public key for a whole life',
	'Fast, predictable verification',
	'Aggregation',
	'Secure against quantum computers',
];

// For each step, the property numbers it meets.
const STEPS = [
	{ title: 'BLS signatures', anchor: 'bls-signatures', meets: [1, 2, 3, 4, 5, 6] },
	{ title: 'Lamport signatures', anchor: 'lamport-signatures', meets: [1, 5, 7] },
	{ title: 'Hash chains', anchor: 'hash-chains', meets: [1, 7] },
	{ title: 'A fixed sum', anchor: 'a-fixed-sum', meets: [1, 5, 7] },
	{ title: 'One hash for the public key', anchor: 'one-hash-for-the-public-key', meets: [1, 2, 5, 7] },
	{ title: 'A tree of one-time keys', anchor: 'a-tree-of-one-time-keys', meets: [2, 4, 5, 7] },
	{ title: 'A top tree and bottom trees', anchor: 'a-top-tree-and-bottom-trees', meets: [1, 2, 4, 5, 7] },
	{ title: 'Shorter hashes and fewer chains', anchor: 'shorter-hashes-and-fewer-chains', meets: [1, 2, 3, 4, 5, 7] },
	{ title: 'Labels on every hash', anchor: 'labels-on-every-hash', meets: [1, 2, 3, 4, 5, 7] },
	{ title: 'One seed for every secret', anchor: 'one-seed-for-every-secret', meets: [1, 2, 3, 4, 5, 7] },
	{ title: 'One proof for many signatures', anchor: 'one-proof-for-many-signatures', meets: [1, 2, 3, 4, 5, 6, 7] },
];

export default function PropertyTable({ upTo }: { upTo: number }) {
	const steps = STEPS.slice(0, upTo);
	const current = steps.length - 1;
	const wrap = useRef<HTMLDivElement>(null);
	// Start scrolled to the right, so the newest steps are in view.
	useEffect(() => {
		if (wrap.current) wrap.current.scrollLeft = wrap.current.scrollWidth;
	}, []);
	return (
		<div className="property-table-wrap" ref={wrap}>
			<table className="property-table">
				<thead>
					<tr>
						<th>Property</th>
						{steps.map((s, i) => (
							<th key={s.anchor} className={i === current ? 'pt-current' : undefined}>
								<a href={`#${s.anchor}`}>{s.title}</a>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{PROPERTIES.map((p, n) => (
						<tr key={p}>
							<td>
								#{n + 1} - {p}
							</td>
							{steps.map((s, i) => {
								const ok = s.meets.includes(n + 1);
								return (
									<td key={s.anchor} className={`pt-mark${i === current ? ' pt-current' : ''}`}>
										<span aria-label={ok ? 'yes' : 'no'}>{ok ? '✅' : '❌'}</span>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
