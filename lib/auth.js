import crypto from 'crypto';

export function createToken() {
  const secret = process.env.ADMIN_SECRET;
  const payload = JSON.stringify({
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });
  const base64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(base64).digest('hex');
  return `${base64}.${signature}`;
}

export function verifyToken(token) {
  try {
    const secret = process.env.ADMIN_SECRET;
    const [base64, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', secret).update(base64).digest('hex');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(base64, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
