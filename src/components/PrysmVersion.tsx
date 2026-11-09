/**
 * Inline Prysm release number, e.g. `v7.2.0`. Individual parts can be
 * overridden to reference an older or upcoming release line.
 */
import React from 'react';
import { PRYSM_VERSION, LINKS } from '@site/src/data/site';

interface Props {
	includeLink?: boolean;
	majorOverride?: string | number;
	minorOverride?: string | number;
	patchOverride?: string | number;
}

export default function PrysmVersion({ includeLink = false, majorOverride, minorOverride, patchOverride }: Props) {
	let [major, minor, patch] = PRYSM_VERSION.split('.');
	if (majorOverride !== undefined) major = `v${majorOverride}`;
	if (minorOverride !== undefined) minor = String(minorOverride);
	if (patchOverride !== undefined) patch = String(patchOverride);
	const version = `${major}.${minor}.${patch}`;
	return includeLink ? <a href={`${LINKS.releases}/tag/${version}`}>{version}</a> : <span>{version}</span>;
}
