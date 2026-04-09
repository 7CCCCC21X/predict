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
