/** The three processes of a staking node and how they talk to each other. */
import React, { useId } from 'react';
import './StackDiagram.css';

export default function StackDiagram() {
	const id = `stack-${useId().replace(/[^\w-]/g, '')}`;
	const arrow = `url(#${id}-arrow)`;
	return (
		<figure className="stack not-content">
			<svg viewBox="0 0 720 300" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
				<title id={`${id}-title`}>How Prysm fits into an Ethereum node</title>
				<desc id={`${id}-desc`}>
					The Prysm validator client connects to the Prysm beacon node over the Beacon API. The beacon node connects to
					an execution client over the authenticated Engine API. Both the beacon node and the execution client talk to
					their own peer-to-peer networks.
				</desc>
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
						<path d="M0 0 10 5 0 10z" className="s-arrowhead" />
					</marker>
				</defs>

				{/* P2P networks */}
				<g className="s-net">
					<rect x="20" y="20" width="220" height="56" rx="28" />
					<text x="130" y="53">Consensus P2P network</text>
					<rect x="480" y="20" width="220" height="56" rx="28" />
					<text x="590" y="53">Execution P2P network</text>
				</g>

				{/* Processes */}
				<g className="s-box s-prysm">
					<rect x="30" y="120" width="200" height="80" rx="14" />
					<text className="s-title" x="130" y="155">Beacon node</text>
					<text className="s-sub" x="130" y="178">Prysm</text>
				</g>
				<g className="s-box">
					<rect x="490" y="120" width="200" height="80" rx="14" />
					<text className="s-title" x="590" y="155">Execution client</text>
					<text className="s-sub" x="590" y="178">Geth, Nethermind, Besu, Reth…</text>
				</g>
				<g className="s-box s-prysm s-optional">
					<rect x="30" y="232" width="200" height="56" rx="14" />
					<text className="s-title" x="130" y="265">Validator client</text>
				</g>

				{/* Links */}
				<g className="s-link">
					<line x1="130" y1="78" x2="130" y2="118" markerStart={arrow} markerEnd={arrow} />
					<line x1="590" y1="78" x2="590" y2="118" markerStart={arrow} markerEnd={arrow} />
					<line x1="234" y1="160" x2="486" y2="160" markerStart={arrow} markerEnd={arrow} />
					<line x1="130" y1="230" x2="130" y2="203" markerEnd={arrow} />
				</g>
				<text className="s-label" x="360" y="150">Engine API</text>
				<text className="s-label s-muted" x="360" y="180">port 8551, JWT secret</text>
				<text className="s-label s-left" x="142" y="222">Beacon API or gRPC</text>
				<text className="s-label s-left s-muted" x="250" y="265">optional: only if you stake</text>
			</svg>
		</figure>
	);
}
