/** Custom 404: explain the reorganisation and offer the most useful pages. */
import React from 'react';
import Heading from '@theme/Heading';
import { CardGrid, LinkCard } from '@site/src/components/ui';

export default function NotFoundContent() {
	return (
		<main className="container margin-vert--xl">
			<div className="row">
				<div className="col col--8 col--offset-2">
					<Heading as="h1">Page not found</Heading>
					<p>
						This page doesn't exist, or it moved when the documentation was reorganised. Try the search bar above, or
						start from one of these:
					</p>
					<CardGrid>
						<LinkCard title="Quickstart" href="/get-started/quickstart/" description="Run a node and validator." />
						<LinkCard title="Is my node healthy?" href="/operate/check-health/" description="Check sync, peers and validator duties." />
						<LinkCard title="Command-line reference" href="/reference/cli/" description="Every flag, generated from source." />
						<LinkCard title="Get help" href="/resources/help/" description="Discord, bug reports and other resources." />
					</CardGrid>
				</div>
			</div>
		</main>
	);
}
