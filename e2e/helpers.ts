import { APIRequestContext, Page, expect } from '@playwright/test';

export async function registerAndLogin(request: APIRequestContext, page: Page, suffix: string) {
  const username = `user_${suffix}`;
  const email = `${username}@example.com`;
  const password = 'Passw0rd!';

  await request.post('http://localhost:8080/auth/register', {
    data: { username, email, password }
  });

  const login = await request.post('http://localhost:8080/auth/login', {
    data: { username, password }
  });
  expect(login.ok()).toBeTruthy();
  const body = await login.json();

  await page.addInitScript(({ token, username: user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user);

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      (this as any).__requestUrl = String(url || '');
      return originalOpen.call(this, method, url as string, ...rest);
    };

    XMLHttpRequest.prototype.send = function(body) {
      const requestUrl = String((this as any).__requestUrl || '');
      if (requestUrl.includes('/api/')) {
        try {
          this.setRequestHeader('Authorization', `Bearer ${token}`);
        } catch {
          // ignore
        }
      }

      return originalSend.call(this, body);
    };
  }, { token: body.token, username });
  await page.route('**/api/**', async (route) => {
    const requestUrl = new URL(route.request().url());
    requestUrl.protocol = 'http:';
    requestUrl.host = 'localhost:8080';
    requestUrl.pathname = requestUrl.pathname.replace(/^\/api/, '') || '/';

    await route.continue({
      url: requestUrl.toString(),
      headers: {
        ...route.request().headers(),
        authorization: `Bearer ${body.token}`
      }
    });
  });

  await page.goto('/');
  await page.evaluate(({ token, username: user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user);
  }, { token: body.token, username });

  return { username, password, token: body.token };
}
