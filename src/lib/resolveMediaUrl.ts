import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a stored media url string to a playable URL.
 * - `storage:resources/<path>` → signed URL from the private `resources` bucket.
 * - `storage:<bucket>/<path>` → signed URL from `<bucket>`.
 * - http(s):// or any other URL → returned as-is.
 */
export async function resolveMediaUrl(url: string | null | undefined, ttlSeconds = 3600): Promise<string> {
  if (!url) return "";
  if (!url.startsWith("storage:")) return url;
  const rest = url.slice("storage:".length); // "<bucket>/<path>"
  const slash = rest.indexOf("/");
  if (slash < 0) return url;
  const bucket = rest.slice(0, slash);
  const path = rest.slice(slash + 1);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, ttlSeconds);
  if (error || !data?.signedUrl) {
    console.warn("resolveMediaUrl failed", url, error);
    return "";
  }
  return data.signedUrl;
}
