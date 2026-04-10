export const PROXY_BASE = "/proxy";

export async function apiFetch(path, { signal, headers, ...opts } = {}) {
  const res = await fetch(`${PROXY_BASE}${path}`, {
    signal,
    headers: { "Content-Type": "application/json", ...headers },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${text ? ` · ${text.slice(0, 120)}` : ""}`);
  }
  return res.json();
}

// Normalize predict.fun list responses. They come in a few shapes:
//   { success, data: [...] }
//   { success, data: { edges: [{ node: ... }], pageInfo } }
//   raw array (rare / legacy)
export function unwrapList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const d = payload.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.edges)) return d.edges.map((e) => e?.node ?? e);
  if (Array.isArray(d?.items)) return d.items;
  return [];
}
