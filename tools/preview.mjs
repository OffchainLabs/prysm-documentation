// Serves build/ at http://localhost:3000/docs/ the way a static host does.
//
// `docusaurus serve` redirects every path without a trailing slash when
// `trailingSlash: true` is set, including files requested with a query string
// (the search index and fonts), which then 404. This server only adds the
// slash for directories.
//
//   npm run build && npm run serve
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

function isDirSync(p) {
	try {
		return statSync(p).isDirectory();
	} catch {
		return false;
	}
}

// After tools/nest-under-base.mjs the site lives in build/docs/.
const ROOT = isDirSync('build/docs/assets') ? 'build/docs' : 'build';
const BASE = '/docs/';
const PORT = Number(process.env.PORT ?? 3000);
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.woff2': 'font/woff2',
	'.pdf': 'application/pdf',
	'.xml': 'application/xml',
	'.txt': 'text/plain',
};

const isFile = (p) => {
	try {
		return statSync(p).isFile();
	} catch {
		return false;
	}
};
const isDir = (p) => {
	try {
		return statSync(p).isDirectory();
	} catch {
		return false;
	}
};

createServer((req, res) => {
	const url = new URL(req.url ?? '/', 'http://localhost');
	if (url.pathname === '/' || url.pathname === '/docs') {
		res.writeHead(302, { Location: BASE }).end();
		return;
	}
	if (!url.pathname.startsWith(BASE)) {
		res.writeHead(404).end('Not found');
		return;
	}
	const rel = normalize(decodeURIComponent(url.pathname.slice(BASE.length))).replace(/^(\.\.[/\\])+/, '');
	let file = join(ROOT, rel);
	if (isDir(file)) {
		if (!url.pathname.endsWith('/')) {
			res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
			return;
		}
		file = join(file, 'index.html');
	}
	let status = 200;
	if (!isFile(file)) {
		status = 404;
		file = join(ROOT, '404.html');
	}
	res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
	createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Serving ${ROOT}/ at http://localhost:${PORT}${BASE}`));
