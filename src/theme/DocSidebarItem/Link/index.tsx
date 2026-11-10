import React, { type ComponentProps } from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import { inlineCode } from '@site/src/components/InlineCode';

type Props = ComponentProps<typeof Link>;

// Sidebar labels are plain text: render their `backticked` parts as code.
export default function DocSidebarItemLink(props: Props) {
	const { item } = props;
	return <Link {...props} item={{ ...item, label: inlineCode(item.label) as string }} />;
}
