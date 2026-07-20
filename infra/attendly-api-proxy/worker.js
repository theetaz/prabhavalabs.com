// attendly-api.prabhavalabs.com — pass-through proxy to the attendly API on
// the VPS (origin hostname lives on the junioremployer.com zone). Auth is
// Bearer-token based and the origin's CORS_ORIGINS already includes the
// prabhavalabs admin origin, so no header rewriting is needed.
const ORIGIN_HOST = 'attendly-api.junioremployer.com';

export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = ORIGIN_HOST;
    return fetch(new Request(url.toString(), request));
  },
};
