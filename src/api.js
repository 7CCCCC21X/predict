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

// Normalize predict.fun list responses. Tries the common shapes in
// priority order, then falls back to the first array-of-objects it can
// find within two levels of nesting.
const LIST_KEYS = [
  "markets",
  "events",
  "positions",
  "matches",
  "orders",
  "trades",
  "items",
  "results",
  "nodes",
];

export function unwrapList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  // { success, data: [...] }
  if (Array.isArray(payload.data)) return payload.data;

  // { success, data: { edges: [{node}] } }
  const d = payload.data;
  if (d && typeof d === "object") {
    if (Array.isArray(d.edges)) return d.edges.map((e) => e?.node ?? e);
    for (const k of LIST_KEYS) {
      if (Array.isArray(d[k])) return d[k];
    }
  }

  // Top-level alternates: { markets: [...] }, { result: [...] }
  for (const k of LIST_KEYS) {
    if (Array.isArray(payload[k])) return payload[k];
  }
  if (Array.isArray(payload.result)) return payload.result;
  if (Array.isArray(payload.edges)) return payload.edges.map((e) => e?.node ?? e);

  // Last resort: walk one level deeper and return the first array of
  // objects we encounter. This covers weird shapes like
  // { success, data: { someKey: { inner: [...] } } }.
  for (const v of Object.values(payload)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const vv of Object.values(v)) {
        if (Array.isArray(vv) && vv.length > 0 && typeof vv[0] === "object") {
          return vv[0]?.node ? vv.map((e) => e.node) : vv;
        }
      }
    }
  }

  return [];
}
