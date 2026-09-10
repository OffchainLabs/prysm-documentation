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
      viewBox="0 0 1060 470" role="img" aria-label="After the Gloas fork the validator client submits builder preferences directly to configured builders, the beacon node collects execution payload bids from them and from P2P gossip, values those bids against the local block, and the winning builder reveals its payload or is blacklisted and the proposer falls back to the local block.">
  <defs>
    <marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
    <marker id="ahb2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#5b8def"/>
    </marker>
  </defs>
  <rect x="20" y="48" width="180" height="64" rx="8" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".55"/>
  <text x="110" y="76" textAnchor="middle" fontSize="12.5" fill="currentColor">v2 proposer settings</text>
  <text x="110" y="94" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".75">or keymanager API</text>

  <rect x="20" y="200" width="180" height="64" rx="8" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".55"/>
  <text x="110" y="237" textAnchor="middle" fontSize="13" fill="currentColor">Validator Client</text>

  <rect x="290" y="30" width="210" height="80" rx="8" fill="#5b8def" fillOpacity=".14" stroke="#5b8def"/>
  <text x="395" y="62" textAnchor="middle" fontSize="13" fill="currentColor">Configured builders</text>
  <text x="395" y="82" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".75">url · builder_pubkeys</text>

  <rect x="290" y="200" width="210" height="64" rx="8" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".55"/>
  <text x="395" y="237" textAnchor="middle" fontSize="13" fill="currentColor">Beacon Node</text>

  <rect x="290" y="350" width="210" height="52" rx="8" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeOpacity=".4" strokeDasharray="5 4"/>
  <text x="395" y="381" textAnchor="middle" fontSize="12" fill="currentColor" opacity=".85">P2P gossip bids</text>

  <rect x="590" y="170" width="210" height="124" rx="8" fill="#d97706" fillOpacity=".12" stroke="#d97706"/>
  <text x="695" y="199" textAnchor="middle" fontSize="12.5" fill="currentColor">Bid valuation</text>
  <text x="695" y="224" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">value + payment (capped)</text>
  <text x="695" y="243" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">≥ min_bid</text>
  <text x="695" y="262" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">× boost factor</text>
  <text x="695" y="281" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".85">vs local block</text>

  <rect x="860" y="48" width="180" height="88" rx="8" fill="#5b8def" fillOpacity=".14" stroke="#5b8def"/>
  <text x="950" y="78" textAnchor="middle" fontSize="12.5" fill="currentColor">Builder reveals</text>
  <text x="950" y="96" textAnchor="middle" fontSize="12.5" fill="currentColor">payload</text>
  <text x="950" y="118" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".75">value settled from stake</text>

  <rect x="860" y="330" width="180" height="76" rx="8" fill="#2f9e68" fillOpacity=".12" stroke="#2f9e68"/>
  <text x="950" y="362" textAnchor="middle" fontSize="12.5" fill="currentColor">Local block</text>
  <text x="950" y="380" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".8">(self-build)</text>

  <path d="M110,112 V194" stroke="currentColor" fill="none" markerEnd="url(#ah2)"/>
  <text x="124" y="158" fontSize="10.5" fill="currentColor" opacity=".8">builder config</text>

  <path d="M200,220 H250 V70 H284" stroke="#5b8def" strokeDasharray="5 4" fill="none" markerEnd="url(#ahb2)"/>
  <text x="272" y="108" fontSize="10.5" fill="currentColor" opacity=".85">signed builder</text>
  <text x="272" y="122" fontSize="10.5" fill="currentColor" opacity=".85">preferences</text>

  <path d="M395,110 V194" stroke="#5b8def" fill="none" markerEnd="url(#ahb2)"/>
  <text x="409" y="158" fontSize="10.5" fill="currentColor" opacity=".85">execution payload bids</text>

  <path d="M395,350 V270" stroke="currentColor" strokeOpacity=".6" strokeDasharray="5 4" fill="none" markerEnd="url(#ah2)"/>
  <text x="409" y="315" fontSize="10.5" fill="currentColor" opacity=".75">execution_payment = 0</text>

  <path d="M500,232 H584" stroke="currentColor" fill="none" markerEnd="url(#ah2)"/>

  <path d="M800,206 H840 V92 H854" stroke="#5b8def" fill="none" markerEnd="url(#ahb2)"/>
  <text x="850" y="170" fontSize="10.5" fill="currentColor" opacity=".85">builder wins</text>

  <path d="M800,258 H840 V368 H854" stroke="#2f9e68" fill="none" markerEnd="url(#ah2)" style={{ color: '#2f9e68' }}/>
  <text x="850" y="300" fontSize="10.5" fill="currentColor" opacity=".85">local wins</text>

  <path d="M985,136 V322" stroke="#d97706" strokeDasharray="5 4" fill="none" markerEnd="url(#ah2)" style={{ color: '#d97706' }}/>
  <text x="975" y="224" textAnchor="end" fontSize="10.5" fill="currentColor" opacity=".85">no reveal ·</text>
  <text x="975" y="238" textAnchor="end" fontSize="10.5" fill="currentColor" opacity=".85">blacklisted</text>

  <g fontSize="11" fontWeight="600" textAnchor="middle">
    <circle cx="20" cy="112" r="13" fill="#5b8def"/><text x="20" y="116" fill="#fff">1</text>
    <circle cx="250" cy="160" r="13" fill="#5b8def"/><text x="250" y="164" fill="#fff">2</text>
    <circle cx="368" cy="152" r="13" fill="#5b8def"/><text x="368" y="156" fill="#fff">3</text>
    <circle cx="590" cy="170" r="13" fill="#5b8def"/><text x="590" y="174" fill="#fff">4</text>
    <circle cx="860" cy="136" r="13" fill="#5b8def"/><text x="860" y="140" fill="#fff">5</text>
    <circle cx="985" cy="266" r="13" fill="#5b8def"/><text x="985" y="270" fill="#fff">6</text>
  </g>
</svg>
    <figcaption style={CAPTION}>
      Numbers match the steps below. Dashed lines carry no payload: builder preferences,
      gossip bids, and the failure path.
    </figcaption>
  </figure>
);
