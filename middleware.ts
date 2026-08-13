export const config = {
  matcher: '/__clerk/:path*',
};

export const UPSTREAM_BASE = 'https://frontend-api.clerk.dev';

export function getProxyUrl(request: Request): string {
  return process.env.CLERK_PROXY_URL ?? `${new URL(request.url).origin}/__clerk`;
}

export function buildProxyRequest(request: Request): { url: string; headers: Headers } {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/__clerk/, '') || '/';
  const target = new URL(path + url.search, UPSTREAM_BASE);

  const headers = new Headers(request.headers);
  headers.set('Clerk-Proxy-Url', getProxyUrl(request));
  headers.set('Clerk-Secret-Key', process.env.CLERK_SECRET_KEY ?? '');
  const clientIp =
    request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for');
  if (clientIp) {
    headers.set('X-Forwarded-For', clientIp);
  }
  headers.delete('host');

  return { url: target.toString(), headers };
}

export default async function middleware(request: Request): Promise<Response> {
  const { url, headers } = buildProxyRequest(request);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  return fetch(url, init);
}
