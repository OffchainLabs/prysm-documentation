import React from 'react';
import Layout from '@theme/Layout';
import Hero from '@site/src/components/landing/Hero';
import Landing from '@site/src/components/landing/Landing';

export default function Home() {
	return (
		<Layout
			title="Prysm documentation"
			description="Documentation for Prysm, the Ethereum consensus client written in Go. Run a beacon node, stake ETH, and find every flag and API."
		>
			<main>
				<Hero />
				<Landing />
			</main>
		</Layout>
	);
}
