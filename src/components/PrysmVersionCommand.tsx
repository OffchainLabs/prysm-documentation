/** Code block with the current Prysm release interpolated. `{version}` in `template` is replaced. */
import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import { PRYSM_VERSION } from '@site/src/data/site';

interface Props {
	prefix?: string;
	template?: string;
	lang?: string;
}

export default function PrysmVersionCommand({ prefix = '', template, lang = 'bash' }: Props) {
	const code = template !== undefined ? template.replaceAll('{version}', PRYSM_VERSION) : `${prefix}${PRYSM_VERSION}`;
	return <CodeBlock language={lang}>{code}</CodeBlock>;
}
