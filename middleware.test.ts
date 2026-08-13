import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import middleware, {
  buildProxyRequest,
  getProxyUrl,
  UPSTREAM_BASE,
} from './middleware';

function makeRequest(
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: string } = {},
): Request {
  const headers = new Headers(init.headers);
  const request = {
    url,
    method: init.method ?? 'GET',
    headers,
    body: init.body ?? null,
  } as unknown as Request;
  return request;
}

describe('clerk proxy middleware', () => {
  beforeEach(() => {
    process.env.CLERK_SECRET_KEY = 'sk_test_secret';
    process.env.CLERK_PROXY_URL = 'https://app.example/__clerk';
  });

  afterEach(() => {
    delete process.env.CLERK_SECRET_KEY;
    delete process.env.CLERK_PROXY_URL;
    vi.restoreAllMocks();
  });

  it('rewrites /__clerk/* paths to the Clerk Frontend API', () => {
    const { url } = buildProxyRequest(
      makeRequest('https://app.example/__clerk/npm/@clerk/clerk-js/dist/clerk.browser.js'),
    );
    expect(url).toBe(`${UPSTREAM_BASE}/npm/@clerk/clerk-js/dist/clerk.browser.js`);
  });

  it('preserves the query string when rewriting', () => {
    const { url } = buildProxyRequest(
      makeRequest('https://app.example/__clerk/v1/client?devBrowserToken=abc'),
    );
    expect(url).toBe(`${UPSTREAM_BASE}/v1/client?devBrowserToken=abc`);
  });

  it('maps the bare /__clerk path to the upstream root', () => {
    const { url } = buildProxyRequest(makeRequest('https://app.example/__clerk'));
    expect(url).toBe(`${UPSTREAM_BASE}/`);
  });

  it('injects Clerk-Proxy-Url, Clerk-Secret-Key and forwards the client IP', () => {
    const { headers } = buildProxyRequest(
      makeRequest('https://app.example/__clerk/v1/client', {
        headers: { 'x-vercel-forwarded-for': '203.0.113.9', host: 'app.example' },
      }),
    );
    expect(headers.get('Clerk-Proxy-Url')).toBe('https://app.example/__clerk');
    expect(headers.get('Clerk-Secret-Key')).toBe('sk_test_secret');
    expect(headers.get('X-Forwarded-For')).toBe('203.0.113.9');
    expect(headers.get('host')).toBeNull();
  });

  it('falls back to x-forwarded-for when x-vercel-forwarded-for is absent', () => {
    const { headers } = buildProxyRequest(
      makeRequest('https://app.example/__clerk/v1/client', {
        headers: { 'x-forwarded-for': '198.51.100.4' },
      }),
    );
    expect(headers.get('X-Forwarded-For')).toBe('198.51.100.4');
  });

  it('omits the X-Forwarded-For header when no client IP is present', () => {
    const { headers } = buildProxyRequest(
      makeRequest('https://app.example/__clerk/v1/client'),
    );
    expect(headers.get('X-Forwarded-For')).toBeNull();
  });

  it('defaults the proxy URL to origin + /__clerk when unset', () => {
    delete process.env.CLERK_PROXY_URL;
    const request = makeRequest('https://app.example/__clerk/v1/client');
    expect(getProxyUrl(request)).toBe('https://app.example/__clerk');
  });

  it('forwards the request upstream and returns the fetched response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await middleware(
      makeRequest('https://app.example/__clerk/npm/@clerk/clerk-js/dist/clerk.browser.js'),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${UPSTREAM_BASE}/npm/@clerk/clerk-js/dist/clerk.browser.js`);
    expect(init.method).toBe('GET');
    expect((init.headers as Headers).get('Clerk-Proxy-Url')).toBe('https://app.example/__clerk');
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('ok');
  });

  it('streams the body and method through for non-GET/HEAD requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);

    await middleware(
      makeRequest('https://app.example/__clerk/v1/client', {
        method: 'POST',
        body: 'a=1',
      }),
    );

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).not.toBeNull();
  });

  it('uses manual redirect handling so upstream redirects pass through', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);

    await middleware(makeRequest('https://app.example/__clerk/v1/client'));

    const [, init] = fetchMock.mock.calls[0];
    expect(init.redirect).toBe('manual');
  });
});
