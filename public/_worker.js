const upstream = 'https://little-fishing-bay.justin0231202.chatgpt.site';
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname !== 'angus-fishing.pages.dev') return new Response('Production hostname required', {status: 404});
    const target = new URL(upstream);
    target.pathname = url.pathname;
    target.search = url.search;
    const headers = new Headers(request.headers);
    headers.delete('host');
    if (headers.has('origin')) {
      if (headers.get('origin') !== url.origin) return new Response('Forbidden', {status: 403});
      headers.set('origin', upstream);
    }
    if (headers.has('referer')) headers.delete('referer');
    const response = await fetch(target, {method:request.method, headers, body:request.body, redirect:'manual', cache:'no-store'});
    const out = new Headers(response.headers);
    const cookies = response.headers.getSetCookie();
    out.delete('set-cookie');
    for (const cookie of cookies) out.append('set-cookie', cookie.replace(/;\s*Domain=[^;]+/ig, ''));
    const location = out.get('location');
    if (location) {
      const next = new URL(location, target);
      if (next.origin === upstream) out.set('location', url.origin + next.pathname + next.search + next.hash);
    }
    if (url.pathname.startsWith('/api/') || cookies.length) out.set('cache-control','private, no-store');
    return new Response(response.body, {status:response.status, statusText:response.statusText, headers:out});
  }
};
