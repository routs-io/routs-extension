/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict';

// ../../node_modules/.pnpm/@noble+ed25519@2.1.0/node_modules/@noble/ed25519/index.js
var P = 2n ** 255n - 19n;
var N = 2n ** 252n + 27742317777372353535851937790883648493n;
var Gx = 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an;
var Gy = 0x6666666666666666666666666666666666666666666666666666666666666658n;
var CURVE = {
    a: -1n,
    // where a=-1, d = -(121665/121666) == -(121665 * inv(121666)) mod P
    d: 37095705934669439343138083508754565189542113879843219016388785533085940283555n,
    p: P,
    n: N,
    h: 8,
    Gx,
    Gy
    // field prime, curve (group) order, cofactor
};
var err = (m = "") => {
    throw new Error(m);
};
var str = (s) => typeof s === "string";
var isu8 = (a) => a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
var au8 = (a, l) => (
    // is Uint8Array (of specific length)
    !isu8(a) || typeof l === "number" && l > 0 && a.length !== l ? err("Uint8Array of valid length expected") : a
);
var u8n = (data) => new Uint8Array(data);
var toU8 = (a, len) => au8(str(a) ? h2b(a) : u8n(au8(a)), len);
var mod = (a, b = P) => {
    let r = a % b;
    return r >= 0n ? r : b + r;
};
var isPoint = (p) => p instanceof Point ? p : err("Point expected");
var Point = class _Point {
    constructor(ex, ey, ez, et) {
        this.ex = ex;
        this.ey = ey;
        this.ez = ez;
        this.et = et;
    }
    static fromAffine(p) {
        return new _Point(p.x, p.y, 1n, mod(p.x * p.y));
    }
    static fromHex(hex, zip215 = false) {
        const { d } = CURVE;
        hex = toU8(hex, 32);
        const normed = hex.slice();
        const lastByte = hex[31];
        normed[31] = lastByte & ~128;
        const y = b2n_LE(normed);
        if (zip215 && !(0n <= y && y < 2n ** 256n))
            err("bad y coord 1");
        if (!zip215 && !(0n <= y && y < P))
            err("bad y coord 2");
        const y2 = mod(y * y);
        const u = mod(y2 - 1n);
        const v = mod(d * y2 + 1n);
        let { isValid, value: x } = uvRatio(u, v);
        if (!isValid)
            err("bad y coordinate 3");
        const isXOdd = (x & 1n) === 1n;
        const isLastByteOdd = (lastByte & 128) !== 0;
        if (!zip215 && x === 0n && isLastByteOdd)
            err("bad y coord 3");
        if (isLastByteOdd !== isXOdd)
            x = mod(-x);
        return new _Point(x, y, 1n, mod(x * y));
    }
    get x() {
        return this.toAffine().x;
    }
    // .x, .y will call expensive toAffine.
    get y() {
        return this.toAffine().y;
    }
    // Should be used with care.
    equals(other) {
        const { ex: X1, ey: Y1, ez: Z1 } = this;
        const { ex: X2, ey: Y2, ez: Z2 } = isPoint(other);
        const X1Z2 = mod(X1 * Z2), X2Z1 = mod(X2 * Z1);
        const Y1Z2 = mod(Y1 * Z2), Y2Z1 = mod(Y2 * Z1);
        return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
    }
    is0() {
        return this.equals(I);
    }
    negate() {
        return new _Point(mod(-this.ex), this.ey, this.ez, mod(-this.et));
    }
    double() {
        const { ex: X1, ey: Y1, ez: Z1 } = this;
        const { a } = CURVE;
        const A = mod(X1 * X1);
        const B = mod(Y1 * Y1);
        const C = mod(2n * mod(Z1 * Z1));
        const D = mod(a * A);
        const x1y1 = X1 + Y1;
        const E = mod(mod(x1y1 * x1y1) - A - B);
        const G2 = D + B;
        const F = G2 - C;
        const H = D - B;
        const X3 = mod(E * F);
        const Y3 = mod(G2 * H);
        const T3 = mod(E * H);
        const Z3 = mod(F * G2);
        return new _Point(X3, Y3, Z3, T3);
    }
    add(other) {
        const { ex: X1, ey: Y1, ez: Z1, et: T1 } = this;
        const { ex: X2, ey: Y2, ez: Z2, et: T2 } = isPoint(other);
        const { a, d } = CURVE;
        const A = mod(X1 * X2);
        const B = mod(Y1 * Y2);
        const C = mod(T1 * d * T2);
        const D = mod(Z1 * Z2);
        const E = mod((X1 + Y1) * (X2 + Y2) - A - B);
        const F = mod(D - C);
        const G2 = mod(D + C);
        const H = mod(B - a * A);
        const X3 = mod(E * F);
        const Y3 = mod(G2 * H);
        const T3 = mod(E * H);
        const Z3 = mod(F * G2);
        return new _Point(X3, Y3, Z3, T3);
    }
    mul(n, safe = true) {
        if (n === 0n)
            return safe === true ? err("cannot multiply by 0") : I;
        if (!(typeof n === "bigint" && 0n < n && n < N))
            err("invalid scalar, must be < L");
        if (!safe && this.is0() || n === 1n)
            return this;
        if (this.equals(G))
            return wNAF(n).p;
        let p = I, f = G;
        for (let d = this; n > 0n; d = d.double(), n >>= 1n) {
            if (n & 1n)
                p = p.add(d);
            else if (safe)
                f = f.add(d);
        }
        return p;
    }
    multiply(scalar) {
        return this.mul(scalar);
    }
    // Aliases for compatibilty
    clearCofactor() {
        return this.mul(BigInt(CURVE.h), false);
    }
    // multiply by cofactor
    isSmallOrder() {
        return this.clearCofactor().is0();
    }
    // check if P is small order
    isTorsionFree() {
        let p = this.mul(N / 2n, false).double();
        if (N % 2n)
            p = p.add(this);
        return p.is0();
    }
    toAffine() {
        const { ex: x, ey: y, ez: z } = this;
        if (this.equals(I))
            return { x: 0n, y: 1n };
        const iz = invert(z);
        if (mod(z * iz) !== 1n)
            err("invalid inverse");
        return { x: mod(x * iz), y: mod(y * iz) };
    }
    toRawBytes() {
        const { x, y } = this.toAffine();
        const b = n2b_32LE(y);
        b[31] |= x & 1n ? 128 : 0;
        return b;
    }
    toHex() {
        return b2h(this.toRawBytes());
    }
    // encode to hex string
};
Point.BASE = new Point(Gx, Gy, 1n, mod(Gx * Gy));
Point.ZERO = new Point(0n, 1n, 1n, 0n);
var { BASE: G, ZERO: I } = Point;
var padh = (num, pad) => num.toString(16).padStart(pad, "0");
var b2h = (b) => Array.from(b).map((e) => padh(e, 2)).join("");
var h2b = (hex) => {
    const l = hex.length;
    if (!str(hex) || l % 2)
        err("hex invalid 1");
    const arr = u8n(l / 2);
    for (let i = 0; i < arr.length; i++) {
        const j = i * 2;
        const h = hex.slice(j, j + 2);
        const b = Number.parseInt(h, 16);
        if (Number.isNaN(b) || b < 0)
            err("hex invalid 2");
        arr[i] = b;
    }
    return arr;
};
var n2b_32LE = (num) => h2b(padh(num, 32 * 2)).reverse();
var b2n_LE = (b) => BigInt("0x" + b2h(u8n(au8(b)).reverse()));
var concatB = (...arrs) => {
    const r = u8n(arrs.reduce((sum, a) => sum + au8(a).length, 0));
    let pad = 0;
    arrs.forEach((a) => {
        r.set(a, pad);
        pad += a.length;
    });
    return r;
};
var invert = (num, md = P) => {
    if (num === 0n || md <= 0n)
        err("no inverse n=" + num + " mod=" + md);
    let a = mod(num, md), b = md, x = 0n, u = 1n;
    while (a !== 0n) {
        const q = b / a, r = b % a;
        const m = x - u * q;
        b = a, a = r, x = u, u = m;
    }
    return b === 1n ? mod(x, md) : err("no inverse");
};
var pow2 = (x, power) => {
    let r = x;
    while (power-- > 0n) {
        r *= r;
        r %= P;
    }
    return r;
};
var pow_2_252_3 = (x) => {
    const x2 = x * x % P;
    const b2 = x2 * x % P;
    const b4 = pow2(b2, 2n) * b2 % P;
    const b5 = pow2(b4, 1n) * x % P;
    const b10 = pow2(b5, 5n) * b5 % P;
    const b20 = pow2(b10, 10n) * b10 % P;
    const b40 = pow2(b20, 20n) * b20 % P;
    const b80 = pow2(b40, 40n) * b40 % P;
    const b160 = pow2(b80, 80n) * b80 % P;
    const b240 = pow2(b160, 80n) * b80 % P;
    const b250 = pow2(b240, 10n) * b10 % P;
    const pow_p_5_8 = pow2(b250, 2n) * x % P;
    return { pow_p_5_8, b2 };
};
var RM1 = 19681161376707505956807079304988542015446066515923890162744021073123829784752n;
var uvRatio = (u, v) => {
    const v3 = mod(v * v * v);
    const v7 = mod(v3 * v3 * v);
    const pow = pow_2_252_3(u * v7).pow_p_5_8;
    let x = mod(u * v3 * pow);
    const vx2 = mod(v * x * x);
    const root1 = x;
    const root2 = mod(x * RM1);
    const useRoot1 = vx2 === u;
    const useRoot2 = vx2 === mod(-u);
    const noRoot = vx2 === mod(-u * RM1);
    if (useRoot1)
        x = root1;
    if (useRoot2 || noRoot)
        x = root2;
    if ((mod(x) & 1n) === 1n)
        x = mod(-x);
    return { isValid: useRoot1 || useRoot2, value: x };
};
var modL_LE = (hash) => mod(b2n_LE(hash), N);
var _shaS;
var sha512a = (...m) => etc.sha512Async(...m);
var sha512s = (...m) => (
    // Sync SHA512, not set by default
    typeof _shaS === "function" ? _shaS(...m) : err("etc.sha512Sync not set")
);
var hash2extK = (hashed) => {
    const head = hashed.slice(0, 32);
    head[0] &= 248;
    head[31] &= 127;
    head[31] |= 64;
    const prefix = hashed.slice(32, 64);
    const scalar = modL_LE(head);
    const point = G.mul(scalar);
    const pointBytes = point.toRawBytes();
    return { head, prefix, scalar, point, pointBytes };
};
var getExtendedPublicKeyAsync = (priv) => sha512a(toU8(priv, 32)).then(hash2extK);
var getExtendedPublicKey = (priv) => hash2extK(sha512s(toU8(priv, 32)));
var getPublicKeyAsync = (priv) => getExtendedPublicKeyAsync(priv).then((p) => p.pointBytes);
function hashFinish(asynchronous, res) {
    return sha512a(res.hashable).then(res.finish);
}
var _sign = (e, rBytes, msg) => {
    const { pointBytes: P2, scalar: s } = e;
    const r = modL_LE(rBytes);
    const R = G.mul(r).toRawBytes();
    const hashable = concatB(R, P2, msg);
    const finish = (hashed) => {
        const S = mod(r + modL_LE(hashed) * s, N);
        return au8(concatB(R, n2b_32LE(S)), 64);
    };
    return { hashable, finish };
};
var signAsync = async (msg, privKey) => {
    const m = toU8(msg);
    const e = await getExtendedPublicKeyAsync(privKey);
    const rBytes = await sha512a(e.prefix, m);
    return hashFinish(true, _sign(e, rBytes, m));
};
var dvo = { zip215: true };
var _verify = (sig, msg, pub, opts = dvo) => {
    msg = toU8(msg);
    sig = toU8(sig, 64);
    const { zip215 } = opts;
    let A, R, s, SB, hashable = new Uint8Array();
    try {
        A = Point.fromHex(pub, zip215);
        R = Point.fromHex(sig.slice(0, 32), zip215);
        s = b2n_LE(sig.slice(32, 64));
        SB = G.mul(s, false);
        hashable = concatB(R.toRawBytes(), A.toRawBytes(), msg);
    } catch (error) {
    }
    const finish = (hashed) => {
        if (SB == null)
            return false;
        if (!zip215 && A.isSmallOrder())
            return false;
        const k = modL_LE(hashed);
        const RkA = R.add(A.mul(k, false));
        return RkA.add(SB.negate()).clearCofactor().is0();
    };
    return { hashable, finish };
};
var verifyAsync = async (s, m, p, opts = dvo) => hashFinish(true, _verify(s, m, p, opts));
var cr = () => (
    // We support: 1) browsers 2) node.js 19+
    typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0
);
var etc = {
    bytesToHex: b2h,
    hexToBytes: h2b,
    concatBytes: concatB,
    mod,
    invert,
    randomBytes: (len = 32) => {
        const crypto = cr();
        if (!crypto || !crypto.getRandomValues)
            err("crypto.getRandomValues must be defined");
        return crypto.getRandomValues(u8n(len));
    },
    sha512Async: async (...messages) => {
        const crypto = cr();
        if (!crypto || !crypto.subtle)
            err("crypto.subtle or etc.sha512Async must be defined");
        const m = concatB(...messages);
        return u8n(await crypto.subtle.digest("SHA-512", m.buffer));
    },
    sha512Sync: void 0
    // Actual logic below
};
Object.defineProperties(etc, {
    sha512Sync: {
        configurable: false,
        get() {
            return _shaS;
        },
        set(f) {
            if (!_shaS)
                _shaS = f;
        }
    }
});
var utils = {
    getExtendedPublicKeyAsync,
    getExtendedPublicKey,
    randomPrivateKey: () => etc.randomBytes(32),
    precompute(w = 8, p = G) {
        p.multiply(3n);
        return p;
    }
    // no-op
};
var W = 8;
var precompute = () => {
    const points = [];
    const windows = 256 / W + 1;
    let p = G, b = p;
    for (let w = 0; w < windows; w++) {
        b = p;
        points.push(b);
        for (let i = 1; i < 2 ** (W - 1); i++) {
            b = b.add(p);
            points.push(b);
        }
        p = b.double();
    }
    return points;
};
var Gpows = void 0;
var wNAF = (n) => {
    const comp = Gpows || (Gpows = precompute());
    const neg = (cnd, p2) => {
        let n2 = p2.negate();
        return cnd ? n2 : p2;
    };
    let p = I, f = G;
    const windows = 1 + 256 / W;
    const wsize = 2 ** (W - 1);
    const mask = BigInt(2 ** W - 1);
    const maxNum = 2 ** W;
    const shiftBy = BigInt(W);
    for (let w = 0; w < windows; w++) {
        const off = w * wsize;
        let wbits = Number(n & mask);
        n >>= shiftBy;
        if (wbits > wsize) {
            wbits -= maxNum;
            n += 1n;
        }
        const off1 = off, off2 = off + Math.abs(wbits) - 1;
        const cnd1 = w % 2 !== 0, cnd2 = wbits < 0;
        if (wbits === 0) {
            f = f.add(neg(cnd1, comp[off1]));
        } else {
            p = p.add(neg(cnd2, comp[off2]));
        }
    }
    return { p, f };
};

// src/secrets.ts
var PROHIBITED_KEY_USAGES = /* @__PURE__ */ new Set([
    "decrypt",
    "deriveBits",
    "deriveKey",
    "encrypt",
    "unwrapKey",
    "wrapKey"
]);
var ED25519_PKCS8_HEADER = (
    // prettier-ignore
    [
        /**
         * PKCS#8 header
         */
        48,
        // ASN.1 sequence tag
        46,
        // Length of sequence (46 more bytes)
        2,
        // ASN.1 integer tag
        1,
        // Length of integer
        0,
        // Version number
        48,
        // ASN.1 sequence tag
        5,
        // Length of sequence
        6,
        // ASN.1 object identifier tag
        3,
        // Length of object identifier
        // Edwards curve algorithms identifier https://oid-rep.orange-labs.fr/get/1.3.101.112
        43,
        // iso(1) / identified-organization(3) (The first node is multiplied by the decimal 40 and the result is added to the value of the second node)
        101,
        // thawte(101)
        // Ed25519 identifier
        112,
        // id-Ed25519(112)
        /**
         * Private key payload
         */
        4,
        // ASN.1 octet string tag
        34,
        // String length (34 more bytes)
        // Private key bytes as octet string
        4,
        // ASN.1 octet string tag
        32
        // String length (32 bytes)
    ]
);
function bufferSourceToUint8Array(data) {
    return data instanceof Uint8Array ? data : new Uint8Array(ArrayBuffer.isView(data) ? data.buffer : data);
}
var storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT;
var publicKeyBytesStore;
function createKeyPairFromBytes(bytes, extractable, keyUsages) {
    const keyPair = createKeyPair_INTERNAL_ONLY_DO_NOT_EXPORT(extractable, keyUsages);
    const cache = storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT ||= /* @__PURE__ */ new WeakMap();
    cache.set(keyPair.privateKey, bytes);
    cache.set(keyPair.publicKey, bytes);
    return keyPair;
}
function createKeyPair_INTERNAL_ONLY_DO_NOT_EXPORT(extractable, keyUsages) {
    if (keyUsages.length === 0) {
        throw new DOMException("Usages cannot be empty when creating a key.", "SyntaxError");
    }
    if (keyUsages.some((usage) => PROHIBITED_KEY_USAGES.has(usage))) {
        throw new DOMException("Unsupported key usage for an Ed25519 key.", "SyntaxError");
    }
    const base = {
        [Symbol.toStringTag]: "CryptoKey",
        algorithm: Object.freeze({ name: "Ed25519" })
    };
    const privateKey = {
        ...base,
        extractable,
        type: "private",
        usages: Object.freeze(keyUsages.filter((usage) => usage === "sign"))
    };
    const publicKey = {
        ...base,
        extractable: true,
        type: "public",
        usages: Object.freeze(keyUsages.filter((usage) => usage === "verify"))
    };
    return Object.freeze({
        privateKey: Object.freeze(privateKey),
        publicKey: Object.freeze(publicKey)
    });
}
function getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key) {
    const secretKeyBytes = storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT?.get(key);
    if (secretKeyBytes === void 0) {
        throw new Error("Could not find secret key material associated with this `CryptoKey`");
    }
    return secretKeyBytes;
}
async function getPublicKeyBytes(key) {
    const publicKeyStore = publicKeyBytesStore ||= /* @__PURE__ */ new WeakMap();
    const fromPublicStore = publicKeyStore.get(key);
    if (fromPublicStore) return fromPublicStore;
    const publicKeyBytes = await getPublicKeyAsync(getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key));
    publicKeyStore.set(key, publicKeyBytes);
    return publicKeyBytes;
}
function base64UrlEncode(bytes) {
    return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64UrlDecode(value) {
    const m = value.length % 4;
    const base64Value = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + (m === 0 ? 0 : 4 - m), "=");
    return Uint8Array.from(atob(base64Value), (c) => c.charCodeAt(0));
}
async function exportKeyPolyfill(format, key) {
    if (key.extractable === false) {
        throw new DOMException("key is not extractable", "InvalidAccessException");
    }
    switch (format) {
        case "raw": {
            if (key.type !== "public") {
                throw new DOMException(`Unable to export a raw Ed25519 ${key.type} key`, "InvalidAccessError");
            }
            const publicKeyBytes = await getPublicKeyBytes(key);
            return publicKeyBytes;
        }
        case "pkcs8": {
            if (key.type !== "private") {
                throw new DOMException(`Unable to export a pkcs8 Ed25519 ${key.type} key`, "InvalidAccessError");
            }
            const secretKeyBytes = getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key);
            return new Uint8Array([...ED25519_PKCS8_HEADER, ...secretKeyBytes]);
        }
        case "jwk": {
            const publicKeyBytes = await getPublicKeyBytes(key);
            const base = {
                crv: "Ed25519",
                ext: key.extractable,
                key_ops: key.usages,
                kty: "OKP",
                x: base64UrlEncode(publicKeyBytes)
            };
            if (key.type === "private") {
                const secretKeyBytes = getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key);
                return Object.freeze({
                    ...base,
                    d: base64UrlEncode(secretKeyBytes)
                });
            }
            return Object.freeze({ ...base });
        }
        default:
            throw new Error(`Exporting polyfilled Ed25519 keys in the "${format}" format is unimplemented`);
    }
}
function generateKeyPolyfill(extractable, keyUsages) {
    const privateKeyBytes = utils.randomPrivateKey();
    const keyPair = createKeyPairFromBytes(privateKeyBytes, extractable, keyUsages);
    return keyPair;
}
function isPolyfilledKey(key) {
    return !!storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT?.has(key) || !!publicKeyBytesStore?.has(key);
}
async function signPolyfill(key, data) {
    if (key.type !== "private" || !key.usages.includes("sign")) {
        throw new DOMException("Unable to use this key to sign", "InvalidAccessError");
    }
    const privateKeyBytes = getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key);
    const payload = bufferSourceToUint8Array(data);
    const signature = await signAsync(payload, privateKeyBytes);
    return signature;
}
async function verifyPolyfill(key, signature, data) {
    if (key.type !== "public" || !key.usages.includes("verify")) {
        throw new DOMException("Unable to use this key to verify", "InvalidAccessError");
    }
    const publicKeyBytes = await getPublicKeyBytes(key);
    try {
        return await verifyAsync(bufferSourceToUint8Array(signature), bufferSourceToUint8Array(data), publicKeyBytes);
    } catch {
        return false;
    }
}
function assertValidKeyUsages(keyUsages, type) {
    const prohibitedKeyUses = /* @__PURE__ */ new Set([
        ...type === "private" ? ["verify"] : ["sign"],
        ...PROHIBITED_KEY_USAGES
    ]);
    if (keyUsages.some((usage) => prohibitedKeyUses.has(usage))) {
        throw new DOMException("Unsupported key usage for a Ed25519 key", "SyntaxError");
    }
}
function importKeyPolyfill(format, keyData, extractable, keyUsages) {
    if (format === "raw") {
        const bytes = bufferSourceToUint8Array(keyData);
        assertValidKeyUsages(keyUsages, "public");
        if (bytes.length !== 32) {
            throw new DOMException("Ed25519 raw keys must be exactly 32-bytes", "DataError");
        }
        const publicKey = {
            [Symbol.toStringTag]: "CryptoKey",
            algorithm: Object.freeze({ name: "Ed25519" }),
            extractable,
            type: "public",
            usages: Object.freeze(keyUsages.filter((usage) => usage === "verify"))
        };
        const cache = publicKeyBytesStore ||= /* @__PURE__ */ new WeakMap();
        cache.set(publicKey, bytes);
        return publicKey;
    }
    if (format === "pkcs8") {
        const bytes = bufferSourceToUint8Array(keyData);
        assertValidKeyUsages(keyUsages, "private");
        if (bytes.length !== 48) {
            throw new DOMException("Invalid keyData", "DataError");
        }
        const header = bytes.slice(0, 16);
        if (!header.every((val, i) => val === ED25519_PKCS8_HEADER[i])) {
            throw new DOMException("Invalid keyData", "DataError");
        }
        const secretKeyBytes = bytes.slice(16);
        const privateKey = {
            [Symbol.toStringTag]: "CryptoKey",
            algorithm: Object.freeze({ name: "Ed25519" }),
            extractable,
            type: "private",
            usages: Object.freeze(keyUsages.filter((usage) => usage === "sign"))
        };
        const cache = storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT ||= /* @__PURE__ */ new WeakMap();
        cache.set(privateKey, secretKeyBytes);
        return privateKey;
    }
    if (format === "jwk") {
        const jwk = keyData;
        const type = "d" in jwk ? "private" : "public";
        assertValidKeyUsages(keyUsages, type);
        const keyOps = new Set(jwk.key_ops ?? []);
        const sameKeyUsages = keyUsages.length === keyOps.size && [...keyUsages].every((x) => keyOps.has(x));
        if (jwk.kty !== "OKP" || jwk.crv !== "Ed25519" || jwk.ext !== extractable || !sameKeyUsages) {
            throw new DOMException("Invalid Ed25519 JWK", "DataError");
        }
        if (type === "public" && !jwk.x) {
            throw new DOMException("Ed25519 JWK is missing public key coordinates", "DataError");
        }
        if (type === "private" && !jwk.d) {
            throw new DOMException("Ed25519 JWK is missing private key coordinates", "DataError");
        }
        const usageToKeep = type === "public" ? "verify" : "sign";
        const key = Object.freeze({
            [Symbol.toStringTag]: "CryptoKey",
            algorithm: Object.freeze({ name: "Ed25519" }),
            extractable,
            type,
            usages: Object.freeze(keyUsages.filter((usage) => usage === usageToKeep))
        });
        if (type === "public") {
            const cache = publicKeyBytesStore ||= /* @__PURE__ */ new WeakMap();
            cache.set(key, base64UrlDecode(jwk.x));
        } else {
            const cache = storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT ||= /* @__PURE__ */ new WeakMap();
            cache.set(key, base64UrlDecode(jwk.d));
        }
        return key;
    }
    throw new Error(`Importing Ed25519 keys in the "${format}" format is unimplemented`);
}

// src/install.ts
export function install() {
    if (globalThis.isSecureContext) {
        const originalCryptoObject = globalThis.crypto ||= {};
        const originalSubtleCrypto = originalCryptoObject.subtle ||= {};
        const originalExportKey = originalSubtleCrypto.exportKey;
        originalSubtleCrypto.exportKey = async (...args) => {
            const [_, key] = args;
            if (isPolyfilledKey(key)) {
                return await exportKeyPolyfill(...args);
            } else if (originalExportKey) {
                return await originalExportKey.apply(originalSubtleCrypto, args);
            } else {
                throw new TypeError("No native `exportKey` function exists to handle this call");
            }
        };
        const originalGenerateKey = originalSubtleCrypto.generateKey;
        let originalGenerateKeySupportsEd25519;
        originalSubtleCrypto.generateKey = async (...args) => {
            const [algorithm] = args;
            if (algorithm !== "Ed25519") {
                if (originalGenerateKey) {
                    return await originalGenerateKey.apply(originalSubtleCrypto, args);
                } else {
                    throw new TypeError("No native `generateKey` function exists to handle this call");
                }
            }
            let optimisticallyGeneratedKeyPair;
            if (originalGenerateKeySupportsEd25519 === void 0) {
                originalGenerateKeySupportsEd25519 = new Promise((resolve) => {
                    if (!originalGenerateKey) {
                        resolve(originalGenerateKeySupportsEd25519 = false);
                        return;
                    }
                    originalGenerateKey.apply(originalSubtleCrypto, args).then((keyPair) => {
                        if (process.env.NODE_ENV !== "production") {
                            console.warn(
                                "`@solana/webcrypto-ed25519-polyfill` was installed in an environment that supports Ed25519 key manipulation natively. Falling back to the native implementation. Consider installing this polyfill only in environments where Ed25519 is not supported."
                            );
                        }
                        if (originalSubtleCrypto.generateKey !== originalGenerateKey) {
                            originalSubtleCrypto.generateKey = originalGenerateKey;
                        }
                        optimisticallyGeneratedKeyPair = keyPair;
                        resolve(originalGenerateKeySupportsEd25519 = true);
                    }).catch(() => {
                        resolve(originalGenerateKeySupportsEd25519 = false);
                    });
                });
            }
            if (typeof originalGenerateKeySupportsEd25519 === "boolean" ? originalGenerateKeySupportsEd25519 : await originalGenerateKeySupportsEd25519) {
                if (optimisticallyGeneratedKeyPair) {
                    return optimisticallyGeneratedKeyPair;
                } else if (originalGenerateKey) {
                    return await originalGenerateKey.apply(originalSubtleCrypto, args);
                } else {
                    throw new TypeError("No native `generateKey` function exists to handle this call");
                }
            } else {
                const [_, extractable, keyUsages] = args;
                return generateKeyPolyfill(extractable, keyUsages);
            }
        };
        const originalSign = originalSubtleCrypto.sign;
        originalSubtleCrypto.sign = async (...args) => {
            const [_, key] = args;
            if (isPolyfilledKey(key)) {
                const [_2, ...rest] = args;
                return await signPolyfill(...rest);
            } else if (originalSign) {
                return await originalSign.apply(originalSubtleCrypto, args);
            } else {
                throw new TypeError("No native `sign` function exists to handle this call");
            }
        };
        const originalVerify = originalSubtleCrypto.verify;
        originalSubtleCrypto.verify = async (...args) => {
            const [_, key] = args;
            if (isPolyfilledKey(key)) {
                const [_2, ...rest] = args;
                return await verifyPolyfill(...rest);
            } else if (originalVerify) {
                return await originalVerify.apply(originalSubtleCrypto, args);
            } else {
                throw new TypeError("No native `verify` function exists to handle this call");
            }
        };
        const originalImportKey = originalSubtleCrypto.importKey;
        let originalImportKeySupportsEd25519;
        originalSubtleCrypto.importKey = async (...args) => {
            const [format, keyData, algorithm] = args;
            if (algorithm !== "Ed25519") {
                if (originalImportKey) {
                    return await originalImportKey.apply(originalSubtleCrypto, args);
                } else {
                    throw new TypeError("No native `importKey` function exists to handle this call");
                }
            }
            let optimisticallyImportedKey;
            if (originalImportKeySupportsEd25519 === void 0) {
                originalImportKeySupportsEd25519 = new Promise((resolve) => {
                    if (!originalImportKey) {
                        resolve(originalImportKeySupportsEd25519 = false);
                        return;
                    }
                    originalImportKey.apply(originalSubtleCrypto, args).then((key) => {
                        if (process.env.NODE_ENV !== "production") {
                            console.warn(
                                "`@solana/webcrypto-ed25519-polyfill` was included in an environment that supports Ed25519 key manipulation natively. Falling back to the native implementation. Consider including this polyfill only in environments where Ed25519 is not supported."
                            );
                        }
                        if (originalSubtleCrypto.importKey !== originalImportKey) {
                            originalSubtleCrypto.importKey = originalImportKey;
                        }
                        optimisticallyImportedKey = key;
                        resolve(originalImportKeySupportsEd25519 = true);
                    }).catch(() => {
                        resolve(originalImportKeySupportsEd25519 = false);
                    });
                });
            }
            if (typeof originalImportKey === "boolean" ? originalImportKeySupportsEd25519 : await originalImportKeySupportsEd25519) {
                if (optimisticallyImportedKey) {
                    return optimisticallyImportedKey;
                } else if (originalImportKey) {
                    return await originalImportKey.apply(originalSubtleCrypto, args);
                } else {
                    throw new TypeError("No native `importKey` function exists to handle this call");
                }
            } else {
                const [_format, _keyData, _algorithm, extractable, keyUsages] = args;
                return importKeyPolyfill(format, keyData, extractable, keyUsages);
            }
        };
    }
}
/*! Bundled license information:

@noble/ed25519/index.js:
  (*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) *)
*/