import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// fork: name of the fork a page's main content needs (for example "Gloas"). Renders a
// highlighted "Requires <fork>" badge linking to the page's #requires-<fork> anchor.
export const HeaderBadgesWidget = ({ commaDelimitedContributors, fork }) => {
	let githubUsernames = {
		Radek: "rkapka",
		Sammy: "saolyn",
		Raul: "rauljordan",
		Terence: "terencechain",
		James: "james-prysm",
		Kasey: "kasey",
		Potuz: "potuz",
		Nishant: "nisdas",
		Manu: "nalepae"
	};

	let buildAuthorBadge = function (authorNickname, index) {
		return (
			<a key={index} className="header-badge" href={`https://github.com/${githubUsernames[authorNickname]}`}>
				<span className="badge-avatar" style={{ backgroundImage: "url('https://avatars.githubusercontent.com/" + githubUsernames[authorNickname] + "')" }}></span>
				<span className="badge-label">{authorNickname}</span>
			</a>
		);
	};

	return (
		<BrowserOnly>
			{() =>
				<div className="header-badges">
					{(fork != null ?
						<a className="header-badge fork-badge" href={`#requires-${fork.toLowerCase()}`} title={`The builder settings on this page need the ${fork} fork`}>
							<span className="badge-avatar emoji-avatar">🔀</span>
							<span className="badge-label">Requires {fork}</span>
						</a> : null)}
					{(commaDelimitedContributors != null ? commaDelimitedContributors.split(',').map((contributor, index) => buildAuthorBadge(contributor, index)) : null)}
					<a className="header-badge" href={`https://github.com/OffchainLabs/prysm-documentation/issues/new?title=Docs update request: ${new URL(window.location.href).pathname}&body=Source: ${window.location.href}%0A%0ARequest: (how can we help?)`}>
						<span className="badge-avatar emoji-avatar">✏️</span>
						<span className="badge-label">Request an update</span>
					</a>
				</div>
			}
		</BrowserOnly>
	);
};
