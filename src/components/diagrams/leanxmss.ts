/**
 * leanXMSS hashing, as in the leanXMSS note (leanEthereum/leanVM,
 * doc/lean_xmss/main.tex at 4af2cdd): the tweakable hash Th, the 16-byte
 * addresses, and the derivation of every secret from the 32-byte seed.
 */
import { keccak_256 } from '@noble/hashes/sha3';

export const V = 58; // chains per one-time key
export const T = 106; // sum of a codeword's digits
export const H = 16; // height of each layer's trees

export const concat = (...parts: Uint8Array[]) => {
	const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
};

export const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
export const unhex = (s: string) => {
	const t = s.replace(/^0x/, '');
	return Uint8Array.from({ length: t.length / 2 }, (_, i) => parseInt(t.slice(2 * i, 2 * i + 2), 16));
};

/** Little-endian encoding of z on n bytes. */
export const le = (z: number | bigint, n: number) => {
	let v = BigInt(z);
	const out = new Uint8Array(n);
	for (let i = 0; i < n; i++) {
		out[i] = Number(v & 0xffn);
		v >>= 8n;
	}
	return out;
};

/** Address types. */
export const TYPE = { prf: 0, chain: 1, leaf: 2, node: 3, param: 5, rnd: 7, msg: 12 } as const;

/** enc(τ, μ, hi, lo) = LE32(lo) ‖ LE24(hi) ‖ LE8(τ + 32μ) ‖ 8 zero bytes. */
export const enc = (type: number, mu: number, hi: number, lo: number) =>
	concat(le(lo, 4), le(hi, 3), le(type + 32 * mu, 1), new Uint8Array(8));

/** hi_ℓ(a) = a + 2²³·ℓ: the top layer sets bit 23. */
const hiL = (layer: number, a: number) => a + 2 ** 23 * layer;

export const addr = {
	prf: (layer: number, e: number, j: number) => enc(TYPE.prf, 0, hiL(layer, j), e),
	chain: (layer: number, e: number, mu: number) => enc(TYPE.chain, mu, hiL(layer, 0), e),
	leaf: (layer: number, e: number) => enc(TYPE.leaf, 0, hiL(layer, 0), e),
	node: (layer: number, level: number, j: number) => enc(TYPE.node, 0, hiL(layer, level), j),
	param: () => enc(TYPE.param, 0, 0, 0),
	rnd: (layer: number, e: number) => enc(TYPE.rnd, 0, hiL(layer, 0), e),
	msg: (layer: number, e: number) => enc(TYPE.msg, 0, hiL(layer, 0), e),
};

/** Th(P, A, M) = first 16 bytes of Keccak-256(P ‖ A ‖ M). */
export const th = (p: Uint8Array, a: Uint8Array, m: Uint8Array) => keccak_256(concat(p, a, m)).slice(0, 16);

/** S = Keccak-256("leanXMSS" ‖ S0). */
export const schemeSeed = (s0: Uint8Array) => keccak_256(concat(new TextEncoder().encode('leanXMSS'), s0));

/** P = Th(0¹²⁸, A_param, S). */
export const param = (s: Uint8Array) => th(new Uint8Array(16), addr.param(), s);

/** One prf call: Keccak-256(P ‖ A_prf(ℓ, e, j) ‖ S). Its halves start chains 2j and 2j + 1. */
export const prf = (p: Uint8Array, s: Uint8Array, layer: number, e: number, j: number) =>
	keccak_256(concat(p, addr.prf(layer, e, j), s));

/** Chain i of key e, all 4 positions. */
export function chain(p: Uint8Array, s: Uint8Array, layer: number, e: number, i: number): Uint8Array[] {
	const out = prf(p, s, layer, e, Math.floor(i / 2));
	const x = [i % 2 === 0 ? out.slice(0, 16) : out.slice(16)];
	for (let mu = 0; mu < 3; mu++) x.push(th(p, addr.chain(layer, e, mu), concat(x[mu], le(i, 16))));
	return x;
}

/** One chain step from position mu: Th(P, A_chain(ℓ, e, μ), x ‖ LE128(i)). */
export const chainStep = (p: Uint8Array, layer: number, e: number, mu: number, i: number, x: Uint8Array) =>
	th(p, addr.chain(layer, e, mu), concat(x, le(i, 16)));

/** The 64 base-4 digits of a 16-byte digest, smallest first. */
export const digits = (d: Uint8Array) => {
	const out: number[] = [];
	for (const b of d) out.push(b & 3, (b >> 2) & 3, (b >> 4) & 3, (b >> 6) & 3);
	return out;
};

export const isCodeword = (ds: number[]) =>
	ds.slice(V).every((x) => x === 0) && ds.slice(0, V).reduce((a, b) => a + b, 0) === T;

export type Verification = {
	ok: boolean;
	why: string;
	idx?: number;
	b?: number;
	bottomSum?: number;
	bottomZeros?: boolean;
	bottomRoot?: Uint8Array;
	topSum?: number;
	topZeros?: boolean;
	topRoot?: Uint8Array;
	root?: Uint8Array;
};

/** Verify a 2,404-byte signature against a 32-byte public key (root ‖ P) and a 32-byte message, step by step. */
export function verifyDetailed(pk: Uint8Array, m: Uint8Array, sig: Uint8Array): Verification {
	if (pk.length !== 32) return { ok: false, why: 'The public key must be 32 bytes.' };
	if (m.length !== 32) return { ok: false, why: 'The message must be 32 bytes.' };
	if (sig.length !== 2404) return { ok: false, why: 'The signature must be 2,404 bytes.' };
	const root = pk.slice(0, 16);
	const p = pk.slice(16);
	const idx = sig[0] + sig[1] * 2 ** 8 + sig[2] * 2 ** 16 + sig[3] * 2 ** 24;
	const b = Math.floor(idx / 2 ** H);
	const layerSig = (o: number) => ({
		rho: sig.slice(o, o + 16),
		y: Array.from({ length: V }, (_, i) => sig.slice(o + 16 + 16 * i, o + 32 + 16 * i)),
		path: Array.from({ length: H }, (_, l) => sig.slice(o + 16 + 16 * V + 16 * l, o + 32 + 16 * V + 16 * l)),
	});
	const encode = (layer: number, e: number, msg: Uint8Array, rho: Uint8Array) => {
		const ds = digits(th(p, addr.msg(layer, e), concat(msg, rho)));
		return { ds, sum: ds.slice(0, V).reduce((a, x) => a + x, 0), zeros: ds.slice(V).every((x) => x === 0) };
	};
	const leafOf = (layer: number, e: number, ds: number[], y: Uint8Array[]) => {
		const ends = y.map((v, i) => {
			let x = v;
			for (let mu = ds[i]; mu < 3; mu++) x = chainStep(p, layer, e, mu, i, x);
			return x;
		});
		return th(p, addr.leaf(layer, e), concat(...ends));
	};
	const fold = (layer: number, e: number, leaf: Uint8Array, path: Uint8Array[]) => {
		let v = leaf;
		for (let l = 0; l < H; l++) {
			// e can reach 2³², past the 32-bit range of JavaScript's bit operators.
			const pair = Math.floor(e / 2 ** l) % 2 ? concat(path[l], v) : concat(v, path[l]);
			v = th(p, addr.node(layer, l + 1, Math.floor(e / 2 ** (l + 1))), pair);
		}
		return v;
	};
	const s0 = layerSig(4);
	const s1 = layerSig(4 + 1200);
	const r: Verification = { ok: false, why: '', idx, b, root };
	const e0 = encode(0, idx, m, s0.rho);
	r.bottomSum = e0.sum;
	r.bottomZeros = e0.zeros;
	if (!e0.zeros || e0.sum !== T) return { ...r, why: 'The bottom digest is not a codeword.' };
	r.bottomRoot = fold(0, idx, leafOf(0, idx, e0.ds, s0.y), s0.path);
	const e1 = encode(1, b, r.bottomRoot, s1.rho);
	r.topSum = e1.sum;
	r.topZeros = e1.zeros;
	if (!e1.zeros || e1.sum !== T) return { ...r, why: 'The top digest is not a codeword.' };
	r.topRoot = fold(1, b, leafOf(1, b, e1.ds, s1.y), s1.path);
	const ok = hex(r.topRoot) === hex(root);
	return { ...r, ok, why: ok ? 'The climb ends at the root in the public key.' : 'The climb ends somewhere other than the root in the public key.' };
}

export const verify = (pk: Uint8Array, m: Uint8Array, sig: Uint8Array) => verifyDetailed(pk, m, sig).ok;
