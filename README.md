# Prysm Documentation Portal

This repository houses all the documentation pertaining to the Prysm client and Ethereum. It is generated with [Docusaurus](https://github.com/facebook/docusaurus) and deployed with [Vercel](https://vercel.com/).

Below are steps for initializing and reproducing this portal for development.

## Dependencies

1. The latest version of [Node](https://nodejs.org/en/download/) installed.
2. npm (comes with Node.js)

   > You have to be on Node >= 20.

## Installation

1. Clone this repository.
2. Enter the newly cloned repo.
3. Issue the command `npm install`.
4. Wait for the installation process to complete.

## Running the development server

1. From the root directory, run the local web server using `npm start`.
2. Load the example site at http://localhost:3000/docs/ if it did not already open automatically. If port 3000 has already been taken, another port will be used. Look at the console messages to see which.

   You should see the example site loaded in your web browser. There's also a LiveReload server running, and any changes made to the docs and files in the project directory will cause the page to refresh.

## Building Static HTML Pages

To create a static build of the documentation portal, run the following script from the root directory:

```bash
npm run build
```

This will generate a `build` directory containing the `.html` files from all of the docs and other files included in `pages`.

## Deployment with Vercel

This project is configured to be deployed with Vercel. The `vercel.json` file in the root directory contains the necessary configuration for deployment.

To deploy:

1. Push your changes to GitHub.
2. Connect your GitHub repository to Vercel.
3. Vercel will automatically build and deploy the site.

Alternatively, you can use the Vercel CLI to deploy from your local machine:

```bash
npm install -g vercel
vercel
```

## Maintenance

When a new version of Prysm is released, update the following files:

- `docusaurus.config.js` — bump `prysmVersion` (line 1) to the new tag (e.g., `"v7.1.5"`). This drives the version badge and release link in the navbar.
- `docs/faq.md` — update any hardcoded version strings in example terminal-output blocks to match the new release.
- `.node-version` — update if the required Node version changes; keep `README.md` in sync.
