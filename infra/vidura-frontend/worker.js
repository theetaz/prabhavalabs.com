// Serves the Vidura SPA on vidura.prabhavalabs.com by proxying the
// Cloudflare Pages deployment. Same-origin from the browser's perspective,
// so the PWA service worker and auth cookies behave normally.
const PAGES_HOST = 'vidura-5ng.pages.dev';

export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = PAGES_HOST;
    return fetch(new Request(url.toString(), request));
  },
};
