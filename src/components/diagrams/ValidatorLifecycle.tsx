/**
 * Validator lifecycle since Electra: deposit queue → pending → active →
 * exiting → exited → withdrawable, with the slashed branch.
 *
 * Delays from config/params/mainnet_config.go: MAX_SEED_LOOKAHEAD 4,
 * MIN_VALIDATOR_WITHDRAWABILITY_DELAY 256 epochs, EPOCHS_PER_SLASHINGS_VECTOR
 * 8192 epochs, EJECTION_BALANCE 16 ETH.
 */
import React, { useId } from 'react';
import './ValidatorLifecycle.css';

const states = [
	{ x: 11, name: 'Deposit', api: 'no status yet', note: ['processed once', 'finalized, limited', 'by churn'] },
	{ x: 143, name: 'Pending', api: 'pending_queued', note: ['activated ~5 epochs', 'after eligibility', 'is finalized'] },
	{ x: 275, name: 'Active', api: 'active_ongoing', note: ['attests, proposes;', 'exits on request', 'or at 16 ETH'] },
	{ x: 407, name: 'Exiting', api: 'active_exiting', note: ['still has duties', 'until its exit', 'epoch (churn)'] },
	{ x: 539, name: 'Exited', api: 'exited_unslashed', note: ['no attestations or', 'proposals; waits', '256 epochs (~27 h)'] },
	{ x: 671, name: 'Withdrawable', api: 'withdrawal_possible', note: ['balance swept to', 'the withdrawal', 'address'] },
];
const w = 118;

export default function ValidatorLifecycle() {
	const id = `life-${useId().replace(/[^\w-]/g, '')}`;
	const arrow = `url(#${id}-arrow)`;
	return (
		<figure className="life not-content">
			<svg viewBox="0 0 800 212" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
				<title id={`${id}-title`}>Validator lifecycle</title>
				<desc id={`${id}-desc`}>
					A deposit waits in the pending deposit queue until it is finalized and fits in the churn limit. The validator
					is then pending, and activates about five epochs after its eligibility is finalized. An active validator exits
					on a voluntary exit, an execution-layer exit request, or when its balance falls to 16 ETH. It keeps its duties
					while exiting, until its exit epoch. After exiting it waits 256 epochs, about 27 hours, before it becomes
					withdrawable and its balance is swept to the withdrawal address. An active or exiting validator that is
					slashed is forced to exit and becomes withdrawable only after 8,192 epochs, about 36 days.
				</desc>
				<defs>
					<marker
						id={`${id}-arrow`}
						viewBox="0 0 10 10"
						refX="9"
						refY="5"
						markerWidth="7"
						markerHeight="7"
						orient="auto"
					>
						<path d="M0 0 10 5 0 10z" className="l-arrowhead" />
					</marker>
				</defs>

				{/* Slashed branch */}
				<g className="l-box l-slashed">
					<rect x="420" y="10" width="220" height="44" rx="12" />
					<text className="l-title" x="530" y="31">Slashed</text>
					<text className="l-api" x="530" y="47">active_slashed → exited_slashed</text>
				</g>
				<g className="l-link l-danger">
					<path d="M334 88 V32 H416" fill="none" markerEnd={arrow} />
					<path d="M466 88 V58" fill="none" markerEnd={arrow} />
					<path d="M640 32 H730 V86" fill="none" markerEnd={arrow} />
				</g>
				<text className="l-note l-left" x="648" y="24">8,192 epochs (~36 days)</text>

				{/* Main states */}
				{states.map((s, i) => (
					<g key={s.name}>
						<g className={`l-box ${s.name === 'Active' ? 'l-active' : ''}`}>
							<rect x={s.x} y="90" width={w} height="56" rx="12" />
							<text className="l-title" x={s.x + w / 2} y="114">{s.name}</text>
							<text className={`l-api ${s.api.length > 16 ? 'l-api-long' : ''}`} x={s.x + w / 2} y="133">{s.api}</text>
						</g>
						{i < states.length - 1 && (
							<line className="l-step" x1={s.x + w + 1} y1="118" x2={s.x + w + 13} y2="118" markerEnd={arrow} />
						)}
						{s.note.map((line, j) => (
							<text key={j} className="l-note" x={s.x + w / 2} y={168 + j * 15}>{line}</text>
						))}
					</g>
				))}
			</svg>
		</figure>
	);
}
