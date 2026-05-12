import { randomBytes } from 'node:crypto';

// 31 chars, no ambiguous 0/O/1/I/L
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Largest multiple of ALPHABET.length (31) ≤ 255 is 248. Bytes >= 248 would
// skew the distribution (positions 0..7 would be slightly over-represented),
// so we reject them and draw again.
const MAX_UNBIASED = Math.floor(256 / ALPHABET.length) * ALPHABET.length;

export function generateReferralCode(length = 8): string {
  const out: string[] = [];
  while (out.length < length) {
    // Oversample so the common case produces no extra syscalls: at 31 accept
    // bands out of 256, expected acceptance rate per byte is ~96.9%.
    const bytes = randomBytes(length);
    for (const b of bytes) {
      if (b >= MAX_UNBIASED) continue; // reject biased byte
      out.push(ALPHABET[b % ALPHABET.length] ?? 'A');
      if (out.length === length) break;
    }
  }
  return out.join('');
}
