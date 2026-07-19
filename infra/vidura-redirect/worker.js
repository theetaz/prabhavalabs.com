// Branded entry point for Vidura: vidura.prabhavalabs.com currently 301s to
// the app's canonical home, preserving path and query. Swap this for a Pages
// custom domain if/when the app migrates fully to prabhavalabs.com.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'vidura.nipuntheekshana.com';
    return Response.redirect(url.toString(), 301);
  },
};
