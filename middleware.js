// Content negotiation: serve the plugin-generated .md when a client asks for markdown.
// Must be Edge Middleware (not a vercel.json rewrite) because /docs/<page>/ already
// resolves to a static index.html, and top-level rewrites don't override existing files.
import { rewrite, next } from '@vercel/edge';

export const config = { matcher: '/docs/:path*' };

export default function middleware(request) {
  const accept = request.headers.get('accept') || '';
  if (!accept.includes('text/markdown')) return next();

  const url = new URL(request.url);
  const { pathname } = url;
  // skip anything already targeting a file (.md, images, js/css) — only page routes get rewritten
  if (/\.[a-z0-9]+$/i.test(pathname)) return next();

  url.pathname =
    pathname === '/docs/' ? '/docs/index.md' : pathname.replace(/\/$/, '') + '.md';
  return rewrite(url);
}
