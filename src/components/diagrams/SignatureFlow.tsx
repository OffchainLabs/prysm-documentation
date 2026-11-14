/**
 * The generic signature scheme: a private key and the public key derived from
 * it, signing (private key + message → signature) and verification
 * (public key + message + signature → valid or invalid). Scheme-independent.
 */
import React, { useId } from 'react';
import './SignatureFlow.css';

type BoxProps = { x: number; y: number; w: number; title: string; sub?: string; kind?: string };

function Box({ x, y, w, title, sub, kind = '' }: BoxProps) {
	return (
		<g className={`s-box ${kind}`}>
			<rect x={x} y={y} width={w} height="52" rx="12" />
			<text className="s-title" x={x + w / 2} y={sub ? y + 23 : y + 31}>{title}</text>
			{sub && <text className="s-sub" x={x + w / 2} y={y + 40}>{sub}</text>}
		</g>
	);
}

export default function SignatureFlow() {
	const id = `sig-${useId().replace(/[^\w-]/g, '')}`;
	const arrow = `url(#${id}-arrow)`;
	return (
		<figure className="sigflow not-content">
			<svg viewBox="0 0 800 236" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
				<title id={`${id}-title`}>How a signature is made and checked</title>
				<desc id={`${id}-desc`}>
					The public key is derived from the private key, and the private key can't be recovered from it. Signing takes
					the private key and the message and produces a signature. Only the owner of the private key can sign.
					Verifying takes the public key, the message and the signature and answers valid or invalid. Anyone can verify.
				</desc>
				<defs>
					<marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
						<path d="M0 0 10 5 0 10z" className="s-arrowhead" />
					</marker>
				</defs>

				<text className="s-note" x="500" y="20">only the key owner</text>
				<text className="s-note" x="500" y="228">anyone</text>

				<g className="s-link">
					<line x1="95" y1="84" x2="95" y2="150" markerEnd={arrow} />
					<line x1="172" y1="58" x2="436" y2="58" markerEnd={arrow} />
					<path d="M382 108 H408 V72 H436" fill="none" markerEnd={arrow} />
					<path d="M382 128 H408 V164 H436" fill="none" markerEnd={arrow} />
					<line x1="172" y1="178" x2="436" y2="178" markerEnd={arrow} />
					<line x1="562" y1="58" x2="616" y2="58" markerEnd={arrow} />
					<path d="M700 84 V122 H520 V150" fill="none" markerEnd={arrow} />
					<line x1="562" y1="178" x2="616" y2="178" markerEnd={arrow} />
				</g>
				<text className="s-note s-left" x="105" y="122">derived,</text>
				<text className="s-note s-left" x="105" y="137">one way</text>

				<Box x={20} y={32} w={150} title="Private key" sub="kept secret" kind="s-secret" />
				<Box x={20} y={152} w={150} title="Public key" sub="shared with everyone" />
				<Box x={230} y={92} w={150} title="Message" sub="e.g. a block or a vote" />
				<Box x={440} y={32} w={120} title="Sign" kind="s-op" />
				<Box x={440} y={152} w={120} title="Verify" kind="s-op" />
				<Box x={620} y={32} w={160} title="Signature" sub="sent with the message" />
				<Box x={620} y={152} w={160} title="Valid or invalid" />
			</svg>
		</figure>
	);
}
