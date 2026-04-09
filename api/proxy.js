export default async function handler(req, res) {
  const BASE = (process.env.PREDICT_API_BASE || 'https://api.predict.fun').replace(/\/+$/, '');
  const API_KEY = process.env.PREDICT_API_KEY || '';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const host = req.headers.host || 'localhost';
    const proto =
      req.headers['x-forwarded-proto'] ||
      (host.includes('localhost') ? 'http' : 'https');

    const url = new URL(req.url, `${proto}://${host}`);

    let targetPath = url.searchParams.get('path') || '';

    if (!targetPath) {
      targetPath = url.pathname
        .replace(/^\/api\/proxy/, '')
        .replace(/^\/proxy/, '');
    }

    if (!targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }

    const searchParams = new URLSearchParams(url.search);
    searchParams.delete('path');

    const query = searchParams.toString();
    const targetUrl = `${BASE}${targetPath}${query ? `?${query}` : ''}`;

    const headers = {};

    if (API_KEY) headers['x-api-key'] = API_KEY;
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;

    const contentType = req.headers['content-type'];
    if (contentType) headers['Content-Type'] = contentType;
    else headers['Content-Type'] = 'application/json';

    const fetchOpts = {
      method: req.method || 'GET',
      headers,
    };

    if (!['GET', 'HEAD'].includes(req.method)) {
      const rawBody =
        typeof req.body === 'string' || req.body instanceof String
          ? req.body
          : req.body && Object.keys(req.body).length > 0
          ? JSON.stringify(req.body)
          : undefined;

      if (rawBody !== undefined) {
        fetchOpts.body = rawBody;
      }
    }

    const upstream = await fetch(targetUrl, fetchOpts);
    const bodyText = await upstream.text();

    const upstreamContentType = upstream.headers.get('content-type');
    if (upstreamContentType) {
      res.setHeader('Content-Type', upstreamContentType);
    }

    return res.status(upstream.status).send(bodyText);
  } catch (err) {
    return res.status(502).json({
      error: 'Proxy error',
      message: err?.message || 'Unknown error',
    });
  }
}
