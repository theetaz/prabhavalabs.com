// Edge worker for prabhavalabs.com: serves the static site and a small
// same-origin API. Currently one endpoint — newsletter subscriptions into D1.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function handleSubscribe(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  // Honeypot: real users never fill the hidden "website" field.
  if (body.website) return json({ ok: true }, 200);

  const email = String(body.email ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 254);
  if (!EMAIL_RE.test(email)) {
    return json({ error: 'That does not look like an email address' }, 422);
  }

  try {
    await env.DB.prepare(
      'INSERT OR IGNORE INTO subscribers (email, created_at, source) VALUES (?1, ?2, ?3)'
    )
      .bind(email, new Date().toISOString(), 'site-footer')
      .run();
  } catch (err) {
    console.error('subscribe failed', err);
    return json({ error: 'Something broke on our side. Try again later.' }, 500);
  }

  return json({ ok: true }, 200);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
