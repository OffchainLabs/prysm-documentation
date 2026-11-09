/** Renders one hand-written flag note inside the CLI reference. */
import React from 'react';
import Link from '@docusaurus/Link';

/**
 * Hand-written notes that explain flags beyond their one-line usage string.
 * Keyed by flag name, or `subcommand path::flag` for subcommand flags.
 */
export interface Note {
	explain: string;
	example?: string;
	related?: string[];
	guide?: string;
	caution?: string;
}

const inline = (t: string) =>
	t
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/`([^`]+)`/g, '<code>$1</code>');

export default function FlagNote({ note }: { note: Note }) {
	const related = (note.related ?? []).map((r) => r.replace(/^-+/, ''));
	return (
		<div className="cli-note">
			<p dangerouslySetInnerHTML={{ __html: inline(note.explain) }} />
			{note.caution && <p className="cli-note-caution" dangerouslySetInnerHTML={{ __html: inline(note.caution) }} />}
			{note.example && (
				<pre>
					<code>{note.example}</code>
				</pre>
			)}
			{(related.length > 0 || note.guide) && (
				<p className="cli-note-links">
					{related.length > 0 && (
						<span>
							See also{' '}
							{related.map((r, i) => (
								<React.Fragment key={r}>
									{i > 0 && ', '}
									<a href={`#${r}`}>
										<code>--{r}</code>
									</a>
								</React.Fragment>
							))}
						</span>
					)}
					{note.guide && <Link to={note.guide}>Read the guide</Link>}
				</p>
			)}
		</div>
	);
}
