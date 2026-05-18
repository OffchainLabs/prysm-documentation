/**
 * Two layers of trees: the top tree's root is the public key, top key b signs
 * the root R_b of bottom tree b, and bottom key k of tree b signs the message.
 */
import React, { useId } from 'react';
import './TwoLayerDiagram.css';

const CX = 430;
const BASE = { left: 130, right: 730 };
// Keys along a tree's base: x center, label, highlighted or not. `null` label = dots.
const KEYS: { x: number; label: string | null; on?: boolean }[] = [
	{ x: 180, label: 'key 0' },
	{ x: 280, label: 'key 1' },
	{ x: 355, label: null },
	{ x: 430, label: 'key b', on: true },
	{ x: 505, label: null },
	{ x: 610, label: 'key 65,535' },
];
const KEY_W = 84;
const KEY_H = 32;

function Layer({ apexY, baseY, name, k, note }: { apexY: number; baseY: number; name: string; k: string; note: string[] }) {
	return (
		<g>
			<polygon className="tl-tree" points={`${CX},${apexY} ${BASE.left},${baseY} ${BASE.right},${baseY}`} />
			<text className="tl-tree-name" x={CX} y={baseY - 18}>
				{name}
			</text>
			{KEYS.map((key) =>
				key.label === null ? (
					<text key={key.x} className="tl-dots" x={key.x} y={baseY + 6 + KEY_H / 2 + 4}>
						…
					</text>
				) : (
					<g key={key.x} className={`tl-node${key.on ? ' tl-on' : ''}`}>
						<rect x={key.x - KEY_W / 2} y={baseY + 6} width={key.label.length > 6 ? KEY_W + 16 : KEY_W} height={KEY_H} rx="7" />
						<text x={key.x + (key.label.length > 6 ? 8 : 0)} y={baseY + 6 + KEY_H / 2 + 4}>
							{key.on ? `key ${k}` : key.label}
						</text>
					</g>
				),
			)}
			{note.map((line, i) => (
				<text key={i} className="tl-note" x={BASE.right + 12} y={apexY + 40 + i * 16}>
					{line}
				</text>
			))}
		</g>
	);
}

function Box({ y, h, w, title, sub, strong }: { y: number; h: number; w: number; title: React.ReactNode; sub?: string; strong?: boolean }) {
	return (
		<g className={`tl-node tl-box${strong ? ' tl-pk' : ''}`}>
			<rect x={CX - w / 2} y={y} width={w} height={h} rx="10" />
			<text className="tl-title" x={CX} y={sub ? y + 19 : y + h / 2 + 5}>
				{title}
			</text>
			{sub && (
				<text className="tl-sub" x={CX} y={y + 36}>
					{sub}
				</text>
			)}
		</g>
	);
}

export default function TwoLayerDiagram() {
	const id = `tl-${useId().replace(/[^\w-]/g, '')}`;
	const arrow = `url(#${id}-arrow)`;
	const Rb = (
		<>
			R<tspan baselineShift="sub" fontSize="10">b</tspan>
		</>
	);
	return (
		<figure className="two-layer not-content">
			<svg viewBox="0 0 900 500" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
				<title id={`${id}-title`}>A top tree and bottom trees</title>
				<desc id={`${id}-desc`}>
					The public key is the root of the top tree, which holds 65,536 top keys. Top key b signs R_b, the root of
					bottom tree b. Bottom tree b holds 65,536 bottom keys, and bottom key k signs the message.
				</desc>
				<defs>
					<marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
						<path d="M0 0 10 5 0 10z" className="tl-arrowhead" />
					</marker>
				</defs>

				<Box y={6} h={46} w={190} title="Public key" sub="root of the top tree" strong />
				<Layer apexY={52} baseY={150} name="top tree" k="b" note={['2¹⁶ top keys', 'built when the key', 'is created']} />

				<line className="tl-sign" x1={CX} y1={190} x2={CX} y2={226} markerEnd={arrow} />
				<text className="tl-sign-label" x={CX + 10} y={212}>
					signs
				</text>

				<Box y={228} h={46} w={190} title={Rb} sub="root of bottom tree b" />
				<Layer apexY={274} baseY={372} name="bottom tree b" k="k" note={['2¹⁶ bottom keys', 'built when first', 'needed']} />

				<line className="tl-sign" x1={CX} y1={412} x2={CX} y2={448} markerEnd={arrow} />
				<text className="tl-sign-label" x={CX + 10} y={434}>
					signs
				</text>

				<Box y={450} h={40} w={150} title="message" />
			</svg>
		</figure>
	);
}
