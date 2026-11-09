/**
 * Diagrams of the supported Prysm topologies, in the house style of StackDiagram.
 * Usage: <TopologyDiagram variant="single" /> with variant one of
 * "single", "beacon-only", "multi-vc", "multi-vc-several-bn", "remote-signer", "several-bn-rest", "several-bn-grpc".
 */
import React, { useId } from 'react';
import './TopologyDiagram.css';

export interface Props {
	variant: 'single' | 'beacon-only' | 'multi-vc' | 'multi-vc-several-bn' | 'remote-signer' | 'several-bn-rest' | 'several-bn-grpc';
}

type Box = { x: number; y: number; w: number; h: number; title: string; sub?: string; kind?: 'prysm' | 'other' | 'optional' | 'store' };
type Link = { x1: number; y1: number; x2: number; y2: number; both?: boolean; dashed?: boolean };
type Label = { x: number; y: number; text: string; muted?: boolean; anchor?: 'start' | 'middle' | 'end' };
type Group = { x: number; y: number; w: number; h: number; label: string };
type Diagram = { title: string; desc: string; height: number; groups: Group[]; boxes: Box[]; links: Link[]; labels: Label[] };

const diagrams: Record<Props['variant'], Diagram> = {
	single: {
		title: 'Execution client, beacon node and validator client on one machine',
		desc: 'One machine runs the execution client, the Prysm beacon node and one Prysm validator client. The beacon node talks to the execution client over the Engine API on port 8551 with a JWT secret. The validator client talks to the beacon node on localhost.',
		height: 250,
		groups: [{ x: 10, y: 10, w: 700, h: 230, label: 'One machine' }],
		boxes: [
			{ x: 460, y: 60, w: 220, h: 76, title: 'Execution client', sub: 'Geth, Nethermind, Besu…' },
			{ x: 40, y: 60, w: 220, h: 76, title: 'Beacon node', sub: 'Prysm', kind: 'prysm' },
			{ x: 40, y: 170, w: 220, h: 56, title: 'Validator client', sub: 'Prysm, local keys', kind: 'prysm' },
		],
		links: [
			{ x1: 264, y1: 98, x2: 456, y2: 98, both: true },
			{ x1: 150, y1: 168, x2: 150, y2: 139 },
		],
		labels: [
			{ x: 360, y: 88, text: 'Engine API' },
			{ x: 360, y: 118, text: 'localhost:8551, JWT', muted: true },
			{ x: 162, y: 158, text: 'localhost:4000 or :3500', muted: true, anchor: 'start' },
		],
	},
	'beacon-only': {
		title: 'Beacon node serving applications',
		desc: 'The execution client and the Prysm beacon node run together on the node host. The beacon node talks to the execution client over the Engine API, and your applications read chain data from the beacon node over the Beacon API.',
		height: 150,
		groups: [{ x: 10, y: 10, w: 490, h: 130, label: 'Node host' }],
		boxes: [
			{ x: 30, y: 50, w: 180, h: 76, title: 'Execution client', sub: 'Geth, Nethermind…' },
			{ x: 300, y: 50, w: 180, h: 76, title: 'Beacon node', sub: 'Prysm, port 3500', kind: 'prysm' },
			{ x: 564, y: 50, w: 146, h: 76, title: 'Your apps', sub: 'indexers, dashboards…', kind: 'optional' },
		],
		links: [
			{ x1: 214, y1: 96, x2: 296, y2: 96, both: true },
			{ x1: 484, y1: 96, x2: 560, y2: 96, both: true },
		],
		labels: [
			{ x: 255, y: 84, text: 'Engine API', muted: true },
			{ x: 522, y: 84, text: 'Beacon API', muted: true },
		],
	},
	'multi-vc': {
		title: 'Several validator clients sharing one beacon node',
		desc: 'One execution client and one Prysm beacon node serve three Prysm validator clients. Each validator client has its own wallet, data directory, ports and fee recipient, and its own set of keys. No key is loaded in more than one validator client.',
		height: 300,
		groups: [],
		boxes: [
			{ x: 490, y: 30, w: 200, h: 76, title: 'Execution client', sub: 'Geth, Nethermind…' },
			{ x: 230, y: 30, w: 190, h: 76, title: 'Beacon node', sub: 'Prysm', kind: 'prysm' },
			{ x: 30, y: 170, w: 200, h: 76, title: 'Validator client A', sub: 'keys A', kind: 'prysm' },
			{ x: 260, y: 170, w: 200, h: 76, title: 'Validator client B', sub: 'keys B', kind: 'prysm' },
			{ x: 490, y: 170, w: 200, h: 76, title: 'Validator client C', sub: 'keys C', kind: 'prysm' },
		],
		links: [
			{ x1: 424, y1: 68, x2: 486, y2: 68, both: true },
			{ x1: 130, y1: 168, x2: 280, y2: 109 },
			{ x1: 360, y1: 168, x2: 360, y2: 109 },
			{ x1: 590, y1: 168, x2: 400, y2: 109 },
		],
		labels: [
			{ x: 455, y: 56, text: 'Engine', muted: true },
			{ x: 360, y: 280, text: 'Every validator key is loaded in exactly one validator client', muted: true },
		],
	},
	'remote-signer': {
		title: 'Validator client with Web3Signer as remote signer',
		desc: 'The Prysm validator client gets duties from the beacon node, but holds no private keys. For every signature it sends a signing request over HTTP to Web3Signer, which holds the keys, checks its own slashing protection database in PostgreSQL, and returns the signature.',
		height: 280,
		groups: [],
		boxes: [
			{ x: 20, y: 30, w: 180, h: 76, title: 'Execution client' },
			{ x: 260, y: 30, w: 180, h: 76, title: 'Beacon node', sub: 'Prysm', kind: 'prysm' },
			{ x: 260, y: 180, w: 180, h: 76, title: 'Validator client', sub: 'Prysm, no private keys', kind: 'prysm' },
			{ x: 530, y: 180, w: 170, h: 76, title: 'Web3Signer', sub: 'holds the keys, :9000' },
			{ x: 530, y: 30, w: 170, h: 76, title: 'PostgreSQL', sub: 'slashing protection', kind: 'store' },
		],
		links: [
			{ x1: 204, y1: 68, x2: 256, y2: 68, both: true },
			{ x1: 350, y1: 178, x2: 350, y2: 109 },
			{ x1: 444, y1: 218, x2: 526, y2: 218, both: true },
			{ x1: 615, y1: 178, x2: 615, y2: 109, both: true },
		],
		labels: [
			{ x: 230, y: 56, text: 'Engine', muted: true },
			{ x: 362, y: 148, text: 'duties, blocks', muted: true, anchor: 'start' },
			{ x: 485, y: 206, text: 'sign', muted: true },
			{ x: 603, y: 148, text: 'check and record', muted: true, anchor: 'end' },
		],
	},
	'several-bn-rest': {
		title: 'One validator client using two beacon nodes over the Beacon API',
		desc: 'The validator client is connected to two beacon nodes on port 3500 and uses both at the same time (active-active).',
		height: 250,
		groups: [{ x: 10, y: 10, w: 700, h: 230, label: 'Beacon API: active-active' }],
		boxes: [
			{ x: 150, y: 50, w: 160, h: 60, title: 'Beacon node 1', sub: 'port 3500', kind: 'prysm' },
			{ x: 410, y: 50, w: 160, h: 60, title: 'Beacon node 2', sub: 'port 3500', kind: 'prysm' },
			{ x: 285, y: 165, w: 150, h: 60, title: 'Validator client', kind: 'prysm' },
		],
		links: [
			{ x1: 330, y1: 161, x2: 240, y2: 112 },
			{ x1: 390, y1: 161, x2: 480, y2: 112 },
		],
		labels: [
			{ x: 272, y: 140, text: 'in use', muted: true, anchor: 'end' },
			{ x: 448, y: 140, text: 'in use', muted: true, anchor: 'start' },
		],
	},
	'several-bn-grpc': {
		title: 'One validator client connected to two beacon nodes over gRPC',
		desc: 'The validator client is connected to two beacon nodes on port 4000 but uses only the first one; the second is a standby it switches to if the first stops being healthy (active-passive).',
		height: 250,
		groups: [{ x: 10, y: 10, w: 700, h: 230, label: 'gRPC: active-passive' }],
		boxes: [
			{ x: 150, y: 50, w: 160, h: 60, title: 'Beacon node 1', sub: 'port 4000', kind: 'prysm' },
			{ x: 410, y: 50, w: 160, h: 60, title: 'Beacon node 2', sub: 'port 4000', kind: 'prysm' },
			{ x: 285, y: 165, w: 150, h: 60, title: 'Validator client', kind: 'prysm' },
		],
		links: [
			{ x1: 330, y1: 161, x2: 240, y2: 112 },
			{ x1: 390, y1: 161, x2: 480, y2: 112, dashed: true },
		],
		labels: [
			{ x: 272, y: 140, text: 'in use', muted: true, anchor: 'end' },
			{ x: 448, y: 140, text: 'standby', muted: true, anchor: 'start' },
		],
	},
	'multi-vc-several-bn': {
		title: 'Several validator clients sharing two beacon nodes',
		desc: 'Three Prysm validator clients are each connected to the same two Prysm beacon nodes. Each validator client has its own wallet, data directory and ports, and its own set of keys. No key is loaded in more than one validator client.',
		height: 290,
		groups: [],
		boxes: [
			{ x: 150, y: 30, w: 160, h: 60, title: 'Beacon node 1', kind: 'prysm' },
			{ x: 410, y: 30, w: 160, h: 60, title: 'Beacon node 2', kind: 'prysm' },
			{ x: 30, y: 165, w: 200, h: 70, title: 'Validator client A', sub: 'keys A', kind: 'prysm' },
			{ x: 260, y: 165, w: 200, h: 70, title: 'Validator client B', sub: 'keys B', kind: 'prysm' },
			{ x: 490, y: 165, w: 200, h: 70, title: 'Validator client C', sub: 'keys C', kind: 'prysm' },
		],
		links: [
			{ x1: 110, y1: 161, x2: 190, y2: 92 },
			{ x1: 150, y1: 161, x2: 430, y2: 92 },
			{ x1: 340, y1: 161, x2: 230, y2: 92 },
			{ x1: 380, y1: 161, x2: 470, y2: 92 },
			{ x1: 570, y1: 161, x2: 270, y2: 92 },
			{ x1: 610, y1: 161, x2: 510, y2: 92 },
		],
		labels: [{ x: 360, y: 270, text: 'Every validator key is loaded in exactly one validator client', muted: true }],
	},
};

export default function TopologyDiagram({ variant }: Props) {
	const d = diagrams[variant];
	const id = `topo-${variant}-${useId().replace(/[^\w-]/g, '')}`;
	const arrow = `url(#${id}-arrow)`;
	return (
		<figure className="topo not-content">
			<svg viewBox={`0 0 720 ${d.height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
				<title id={`${id}-title`}>{d.title}</title>
				<desc id={`${id}-desc`}>{d.desc}</desc>
				<defs>
					<marker
						id={`${id}-arrow`}
						viewBox="0 0 10 10"
						refX="9"
						refY="5"
						markerWidth="7"
						markerHeight="7"
						orient="auto-start-reverse"
					>
						<path d="M0 0 10 5 0 10z" className="t-arrowhead" />
					</marker>
				</defs>

				{d.groups.map((g) => (
					<g key={g.label} className="t-group">
						<rect x={g.x} y={g.y} width={g.w} height={g.h} rx="18" />
						<text className="t-group-label" x={g.x + 16} y={g.y + 24}>
							{g.label}
						</text>
					</g>
				))}

				{d.boxes.map((b, i) => (
					<g key={i} className={['t-box', b.kind && `t-${b.kind}`].filter(Boolean).join(' ')}>
						<rect x={b.x} y={b.y} width={b.w} height={b.h} rx="14" />
						<text className="t-title" x={b.x + b.w / 2} y={b.sub ? b.y + b.h / 2 - 3 : b.y + b.h / 2 + 6}>
							{b.title}
						</text>
						{b.sub && (
							<text className="t-sub" x={b.x + b.w / 2} y={b.y + b.h / 2 + 19}>
								{b.sub}
							</text>
						)}
					</g>
				))}

				<g className="t-link">
					{d.links.map((l, i) => (
						<line
							key={i}
							x1={l.x1}
							y1={l.y1}
							x2={l.x2}
							y2={l.y2}
							markerStart={l.both ? arrow : undefined}
							markerEnd={arrow}
							className={l.dashed ? 't-dashed' : undefined}
						/>
					))}
				</g>

				{d.labels.map((t, i) => (
					<text
						key={i}
						className={['t-label', t.muted && 't-muted', t.anchor && `t-${t.anchor}`].filter(Boolean).join(' ')}
						x={t.x}
						y={t.y}
					>
						{t.text}
					</text>
				))}
			</svg>
		</figure>
	);
}
