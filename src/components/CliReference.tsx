/**
 * Flag and subcommand reference for one Prysm binary, rendered from the JSON
 * produced by tools/gen-cli-reference.sh. Everything is server-rendered (so it
 * is indexed by search and every flag has an anchor); on the client a filter
 * box narrows the list as you type.
 *
 *   <CliReference binary="beacon-chain" />
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import { useLocation } from '@docusaurus/router';
import beacon from '@site/src/data/cli-beacon-chain.json';
import validator from '@site/src/data/cli-validator.json';
import prysmctl from '@site/src/data/cli-prysmctl.json';
import beaconNotes from '@site/src/data/flag-notes/beacon-chain.json';
import validatorNotes from '@site/src/data/flag-notes/validator.json';
import prysmctlNotes from '@site/src/data/flag-notes/prysmctl.json';
import FlagNote, { type Note } from './FlagNote';
import './CliReference.css';

type Bin = 'beacon-chain' | 'validator' | 'prysmctl';

interface Flag {
	name: string;
	aliases?: string[] | null;
	usage: string;
	default?: string;
	type: string;
	takesValue: boolean;
	hidden?: boolean;
}
interface Cmd {
	name: string;
	aliases?: string[] | null;
	usage: string;
	description?: string;
	flags?: Flag[] | null;
	subcommands?: Cmd[] | null;
}
interface Dump {
	groups: { name: string; flags: Flag[] | null }[] | null;
	commands: Cmd[] | null;
}

const dumps: Record<Bin, Dump> = {
	'beacon-chain': beacon as Dump,
	validator: validator as Dump,
	prysmctl: prysmctl as Dump,
};
const noteFiles: Record<Bin, Record<string, Note>> = {
	'beacon-chain': beaconNotes as Record<string, Note>,
	validator: validatorNotes as Record<string, Note>,
	prysmctl: prysmctlNotes as Record<string, Note>,
};

const groupTitles: Record<string, string> = {
	cmd: 'General',
	'beacon-chain': 'Beacon node and APIs',
	p2p: 'Peer-to-peer networking',
	db: 'Database and storage',
	builder: 'Block building and MEV',
	sync: 'Sync',
	'execution layer': 'Execution client connection',
	monitoring: 'Monitoring',
	slasher: 'Slasher',
	log: 'Logging',
	features: 'Feature flags',
	merge: 'Fee recipient',
	debug: 'Debugging and profiling',
	rpc: 'RPC and APIs',
	proposer: 'Proposer settings',
	'remote signer': 'Remote signer (Web3Signer)',
	misc: 'Miscellaneous',
};

const slug = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

/** Flatten nested subcommands into `a b c` paths. */
const flatten = (cmds: Cmd[], prefix: string[] = []): { path: string[]; cmd: Cmd }[] =>
	cmds.flatMap((c) => {
		const path = [...prefix, c.name];
		const self = c.flags?.length || !c.subcommands?.length ? [{ path, cmd: c }] : [];
		return [...self, ...flatten(c.subcommands ?? [], path)];
	});

const cleanDefault = (d?: string) => {
	if (d === undefined || d === '' || d === '""' || d === '[]') return undefined;
	return d.replace(/^"(.*)"$/, '$1');
};
const typeLabel = (f: Flag) => (f.type === 'Bool' ? 'boolean' : f.type.replace(/Slice$/, ' list').toLowerCase());

/** Usage strings are plain text written for a terminal; keep line breaks meaningful. */
const usageHtml = (u: string) =>
	u
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/(^|\s)(--[a-z0-9][a-z0-9-]*)/g, '$1<code>$2</code>')
		.replace(/\s*\n\s*/g, ' ')
		.trim();

const deprecatedRe = /deprecated|will be removed/i;

const matchesAll = (terms: string[], haystack: string) => terms.every((t) => haystack.includes(t));

function buildModel(binary: Bin) {
	const dump = dumps[binary];
	const notes = noteFiles[binary];
	const groups = (dump.groups ?? [])
		.map((g) => ({ ...g, flags: (g.flags ?? []).filter((f) => !f.hidden) }))
		.filter((g) => g.flags.length > 0)
		.map((g) => ({
			name: g.name,
			title: groupTitles[g.name] ?? g.name,
			id: `group-${slug(g.name)}`,
			flags: g.flags.map((f) => ({
				flag: f,
				note: notes[f.name] as Note | undefined,
				search: `${f.name} ${(f.aliases ?? []).join(' ')} ${f.usage} ${f.default ?? ''} ${notes[f.name]?.explain ?? ''}`.toLowerCase(),
			})),
		}));
	const commands = flatten(dump.commands ?? []).map(({ path, cmd }) => {
		const p = path.join(' ');
		return {
			path: p,
			cmd,
			id: `cmd-${slug(p)}`,
			title: `${binary} ${p}`.toLowerCase(),
			flags: (cmd.flags ?? []).map((f) => {
				const note = notes[`${p}::${f.name}`] as Note | undefined;
				return {
					flag: f,
					note,
					search: `${p} ${f.name} ${f.usage} ${f.default ?? ''} ${note?.explain ?? ''}`.toLowerCase(),
				};
			}),
		};
	});
	const total = groups.reduce((n, g) => n + g.flags.length, 0) + commands.reduce((n, c) => n + c.flags.length, 0);
	return { groups, commands, total };
}

function FlagName({ flag, link }: { flag: Flag; link: boolean }) {
	const label = typeLabel(flag);
	// Subcommand flags always show their value type, even booleans that take one.
	const val = flag.takesValue && <span className="cli-val">={link && label === 'boolean' ? '' : `<${label}>`}</span>;
	return link ? (
		<a className="cli-name" href={`#${flag.name}`}>
			--{flag.name}
			{val}
		</a>
	) : (
		<span className="cli-name">
			--{flag.name}
			{val}
		</span>
	);
}

function Default({ value }: { value?: string }) {
	const d = cleanDefault(value);
	if (d === undefined) return null;
	return (
		<span>
			default <code className="cli-default">{d}</code>
		</span>
	);
}

export default function CliReference({ binary }: { binary: Bin }) {
	const { groups, commands, total } = useMemo(() => buildModel(binary), [binary]);
	const brokenLinks = useBrokenLinks();
	const location = useLocation();
	const [query, setQuery] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	for (const g of groups) {
		brokenLinks.collectAnchor(g.id);
		for (const f of g.flags) brokenLinks.collectAnchor(f.flag.name);
	}
	if (commands.length > 0) brokenLinks.collectAnchor('subcommands');
	for (const c of commands) brokenLinks.collectAnchor(c.id);

	useEffect(() => {
		const q = new URLSearchParams(location.search).get('q');
		if (q) setQuery(q);
	}, [location.search]);

	// `/` focuses the filter, like most reference sites.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
			const t = e.target as HTMLElement | null;
			if (t?.closest?.('input, textarea, select, [contenteditable]')) return;
			e.preventDefault();
			inputRef.current?.focus();
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, []);

	const terms = query.toLowerCase().replace(/^-+/, '').split(/\s+/).filter(Boolean);
	const filtering = terms.length > 0;

	let shown = 0;
	const groupHits = groups.map((g) => {
		const hits = g.flags.map((f) => matchesAll(terms, f.search));
		shown += hits.filter(Boolean).length;
		return hits;
	});
	const cmdHits = commands.map((c) => {
		const hits = c.flags.map((f) => matchesAll(terms, f.search));
		shown += hits.filter(Boolean).length;
		const visible = !filtering || hits.some(Boolean) || matchesAll(terms, c.title);
		return { hits, visible };
	});
	const anyCmdVisible = cmdHits.some((c) => c.visible);

	return (
		<div className="cli-ref" data-binary={binary}>
			<div className="cli-bar">
				<label className="cli-search">
					<span className="cli-sr-only">Filter flags</span>
					<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
						<path
							fill="currentColor"
							d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"
						/>
					</svg>
					<input
						ref={inputRef}
						type="search"
						placeholder={`Filter ${total} flags by name, description or default…`}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</label>
				<p className="cli-count" aria-live="polite">
					{filtering ? `${shown} of ${total} flags` : ''}
				</p>
			</div>

			{groups.length > 0 && (
				<nav className="cli-jump" aria-label="Flag groups">
					{groups.map((g) => (
						<a key={g.id} href={`#${g.id}`}>
							{g.title} <span>{g.flags.length}</span>
						</a>
					))}
					{commands.length > 0 && <a href="#subcommands">Subcommands</a>}
				</nav>
			)}

			{groups.map((g, gi) => (
				<section key={g.id} className="cli-group" hidden={!groupHits[gi].some(Boolean)}>
					<h2 id={g.id}>{g.title}</h2>
					<dl>
						{g.flags.map(({ flag: f, note }, fi) => (
							<div key={f.name} className="cli-flag" id={f.name} hidden={!groupHits[gi][fi]}>
								<dt>
									<FlagName flag={f} link />
									{deprecatedRe.test(f.usage) && <span className="cli-tag cli-tag-warn">deprecated</span>}
									{(f.aliases ?? []).length > 0 && (
										<span className="cli-alias">
											alias{' '}
											{(f.aliases ?? []).map((a) => (
												<code key={a}>{a.length === 1 ? `-${a}` : `--${a}`}</code>
											))}
										</span>
									)}
								</dt>
								<dd>
									<p dangerouslySetInnerHTML={{ __html: usageHtml(f.usage) }} />
									{note && <FlagNote note={note} />}
									<p className="cli-meta">
										<span>{typeLabel(f)}</span>
										<Default value={f.default} />
									</p>
								</dd>
							</div>
						))}
					</dl>
				</section>
			))}

			{commands.length > 0 && (
				<section className="cli-group" hidden={!anyCmdVisible}>
					<h2 id="subcommands">Subcommands</h2>
					{commands.map((c, ci) => (
						<div key={c.id} className="cli-cmd" hidden={!cmdHits[ci].visible}>
							<h3 id={c.id}>
								<code>
									{binary} {c.path}
								</code>
							</h3>
							<p>{c.cmd.usage}</p>
							{c.cmd.description && <p className="cli-desc">{c.cmd.description}</p>}
							{c.flags.length > 0 && (
								<dl>
									{c.flags.map(({ flag: f, note }, fi) => (
										<div key={f.name} className="cli-flag" hidden={!cmdHits[ci].hits[fi]}>
											<dt>
												<FlagName flag={f} link={false} />
												{deprecatedRe.test(f.usage) && <span className="cli-tag cli-tag-warn">deprecated</span>}
											</dt>
											<dd>
												<p dangerouslySetInnerHTML={{ __html: usageHtml(f.usage) }} />
												{note && <FlagNote note={note} />}
												{cleanDefault(f.default) !== undefined && (
													<p className="cli-meta">
														<Default value={f.default} />
													</p>
												)}
											</dd>
										</div>
									))}
								</dl>
							)}
						</div>
					))}
				</section>
			)}

			<p className="cli-empty" hidden={shown > 0 || anyCmdVisible}>
				No flags match. Try a shorter term, or search the whole site with the search bar.
			</p>
		</div>
	);
}
