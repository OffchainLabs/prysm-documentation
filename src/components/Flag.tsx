/**
 * Inline flag reference that links to the generated CLI reference.
 *
 *   <Flag name="checkpoint-sync-url" />                  beacon-chain flag
 *   <Flag name="wallet-dir" bin="validator" />            validator flag
 *   <Flag name="checkpoint-sync-url" value="https://…" /> shows --name=value
 *
 * Rendering fails (and so does the build) if the flag doesn't exist in that
 * binary, so pages can't silently reference a renamed or removed flag.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import beacon from '@site/src/data/cli-beacon-chain.json';
import validator from '@site/src/data/cli-validator.json';
import prysmctl from '@site/src/data/cli-prysmctl.json';

type Bin = 'beacon-chain' | 'validator' | 'prysmctl';
type F = { name: string; aliases?: string[] | null };
type AnyCmd = { flags?: F[] | null; subcommands?: AnyCmd[] | null };
type Dump = { groups: { flags: F[] | null }[] | null; commands: AnyCmd[] | null };

const dumps: Record<Bin, Dump> = {
	'beacon-chain': beacon as Dump,
	validator: validator as Dump,
	prysmctl: prysmctl as Dump,
};
const matches = (f: F, n: string) => f.name === n || (f.aliases ?? []).includes(n);
const inSubcommands = (cmds: AnyCmd[], n: string): boolean =>
	cmds.some((c) => (c.flags ?? []).some((f) => matches(f, n)) || inSubcommands(c.subcommands ?? [], n));

export default function Flag({ name, bin = 'beacon-chain', value }: { name: string; bin?: Bin; value?: string }) {
	const flagName = name.replace(/^-+/, '');
	const top = (dumps[bin].groups ?? []).flatMap((g) => g.flags ?? []).find((f) => matches(f, flagName));
	if (!top && !inSubcommands(dumps[bin].commands ?? [], flagName)) {
		throw new Error(`<Flag name="${name}" bin="${bin}">: no such flag in ${bin}. Check src/data/cli-${bin}.json.`);
	}
	const anchor = top ? top.name : 'subcommands';
	return (
		<Link className="prysm-flag" to={`/reference/cli/${bin}/#${anchor}`}>
			<code>
				--{flagName}
				{value !== undefined && `=${value}`}
			</code>
		</Link>
	);
}
