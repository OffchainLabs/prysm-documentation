import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
// The page list and sidebar order live in tools/ia.mjs.
import { sidebar } from './tools/ia.mjs';

const sidebars: SidebarsConfig = {
	docs: sidebar(),
};

export default sidebars;
