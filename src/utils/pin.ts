import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const PIN_HASH_KEY = 'kanoonai_pin_hash';
const PIN_SALT_KEY = 'kanoonai_pin_salt';
const PIN_ATTEMPTS_KEY = 'kanoonai_pin_attempts';

// Light key-stretching. expo-crypto exposes no PBKDF2/argon2, and every digest call
// crosses the native bridge, so this is a deliberately modest cost factor that keeps
// emergency PIN entry snappy. For production-grade stretching, add a native PBKDF2.
const HASH_ITERATIONS = 100;

// Brute-force throttling — a 4-digit PIN has only ~10,000 combinations.
const MAX_ATTEMPTS = 5;              // consecutive failures before a cooldown kicks in
const BASE_LOCKOUT_MS = 30_000;     // 30s, grows each time the limit is hit again
const MAX_LOCKOUT_MS = 15 * 60_000; // capped at 15 minutes

// Legacy (pre-hardening) static salt — used ONLY to verify and transparently upgrade
// PINs that were created before per-install salting existed. Never used for new PINs.
const LEGACY_SALT = 'kanoonai_salt';

export interface PinVerifyResult {
  success: boolean;
  locked: boolean;
  /** Remaining lockout time in ms, when `locked` is true. */
  lockedForMs?: number;
  /** Attempts left before the next cooldown, when not locked. */
  remainingAttempts?: number;
}

interface AttemptState {
  fails: number;
  lockoutUntil: number;
}

async function randomSaltHex(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function stretch(pin: string, salt: string): Promise<string> {
  let h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin + salt);
  for (let i = 1; i < HASH_ITERATIONS; i++) {
    h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, h + salt);
  }
  return h;
}

async function readAttempts(): Promise<AttemptState> {
  const raw = await SecureStore.getItemAsync(PIN_ATTEMPTS_KEY);
  if (!raw) return { fails: 0, lockoutUntil: 0 };
  try {
    const parsed = JSON.parse(raw);
    return {
      fails: typeof parsed.fails === 'number' ? parsed.fails : 0,
      lockoutUntil: typeof parsed.lockoutUntil === 'number' ? parsed.lockoutUntil : 0,
    };
  } catch {
    return { fails: 0, lockoutUntil: 0 };
  }
}

async function writeAttempts(state: AttemptState): Promise<void> {
  await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, JSON.stringify(state));
}

async function resetAttempts(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_ATTEMPTS_KEY);
}

export async function setPIN(pin: string): Promise<void> {
  const salt = await randomSaltHex();
  const hash = await stretch(pin, salt);
  await SecureStore.setItemAsync(PIN_SALT_KEY, salt);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
  await resetAttempts();
}

export async function verifyPIN(pin: string): Promise<PinVerifyResult> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (!stored) return { success: false, locked: false };

  // Respect any active cooldown before doing any work.
  const attempts = await readAttempts();
  const now = Date.now();
  if (attempts.lockoutUntil > now) {
    return { success: false, locked: true, lockedForMs: attempts.lockoutUntil - now };
  }

  // Verify against the per-install salt; if a PIN predates salting, fall back to the
  // legacy static salt and transparently upgrade it to the new scheme on success.
  const salt = await SecureStore.getItemAsync(PIN_SALT_KEY);
  let ok = false;
  if (salt) {
    ok = (await stretch(pin, salt)) === stored;
  } else {
    const legacy = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin + LEGACY_SALT
    );
    if (legacy === stored) {
      ok = true;
      await setPIN(pin); // migrate to salted + stretched storage
    }
  }

  if (ok) {
    await resetAttempts();
    return { success: true, locked: false };
  }

  // Wrong PIN — count it and apply an escalating cooldown at each threshold.
  const fails = attempts.fails + 1;
  let lockoutUntil = 0;
  let locked = false;
  if (fails % MAX_ATTEMPTS === 0) {
    const lockouts = Math.floor(fails / MAX_ATTEMPTS);
    lockoutUntil = now + Math.min(BASE_LOCKOUT_MS * lockouts, MAX_LOCKOUT_MS);
    locked = true;
  }
  await writeAttempts({ fails, lockoutUntil });

  return {
    success: false,
    locked,
    lockedForMs: locked ? lockoutUntil - now : undefined,
    remainingAttempts: MAX_ATTEMPTS - (fails % MAX_ATTEMPTS),
  };
}

export async function hasPIN(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  return !!stored;
}
