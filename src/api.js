export const PROXY_BASE = "/proxy";

export async function apiFetch(path, { signal, headers, ...opts } = {}) {
  try {
    const res = await fetch(`${PROXY_BASE}${path}`, {
      signal,
      headers: { "Content-Type": "application/json", ...headers },
      ...opts,
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") return null;
    console.error(`API ${path}:`, e);
    return null;
  }
}
