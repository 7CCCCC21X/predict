export default async function handler(req, res) {
  const BASE = (process.env.PREDICT_API_BASE || 'https://api.predict.fun').replace(/\/+$/, '');
  const API_KEY = process.env.PREDICT_API_KEY || '';
  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
  const TIMEOUT_MS = Number(process.env.PROXY_TIMEOUT_MS) || 15000;

  // CORS: opt-in via ALLOWED_ORIGIN env var. Same-origin (via vercel rewrite)
  // does not need CORS, so default is no headers — prevents third parties
  // from abusing the proxy's API key.
  if (ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!API_KEY) {
    return res.status(503).json({
      error: 'Proxy misconfigured',
      message: 'PREDICT_API_KEY env var is not set for this deployment environment',
    });
  }

  try {
    const host = req.headers.host || 'localhost';
    const proto = req.headers['x-forwarded-proto'] || (host.startsWith('localhost') ? 'http' : 'https');
    const url = new URL(req.url, `${proto}://${host}`);

    let targetPath = url.searchParams.get('path') || '';
    if (!targetPath) {
      targetPath = url.pathname.replace(/^\/api\/proxy/, '').replace(/^\/proxy/, '');
    }
    if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;

    url.searchParams.delete('path');
    const query = url.searchParams.toString();
    const targetUrl = `${BASE}${targetPath}${query ? `?${query}` : ''}`;

    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };
    if (API_KEY) headers['x-api-key'] = API_KEY;
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;

    const method = req.method || 'GET';
    const fetchOpts = {
      method,
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    };

    if (method !== 'GET' && method !== 'HEAD') {
      const rawBody =
        typeof req.body === 'string'
          ? req.body
          : req.body && Object.keys(req.body).length > 0
          ? JSON.stringify(req.body)
          : undefined;
      if (rawBody !== undefined) fetchOpts.body = rawBody;
    }

    const upstream = await fetch(targetUrl, fetchOpts);
    const bodyText = await upstream.text();

    const upstreamContentType = upstream.headers.get('content-type');
    if (upstreamContentType) res.setHeader('Content-Type', upstreamContentType);

    return res.status(upstream.status).send(bodyText);
  } catch (err) {
    const aborted = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return res.status(aborted ? 504 : 502).json({
      error: aborted ? 'Upstream timeout' : 'Proxy error',
      message: err?.message || 'Unknown error',
    });
  }
}
