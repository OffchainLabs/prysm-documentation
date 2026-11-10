import React, { type ComponentProps } from 'react';
import PaginatorNavLink from '@theme-original/PaginatorNavLink';
import { inlineCode } from '@site/src/components/InlineCode';

type Props = ComponentProps<typeof PaginatorNavLink>;

// Previous/next links show the sidebar label: render its `backticked` parts as code.
export default function PaginatorNavLinkWrapper(props: Props) {
	return <PaginatorNavLink {...props} title={inlineCode(props.title) as string} />;
}
