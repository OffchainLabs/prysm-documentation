/**
 * The MEV-Boost start command for the OS and network picked in the page's
 * <SetupPicker>, with every working relay from the EthStaker list, as in the
 * Quickstart.
 *
 *   <MevBoostCommand />
 */
import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import { RELAYS } from '@site/src/data/relays';
import type { NetworkId } from '@site/src/data/networks';
import { useSetup } from '@site/src/components/SetupPicker';

export default function MevBoostCommand() {
	const s = useSetup();
	const win = s.os === 'win';
	const cont = win ? ' `' : ' \\';
	const flags = [`-${s.net}`, '-color', '-relay-check', ...RELAYS[s.net as NetworkId].urls.map((u) => `-relay ${u}`)];
	const lines = [(win ? '.\\mev-boost.exe' : './mev-boost') + cont, ...flags.map((f, i) => '  ' + f + (i < flags.length - 1 ? cont : ''))];
	return <CodeBlock language={win ? 'powershell' : 'bash'}>{lines.join('\n')}</CodeBlock>;
}
