// Writes a placeholder page for every IA entry that doesn't exist yet:
//   node tools/ia-stubs.mjs
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pages } from './ia.mjs';

	for (const [slug, title, owner] of pages()) {
		const isIndex = !slug.includes('/') || ['install', 'security', 'flags', 'developers'].includes(slug) || slug.endsWith('/topologies') || slug.endsWith('/architecture') || slug === 'reference/cli';
		const candidates = [`docs/${slug}.mdx`, `docs/${slug}/index.mdx`];
		if (candidates.some(existsSync)) continue;
		const file = isIndex ? `docs/${slug}/index.mdx` : `docs/${slug}.mdx`;
		mkdirSync(dirname(file), { recursive: true });
		writeFileSync(file, `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(`TODO(${owner}): one-sentence description.`)}\n---\n\n{/* STUB: owned by "${owner}". Replace this whole file. */}\n\nThis page is being written.\n`);
		console.log('stub', file);
	}

