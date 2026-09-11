import React from 'react';

// Flow diagrams for the builder configuration page. Hand-authored SVG rather than
// exported raster so the drawings follow the light/dark theme (strokes and text use
// currentColor) and stay reviewable in a diff. Numbered badges match the numbered
// steps in the surrounding prose - renumber both together.

const CAPTION = {
  fontSize: '0.875rem',
  opacity: 0.75,
  marginTop: '0.5rem',
  marginBottom: '1.75rem',
};

export const PreGloasBuilderFlow = () => (
  <figure style={{ margin: '0 0 1rem' }}>
    <svg
      style={{ maxWidth: "100%", height: "auto", display: "block" }}
      viewBox="0 0 920 400" role="img" aria-label="Before the Gloas fork, the validator client registers with relays through the beacon node, which then chooses between a relay's blinded block and the local execution client.">
  <defs>
    <marker id="ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
    <marker id="ahb1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#5b8def"/>
    </marker>
  </defs>

  <rect x="24" y="150" width="150" height="72" rx="8" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".55"/>
  <text x="99" y="191" textAnchor="middle" fontSize="13" fill="currentColor">Validator Client</text>

  <rect x="294" y="150" width="150" height="72" rx="8" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".55"/>
  <text x="369" y="191" textAnchor="middle" fontSize="13" fill="currentColor">Beacon Node</text>

  <path d="M524,186 L580,132 L636,186 L580,240 z" fill="#d97706" fillOpacity=".12" stroke="#d97706"/>
  <text x="580" y="182" textAnchor="middle" fontSize="11.5" fill="currentColor">Builder</text>
  <text x="580" y="196" textAnchor="middle" fontSize="11.5" fill="currentColor">configured?</text>

  <rect x="706" y="40" width="180" height="72" rx="8" fill="#2f9e68" fillOpacity=".12" stroke="#2f9e68"/>
  <text x="796" y="70" textAnchor="middle" fontSize="13" fill="currentColor">Local execution</text>
  <text x="796" y="88" textAnchor="middle" fontSize="13" fill="currentColor">client</text>

  <rect x="706" y="272" width="180" height="72" rx="8" fill="#5b8def" fillOpacity=".14" stroke="#5b8def"/>
  <text x="796" y="302" textAnchor="middle" fontSize="13" fill="currentColor">Builder via</text>
  <text x="796" y="320" textAnchor="middle" fontSize="13" fill="currentColor">relay URL</text>

  <path d="M174,170 H288" stroke="currentColor" fill="none" markerEnd="url(#ah1)"/>
  <text x="231" y="162" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".8">block request</text>

  <path d="M174,204 H288" stroke="currentColor" strokeOpacity=".7" strokeDasharray="5 4" fill="none" markerEnd="url(#ah1)"/>
  <text x="225" y="220" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".8">register validator</text>
  <text x="225" y="233" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".8">(Beacon API)</text>

  <path d="M444,186 H508" stroke="currentColor" fill="none" markerEnd="url(#ah1)"/>

  <path d="M580,132 V76 H700" stroke="#2f9e68" fill="none" markerEnd="url(#ah1)" style={{ color: '#2f9e68' }}/>
  <text x="646" y="68" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".85">no · local payload</text>

  <path d="M580,240 V308 H700" stroke="#5b8def" fill="none" markerEnd="url(#ahb1)"/>
  <text x="646" y="300" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".85">yes · getHeader</text>

  <path d="M369,222 V372 H796 V350" stroke="#5b8def" strokeOpacity=".85" strokeDasharray="5 4" fill="none" markerEnd="url(#ahb1)"/>
  <text x="560" y="388" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".8">register validator (Builder API)</text>

  <g fontSize="11" fontWeight="600" textAnchor="middle">
    <circle cx="24" cy="222" r="13" fill="#5b8def"/><text x="24" y="226" fill="#fff">1</text>
    <circle cx="294" cy="222" r="13" fill="#5b8def"/><text x="294" y="226" fill="#fff">2</text>
    <circle cx="524" cy="186" r="13" fill="#5b8def"/><text x="524" y="190" fill="#fff">3</text>
    <circle cx="706" cy="112" r="13" fill="#5b8def"/><text x="706" y="116" fill="#fff">4</text>
    <circle cx="706" cy="344" r="13" fill="#5b8def"/><text x="706" y="348" fill="#fff">5</text>
  </g>
</svg>
    <figcaption style={CAPTION}>
      Numbers match the steps below. Solid lines are block production; dashed lines are
      the periodic validator registration that ends at the Gloas fork.
    </figcaption>
  </figure>
);

export const GloasBuilderFlow = () => (
  <figure style={{ margin: '0 0 1rem' }}>
    <svg
          style={{ maxWidth: "100%", height: "auto", display: "block" }}
          viewBox="0 0 1080 600" role="img" aria-label="After the Gloas fork: the validator client holds the builder configuration and signs preferences, the beacon node forwards them to builders, collects and values execution payload bids from builders and P2P gossip against the local payload from the execution client, and blacklists builders that win but fail to reveal. Builders and the P2P network are outside the operator's infrastructure.">
      <defs>
        <marker id="ag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
        <marker id="abg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#5b8def"/></marker>
      </defs>

      <rect x="16" y="28" width="684" height="540" rx="14" fill="none" stroke="currentColor" strokeOpacity=".35" strokeDasharray="7 5"/>
      <text x="34" y="50" fontSize="11" fill="currentColor" opacity=".6" letterSpacing=".08em">RUNS ON YOUR INFRASTRUCTURE</text>

      <rect x="36" y="76" width="210" height="196" rx="10" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeOpacity=".5"/>
      <text x="50" y="98" fontSize="11.5" fontWeight="600" fill="currentColor" opacity=".85">Validator client</text>
      <rect x="50" y="112" width="182" height="56" rx="7" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".4"/>
      <text x="141" y="134" textAnchor="middle" fontSize="11.5" fill="currentColor">v2 proposer settings</text>
      <text x="141" y="151" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".75">or keymanager builder_config</text>
      <rect x="50" y="194" width="182" height="60" rx="7" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".4"/>
      <text x="141" y="217" textAnchor="middle" fontSize="11.5" fill="currentColor">Signs builder request</text>
      <text x="141" y="233" textAnchor="middle" fontSize="11.5" fill="currentColor">auths + preferences</text>
      <path d="M141,168 V188" stroke="currentColor" fill="none" markerEnd="url(#ag)"/>

      <rect x="36" y="330" width="210" height="76" rx="10" fill="#2f9e68" fillOpacity=".12" stroke="#2f9e68"/>
      <text x="141" y="360" textAnchor="middle" fontSize="12" fill="currentColor">Execution client</text>
      <text x="141" y="378" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".78">local payload · engine API</text>

      <rect x="330" y="76" width="340" height="460" rx="10" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeOpacity=".5"/>
      <text x="344" y="98" fontSize="11.5" fontWeight="600" fill="currentColor" opacity=".85">Beacon node</text>

      <rect x="344" y="112" width="312" height="88" rx="7" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".4"/>
      <text x="500" y="146" textAnchor="middle" fontSize="12" fill="currentColor">Collects execution payload bids</text>
      <text x="500" y="168" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".8">from configured builders and P2P gossip</text>
      <text x="500" y="185" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".8">checks each against consensus rules</text>

      <rect x="344" y="228" width="312" height="170" rx="7" fill="#d97706" fillOpacity=".12" stroke="#d97706"/>
      <text x="500" y="257" textAnchor="middle" fontSize="12" fill="currentColor">Values bids and picks the payload</text>
      <text x="500" y="285" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">value + execution payment,</text>
      <text x="500" y="302" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">capped by max_execution_payment</text>
      <text x="500" y="325" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">discard below min_bid</text>
      <text x="500" y="348" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">× builder_boost_factor</text>
      <text x="500" y="371" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">compare against the local payload</text>

      <rect x="344" y="426" width="312" height="92" rx="7" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".4"/>
      <text x="500" y="458" textAnchor="middle" fontSize="12" fill="currentColor">Blacklists a builder that wins</text>
      <text x="500" y="476" textAnchor="middle" fontSize="12" fill="currentColor">but never reveals its payload</text>
      <text x="500" y="498" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".8">its bids are dropped, local payload is used</text>

      <path d="M500,200 V222" stroke="currentColor" fill="none" markerEnd="url(#ag)"/>
      <path d="M500,398 V420" stroke="currentColor" strokeOpacity=".55" strokeDasharray="5 4" fill="none" markerEnd="url(#ag)"/>

      <rect x="800" y="96" width="260" height="120" rx="10" fill="#5b8def" fillOpacity=".14" stroke="#5b8def"/>
      <text x="930" y="136" textAnchor="middle" fontSize="12.5" fill="currentColor">Builders</text>
      <text x="930" y="158" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".8">on-chain identities, staked</text>
      <text x="930" y="176" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".8">reached at url · builder_pubkeys</text>
      <text x="930" y="196" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".65">outside your infrastructure</text>

      <rect x="800" y="268" width="260" height="64" rx="10" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeOpacity=".4" strokeDasharray="5 4"/>
      <text x="930" y="295" textAnchor="middle" fontSize="12" fill="currentColor" opacity=".9">P2P network</text>
      <text x="930" y="315" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".65">outside your infrastructure</text>

      <path d="M246,222 H324" stroke="currentColor" fill="none" markerEnd="url(#ag)"/>
      <text x="285" y="196" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">builder</text>
      <text x="285" y="208" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">preferences</text>

      <path d="M246,368 H324" stroke="#2f9e68" fill="none" markerEnd="url(#ag)" style={{ color: '#2f9e68' }}/>
      <text x="285" y="360" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">local payload</text>

      <path d="M676,128 H794" stroke="#5b8def" fill="none" markerEnd="url(#abg)"/>
      <text x="718" y="122" fontSize="10.5" fill="currentColor" opacity=".85">preferences</text>

      <path d="M794,170 H676" stroke="#5b8def" fill="none" markerEnd="url(#abg)"/>
      <text x="718" y="164" fontSize="10.5" fill="currentColor" opacity=".85">payload bids</text>

      <path d="M676,202 H794" stroke="#5b8def" fill="none" markerEnd="url(#abg)"/>
      <text x="718" y="219" fontSize="10.5" fill="currentColor" opacity=".85">signed block</text>

      <path d="M794,300 H676" stroke="currentColor" strokeOpacity=".55" strokeDasharray="5 4" fill="none" markerEnd="url(#ag)"/>
      <text x="718" y="294" fontSize="10.5" fill="currentColor" opacity=".75">gossip bids</text>
      <text x="718" y="316" fontSize="10.5" fill="currentColor" opacity=".75">payment = 0</text>

      <g fontSize="11" fontWeight="600" textAnchor="middle">
        <circle cx="50" cy="112" r="13" fill="#5b8def"/><text x="50" y="116" fill="#fff">1</text>
        <circle cx="285" cy="222" r="13" fill="#5b8def"/><text x="285" y="226" fill="#fff">2</text>
        <circle cx="700" cy="170" r="13" fill="#5b8def"/><text x="700" y="174" fill="#fff">3</text>
        <circle cx="344" cy="228" r="13" fill="#5b8def"/><text x="344" y="232" fill="#fff">4</text>
        <circle cx="700" cy="202" r="13" fill="#5b8def"/><text x="700" y="206" fill="#fff">5</text>
        <circle cx="344" cy="426" r="13" fill="#5b8def"/><text x="344" y="430" fill="#fff">6</text>
      </g>
    </svg>
    <figcaption style={CAPTION}>
      Numbers match the steps below. The dashed outline marks what you run: bid collection,
      valuation and blacklisting all happen inside your beacon node, and every arrow that
      crosses the outline is a call to something you do not control.
    </figcaption>
  </figure>
);
