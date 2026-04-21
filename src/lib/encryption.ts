// Thin client helpers for the server-side AES-256-GCM field encryption system.
//
// All actual encryption/decryption happens in the Postgres SECURITY DEFINER
// functions `encrypt_field` / `decrypt_field` / `hash_for_lookup`. The client
// never sees the encryption keys.
//
// Usage pattern:
//   const cipher = await encryptField(plaintext);   // -> bytea hex string for insert
//   const plain  = await decryptField(cipherHex);   // -> string for display
//
// For list views, prefer reading the plaintext mirror columns where they exist
// (e.g. profiles.email), or batch-decrypt via a server-side view if needed.

import { supabase } from '@/integrations/supabase/client';

/** Encrypts a string via the server. Returns a hex-encoded bytea suitable
 *  for direct insertion into a `bytea` column when prefixed with `\x`.
 *  Returns null for null/empty input. */
export async function encryptField(plaintext: string | null | undefined): Promise<string | null> {
  if (plaintext === null || plaintext === undefined || plaintext === '') return null;
  const { data, error } = await supabase.rpc('encrypt_field' as any, { _plaintext: plaintext });
  if (error) throw error;
  return data as string | null;
}

/** Decrypts a bytea payload (as returned by Supabase — hex string starting `\x`). */
export async function decryptField(payload: string | null | undefined): Promise<string | null> {
  if (!payload) return null;
  const { data, error } = await supabase.rpc('decrypt_field' as any, { _payload: payload });
  if (error) throw error;
  return data as string | null;
}

/** Salted SHA-256 hash for duplicate-detection / lookup without exposing plaintext. */
export async function hashForLookup(value: string | null | undefined): Promise<string | null> {
  if (value === null || value === undefined || value === '') return null;
  const { data, error } = await supabase.rpc('hash_for_lookup' as any, { _value: value });
  if (error) throw error;
  return data as string | null;
}

/** Admin-only: returns current key version, age, rotation history summary. */
export async function getEncryptionStatus() {
  const { data, error } = await supabase.rpc('get_encryption_status' as any);
  if (error) throw error;
  return data as {
    current_version: string;
    current_key_age_days: number;
    total_key_versions: number;
    last_rotation_at: string | null;
    next_scheduled_rotation: string;
  };
}
