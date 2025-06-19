var prysmVersion = "v6.0.0";

module.exports = {
    title: 'Prysm',
    tagline: 'Ethereum consensus implementation written entirely in Go.',
    url: process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000',
    baseUrl: '/prysm/docs/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'throw',
    favicon: 'images/Prysm.svg',
    organizationName: 'Offchain Labs',
    projectName: 'prysm-docs',
    staticDirectories: ['static'],

    customFields: {
        image: 'images/Prysm.svg',
        prysmVersion: prysmVersion,
    },
    trailingSlash: true,
    scripts: ['https://buttons.github.io/buttons.js'],

    themeConfig: {
        navbar: {
            title: "Prysm Documentation",
            logo: {
                alt: "Prysm logo",
                src: 'images/logo2.png',
                href: '/prysm/docs/',
            },
            items: [{
                type: 'docsVersion',
                position: 'left',
                to: 'https://github.com/OffchainLabs/prysm/releases/tag/' + prysmVersion,
                label: prysmVersion,
            },
            {
                to: '/prysm/docs/install-prysm/install-with-script',
                label: 'Quick Install',
                position: 'right',
            },
            {
                href: 'https://github.com/OffchainLabs/prysm',
                label: 'GitHub',
                position: 'right',
            },
            {
                href: 'https://discord.gg/prysm',
                label: 'Discord',
                position: 'right',
            },
            ],
        },
        footer: {
            logo: {
                alt: "Prysm Eth2 Docs",
                href: '/prysm/docs/',
                src: 'images/Prysm.svg',
            },
            copyright: `Copyright © ${new Date().getFullYear()} Offchain Labs, Inc., Validator Deposit Contract 0x00000000219ab540356cbb839cbe05303d7705fa`,
            links: [],
        },
        prism: {
            theme: require('prism-react-renderer/themes/dracula'),
        },
        image: 'images/prysm_together.png'
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    routeBasePath: '/',
                    showLastUpdateTime: false,
                    showLastUpdateAuthor: false,
                    breadcrumbs: false,
                    sidebarPath: require.resolve('./sidebars.json'),
                    editUrl: 'https://github.com/OffchainLabs/prysm-documentation/edit/master/',
                },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                sitemap: {
                    changefreq: 'weekly',
                    priority: 0.5,
                },
            },
        ],
    ],
    plugins: [
        [
            '@docusaurus/plugin-google-analytics',
            {
                trackingID: 'UA-139640266-2',
                anonymizeIP: true,
            },
        ],
        require.resolve("docusaurus-lunr-search"),
    ],
};
