// API proxy for the prabhavalabs.com side of Vidura.
//
// The Vidura API lives at vidura-api.nipuntheekshana.com (VPS behind
// Cloudflare) and its auth cookies are SameSite=Lax, which requires the
// frontend and API to share a registrable domain. This worker gives the
// vidura.prabhavalabs.com frontend a same-site API host by forwarding to the
// origin API and translating the domain-specific parts:
//
//   request:  Origin/Referer  prabhavalabs.com -> nipuntheekshana.com
//   response: Set-Cookie      Domain attribute stripped (host-only cookie)
//             CORS + Location nipuntheekshana.com -> prabhavalabs.com
//
// Once the origin server itself trusts both web origins (WEB_ORIGINS), the
// request-side rewrites become harmless no-ops.

const ORIGIN_API_HOST = 'vidura-api.nipuntheekshana.com';
const OLD_WEB = 'https://vidura.nipuntheekshana.com';
const NEW_WEB = 'https://vidura.prabhavalabs.com';
const OLD_API = 'https://vidura-api.nipuntheekshana.com';
const NEW_API = 'https://vidura-api.prabhavalabs.com';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = ORIGIN_API_HOST;

    const headers = new Headers(request.headers);
    if (headers.get('Origin') === NEW_WEB) headers.set('Origin', OLD_WEB);
    const referer = headers.get('Referer');
    if (referer && referer.startsWith(NEW_WEB)) {
      headers.set('Referer', referer.replace(NEW_WEB, OLD_WEB));
    }

    const upstream = await fetch(
      new Request(url.toString(), {
        method: request.method,
        headers,
        body: request.body,
        redirect: 'manual',
      })
    );

    const out = new Headers(upstream.headers);

    const cookies = upstream.headers.getSetCookie?.() ?? [];
    if (cookies.length) {
      out.delete('Set-Cookie');
      for (const cookie of cookies) {
        out.append('Set-Cookie', cookie.replace(/;\s*Domain=[^;]*/i, ''));
      }
    }

    if (out.get('Access-Control-Allow-Origin') === OLD_WEB) {
      out.set('Access-Control-Allow-Origin', NEW_WEB);
    }

    const location = out.get('Location');
    if (location) {
      out.set(
        'Location',
        location.replaceAll(OLD_API, NEW_API).replaceAll(OLD_WEB, NEW_WEB)
      );
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: out,
    });
  },
};
