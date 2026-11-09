import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import legacyRedirects from './src/data/legacy-redirects.json';
import v2Redirects from './src/data/v2-redirects.json';
import { readFileSync } from 'node:fs';

// Navbar logos (Offchain, GitHub, Discord), inlined so they take the navbar's text colour.
const inlineSvg = (file: string, className: string) =>
	readFileSync(`./static/img/${file}`, 'utf8')
		.replace(/fill="#000000"/g, 'fill="currentColor"')
		.replace('<svg ', `<svg class="${className}" aria-hidden="true" `)
		.replace(/<title>.*?<\/title>/, '')
		.trim();
const offchainLogo = inlineSvg('offchain-logo.svg', 'navbar-offchain-logo');
// A navbar link with an icon and a label, without Docusaurus's external-link arrow.
const iconLink = (href: string, label: string, file: string) => ({
	type: 'html' as const,
	position: 'right' as const,
	value: `<a class="navbar__item navbar__link navbar-icon-link" href="${href}" title="${label}" target="_blank" rel="noopener noreferrer">${inlineSvg(file, 'navbar-icon')}<span>${label}</span></a>`,
});

const config: Config = {
	title: 'Prysm',
	tagline: 'Documentation for Prysm, the Ethereum consensus client written in Go by Offchain.',
	favicon: 'favicon.svg',

	future: {
		v4: true,
		faster: true,
	},

	url: 'https://prysm.offchainlabs.com',
	baseUrl: '/docs/',
	trailingSlash: true,

	organizationName: 'OffchainLabs',
	projectName: 'prysm-documentation',

	onBrokenLinks: 'throw',
	onBrokenAnchors: 'throw',
	markdown: {
		hooks: { onBrokenMarkdownLinks: 'throw' },
	},

	i18n: { defaultLocale: 'en', locales: ['en'] },

	presets: [
		[
			'classic',
			{
				docs: {
					routeBasePath: '/',
					sidebarPath: './sidebars.ts',
					editUrl: 'https://github.com/OffchainLabs/prysm-documentation/edit/master/',
					showLastUpdateTime: false,
				},
				blog: false,
				theme: {
					customCss: './src/css/custom.css',
				},
			} satisfies Preset.Options,
		],
	],

	plugins: [
		[
			'@docusaurus/plugin-client-redirects',
			{
				// Old Docusaurus URLs from the previous docs, and pages merged during
				// the user-focused restructure, → current pages.
				redirects: Object.entries({ ...legacyRedirects, ...v2Redirects } as Record<string, string>).map(([from, to]) => ({
					from: from.replace(/\/$/, '') || '/',
					to,
				})),
			},
		],
		[
			// llms.txt, llms-full.txt and a .md copy of every page, for LLMs and agents.
			// middleware.js serves the .md copy to clients that send `Accept: text/markdown`.
			'@signalwire/docusaurus-plugin-llms-txt',
			{
				siteTitle: 'Prysm Documentation',
				siteDescription: 'Documentation for Prysm, the Ethereum consensus client written in Go by Offchain.',
				content: {
					enableMarkdownFiles: true,
					enableLlmsFullTxt: true,
					includeDocs: true,
					includeBlog: false,
					includePages: false,
					excludeRoutes: ['**/404/', '**/search/'],
				},
			},
		],
	],

	themes: [
		[
			'@easyops-cn/docusaurus-search-local',
			{
				hashed: true,
				indexBlog: false,
				docsRouteBasePath: '/',
				highlightSearchTermsOnTargetPage: true,
				searchBarShortcutHint: true,
			},
		],
	],

	themeConfig: {
		image: 'img/prysm-logo.svg',
		colorMode: {
			// Dark only: no theme switch, and the visitor's system setting is ignored.
			defaultMode: 'dark',
			disableSwitch: true,
			respectPrefersColorScheme: false,
		},
		docs: {
			sidebar: { hideable: true, autoCollapseCategories: false },
		},
		navbar: {
			title: 'Prysm',
			logo: { alt: 'Prysm', src: 'img/prysm-logo.svg' },
			items: [
				{ to: '/get-started/introduction/', label: 'Welcome', position: 'left' },
				{ to: '/get-started/quickstart/', label: 'Quickstart', position: 'left' },
				{ to: '/install/', label: 'Install and update', position: 'left' },
				{ to: '/reference/cli/beacon-chain/', label: 'Beacon chain flags', position: 'left' },
				{ to: '/reference/cli/validator/', label: 'Validator flags', position: 'left' },
				{ to: '/developers/', label: 'Developer guide', position: 'left' },
				{
					type: 'html',
					position: 'right',
					value: `<a class="navbar__item navbar__link navbar-offchain" href="https://www.offchain.io/" aria-label="Offchain" title="Prysm is built by Offchain">${offchainLogo}</a>`,
				},
				iconLink('https://github.com/OffchainLabs/prysm', 'GitHub', 'github-logo.svg'),
				iconLink('https://discord.gg/qEZK94mFXP', 'Discord', 'discord-logo.svg'),
			],
		},
		footer: {
			style: 'dark',
			copyright: `Prysm is open source under the GPL-3.0 licence. Maintained by Offchain.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.vsDark,
			additionalLanguages: ['bash', 'powershell', 'ini', 'protobuf', 'nginx'],
		},
		tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
	} satisfies Preset.ThemeConfig,
};

export default config;
