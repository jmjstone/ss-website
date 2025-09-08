// lib/promo.ts
import { createHmac, timingSafeEqual } from 'crypto';

export type PromoPayload = {
  pid: string; // product id
  pct: number; // % discount (e.g. 10)
  exp: number; // expiry epoch ms
  oid?: string; // optional: order id (or payment_intent_id)
  iat: number; // issued at
};

function b64urlEncode(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64urlDecode(str: string) {
  const pad = 4 - (str.length % 4 || 4);
  const s = str.replace(/-/g, '+').replace(/_/g, '/') + (pad ? '='.repeat(pad) : '');
  return Buffer.from(s, 'base64');
}

export function signPromo(payload: PromoPayload, secret: string) {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(Buffer.from(payloadJson));
  const sig = createHmac('sha256', secret).update(payloadB64).digest();
  const sigB64 = b64urlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export function verifyPromo(
  token: string,
  secret: string,
): { valid: true; payload: PromoPayload } | { valid: false; reason: string } {
  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return { valid: false, reason: 'malformed' };

    const expected = createHmac('sha256', secret).update(payloadB64).digest();
    const provided = b64urlDecode(sigB64);

    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
      return { valid: false, reason: 'bad_sig' };
    }

    const payloadJson = b64urlDecode(payloadB64).toString('utf8');
    const payload = JSON.parse(payloadJson) as PromoPayload;

    if (!payload.pid || typeof payload.pct !== 'number' || !payload.exp) {
      return { valid: false, reason: 'bad_payload' };
    }
    if (Date.now() > payload.exp) return { valid: false, reason: 'expired' };

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'exception' };
  }
}
