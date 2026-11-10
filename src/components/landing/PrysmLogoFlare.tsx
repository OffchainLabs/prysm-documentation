/**
 * The Prysm logo with a solar flare. The logo is drawn flat, exactly as in
 * static/img/prysm-logo.svg (the official logo from prysm.offchainlabs.com). Moving the pointer lights it up: a glint with
 * streaks sits on the logo's edge facing the pointer, a sheen slides across
 * the facets, and faint lens ghosts line up on the far side. The flare grows
 * with pointer speed and fades when the pointer stops.
 *
 * Plain SVG updated from a requestAnimationFrame loop that only runs while the
 * flare is visible. The server renders the logo without a flare.
 */
import React, { useEffect, useRef } from 'react';

// The official logo's facets (static/img/prysm-logo.svg, the same file as
// prysm.offchainlabs.com), centred on the origin at half size, in drawing order.
const PIECES: [string, string][] = [
	['#1d86cc', '-0.76,19.32 69.39,19.32 34.32,60.75 -0.76,102.18 -35.83,60.75 -70.91,19.32 -0.76,19.32'],
	['#2ba1f0', '-70.91,19.32 -0.76,102.18 -47.34,73.09 -88.58,49.37 -70.91,19.32'],
	['#166599', '69.39,19.32 -0.76,102.18 47.35,73.09 88.58,49.37 69.39,19.32'],
	['#ffffff', '-47.51,-21.21 -24.11,19.32 -70.91,19.32'], // the reflection in the notch of the upper shard
	['#2ba1f0', '34.32,-41.43 -0.76,-102.18 -35.83,-41.43 -47.51,-21.21 -35.95,-1.19 -24.11,19.32 -0.76,19.32 69.39,19.32 34.32,-41.43'],
];

// Distance from the centre to the logo's outline, roughly, used to place the glint on the edge.
const RIM = 85;
const GHOSTS = [
	{ at: -0.45, r: 9, color: 'var(--prysm-violet, #8b7bff)' },
	{ at: -0.9, r: 15, color: 'var(--prysm-amber, #ffc36b)' },
	{ at: -1.35, r: 6, color: '#ffffff' },
];

export default function PrysmLogoFlare({ slot }: { slot?: number }) {
	const svgRef = useRef<SVGSVGElement>(null);
	const flareRef = useRef<SVGGElement>(null);
	const glintRef = useRef<SVGGElement>(null);
	const sheenRef = useRef<SVGCircleElement>(null);
	const ghostRefs = useRef<(SVGCircleElement | null)[]>([]);

	// A short glow at the start of every mainnet slot.
	useEffect(() => {
		const svg = svgRef.current;
		if (slot === undefined || !svg) return;
		svg.classList.remove('pulse');
		void svg.getBoundingClientRect();
		svg.classList.add('pulse');
	}, [slot]);

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let energy = 0;
		let dir = { x: -0.6, y: -0.8 };
		let last: { x: number; y: number; t: number } | null = null;
		let frame = 0;
		let running = false;
		let spin = 0;

		const draw = () => {
			energy *= 0.95;
			spin += 0.6;
			const e = Math.min(1, energy);
			const gx = dir.x * RIM;
			const gy = dir.y * RIM;
			flareRef.current?.setAttribute('opacity', e.toFixed(3));
			glintRef.current?.setAttribute('transform', `translate(${gx.toFixed(2)} ${gy.toFixed(2)}) rotate(${spin.toFixed(1)}) scale(${(0.6 + 0.6 * e).toFixed(3)})`);
			sheenRef.current?.setAttribute('cx', (dir.x * 40).toFixed(2));
			sheenRef.current?.setAttribute('cy', (dir.y * 40).toFixed(2));
			sheenRef.current?.setAttribute('opacity', (0.75 * e).toFixed(3));
			ghostRefs.current.forEach((g, i) => {
				g?.setAttribute('cx', (gx * GHOSTS[i].at).toFixed(2));
				g?.setAttribute('cy', (gy * GHOSTS[i].at).toFixed(2));
			});
			if (energy > 0.01) {
				frame = requestAnimationFrame(draw);
			} else {
				flareRef.current?.setAttribute('opacity', '0');
				sheenRef.current?.setAttribute('opacity', '0');
				running = false;
			}
		};

		const onMove = (ev: PointerEvent) => {
			const r = svg.getBoundingClientRect();
			const dx = ev.clientX - (r.left + r.width / 2);
			const dy = ev.clientY - (r.top + r.height / 2);
			const d = Math.hypot(dx, dy) || 1;
			dir = { x: dx / d, y: dy / d };
			const now = performance.now();
			if (last) {
				const dt = Math.max(8, now - last.t);
				const speed = Math.hypot(ev.clientX - last.x, ev.clientY - last.y) / dt; // px per ms
				energy = Math.min(1.6, energy + speed * 0.12);
			}
			last = { x: ev.clientX, y: ev.clientY, t: now };
			if (!running) {
				running = true;
				frame = requestAnimationFrame(draw);
			}
		};

		window.addEventListener('pointermove', onMove, { passive: true });
		return () => {
			window.removeEventListener('pointermove', onMove);
			cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<svg
			ref={svgRef}
			className="logo-flare"
			viewBox="-115 -120 230 240"
			role="img"
			aria-label="The Prysm logo, catching the light as you move your pointer"
		>
			<defs>
				<clipPath id="logo-flare-clip">
					{PIECES.map(([, pts], i) => (
						<polygon key={i} points={pts} />
					))}
				</clipPath>
				<radialGradient id="logo-flare-sheen">
					<stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
					<stop offset="0.4" stopColor="#e6f5ff" stopOpacity="0.35" />
					<stop offset="1" stopColor="#e6f5ff" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="logo-flare-core">
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.25" stopColor="#f2faff" stopOpacity="0.9" />
					<stop offset="1" stopColor="#2ba1f0" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="logo-flare-streak">
					<stop offset="0" stopColor="#ffffff" stopOpacity="0" />
					<stop offset="0.5" stopColor="#ffffff" />
					<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
				</linearGradient>
			</defs>

			<g className="logo-flare-body">
				{PIECES.map(([fill, pts], i) => (
					<polygon key={i} points={pts} fill={fill} />
				))}
			</g>

			<circle ref={sheenRef} className="logo-flare-sheen" r="55" fill="url(#logo-flare-sheen)" clipPath="url(#logo-flare-clip)" opacity="0" />

			<g ref={flareRef} className="logo-flare-light" opacity="0">
				<g ref={glintRef}>
					<circle r="26" fill="url(#logo-flare-core)" />
					<rect x="-70" y="-1.2" width="140" height="2.4" fill="url(#logo-flare-streak)" />
					<rect x="-1" y="-34" width="2" height="68" fill="url(#logo-flare-streak)" />
					<rect x="-22" y="-0.8" width="44" height="1.6" fill="url(#logo-flare-streak)" transform="rotate(45)" />
					<rect x="-22" y="-0.8" width="44" height="1.6" fill="url(#logo-flare-streak)" transform="rotate(-45)" />
				</g>
				{GHOSTS.map((g, i) => (
					<circle
						key={i}
						ref={(el) => {
							ghostRefs.current[i] = el;
						}}
						r={g.r}
						fill={g.color}
						className="logo-flare-ghost"
					/>
				))}
			</g>
		</svg>
	);
}
