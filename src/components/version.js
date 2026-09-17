import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeBlock from '@theme/CodeBlock';

// Renders a real Docusaurus code block with the current Prysm version interpolated.
// Simple:   <PrysmVersionCommand prefix="export USE_PRYSM_VERSION=" />
// Multi-line: <PrysmVersionCommand language="ini" template={`Environment = USE_PRYSM_VERSION={version}`} />
//   ({version} in `template` is replaced with the current version.)
export const PrysmVersionCommand = ({ prefix = '', template = null, language = 'bash' }) => {
  const { siteConfig } = useDocusaurusContext();
  const version = siteConfig?.customFields?.prysmVersion;
  const code = template !== null ? template.replaceAll('{version}', version) : `${prefix}${version}`;
  return <CodeBlock language={language}>{code}</CodeBlock>;
};

export const PrysmVersion = ({ includeLink = false, majorOverride = null, minorOverride = null, patchOverride = null}) => {
  const { siteConfig } = useDocusaurusContext();
  const versionString = siteConfig?.customFields?.prysmVersion;

  // Split the version string into parts
  let [major, minor, patch] = versionString.split('.');

  if (majorOverride !== null && !isNaN(majorOverride)) {
    major = majorOverride;
  }
  // Override the minor version if minorOverride is provided
  if (minorOverride !== null && !isNaN(minorOverride)) {
    minor = minorOverride;
  }
  if (patchOverride !== null && !isNaN(patchOverride)) {
    patch = patchOverride;
  }
  // Reconstruct the version string with the potential minor version override
  const version = `${major}.${minor}.${patch}`;
  const currentVersionLink = `https://github.com/OffchainLabs/prysm/releases/tag/${version}`;

  return includeLink ? (
    <span><a href={currentVersionLink} target="_blank" rel="noopener noreferrer">{version}</a></span>
  ) : (
    <span>{version}</span>
  );
};

