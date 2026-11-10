// The site is built with `baseUrl: '/docs/'`, but Docusaurus writes files to the root
// of `build/`. Static hosts serve files by path, so move everything under
// `build/docs/` and keep robots.txt at the domain root.
import { mkdirSync, readdirSync, renameSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'build';
const target = join(dist, 'docs');
if (existsSync(join(target, 'index.html'))) process.exit(0);
mkdirSync(target, { recursive: true });
for (const entry of readdirSync(dist)) {
	if (entry === 'docs') continue;
	renameSync(join(dist, entry), join(target, entry));
}
if (existsSync(join(target, 'robots.txt'))) copyFileSync(join(target, 'robots.txt'), join(dist, 'robots.txt'));
console.log('Moved build output under build/docs/');
