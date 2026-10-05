import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';
import { supabase } from './supabase';

export interface PanicSession {
  sessionId: string;
  userId: string;
}

let durationTimer: ReturnType<typeof setInterval> | null = null;
let activeSession: PanicSession | null = null;

export function createSession(userId: string): string {
  const sessionId = `panic_${userId}_${Date.now()}`;
  activeSession = { sessionId, userId };
  return sessionId;
}

export function startDurationCounter(onUpdate: (sec: number) => void): void {
  let count = 0;
  durationTimer = setInterval(() => {
    count++;
    onUpdate(count);
  }, 1000);
}

export function stopDurationCounter(): void {
  if (durationTimer) { clearInterval(durationTimer); durationTimer = null; }
}

const MAX_UPLOAD_RETRIES = 3;

export async function uploadVideoChunk(
  uri: string,
  sessionId: string,
  chunkNum: number,
  userId: string,
  isFinal: boolean,
  attempt = 0
): Promise<void> {
  const fileName = `${userId}/${sessionId}/chunk_${chunkNum}${isFinal ? '_final' : ''}.mp4`;
  try {
    // NOTE: clips are short (~15s) so reading into base64 is bounded. For long/HD
    // recordings, migrate to a streamed upload (FileSystem.uploadAsync to a Supabase
    // signed URL) to keep video bytes out of the JS heap on low-RAM devices.
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    // Hermes/React Native has NO global atob(); decode base64 with base64-js instead.
    const bytes = toByteArray(base64);
    const { error } = await supabase.storage
      .from('emergency-recordings')
      .upload(fileName, bytes, { contentType: 'video/mp4', upsert: false });
    if (error) throw error;
  } catch (err) {
    console.error(`Panic upload failed (chunk ${chunkNum}, attempt ${attempt + 1}/${MAX_UPLOAD_RETRIES + 1}):`, err);
    if (attempt < MAX_UPLOAD_RETRIES) {
      const delay = 2000 * (attempt + 1); // backoff: 2s, 4s, 6s
      setTimeout(
        () => uploadVideoChunk(uri, sessionId, chunkNum, userId, isFinal, attempt + 1),
        delay
      );
    }
    // After MAX_UPLOAD_RETRIES, give up on this chunk instead of retrying forever.
  }
}

export function getActiveSession(): PanicSession | null {
  return activeSession;
}

export function clearSession(): void {
  activeSession = null;
}
