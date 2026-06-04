# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mealplan.spec.ts >> login, cria plano semanal e vê na própria lista
- Location: e2e\mealplan.spec.ts:4:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4200/
Call log:
  - navigating to "http://localhost:4200/", waiting until "load"

```

# Test source

```ts
  1  | import { APIRequestContext, Page, expect } from '@playwright/test';
  2  | 
  3  | export async function registerAndLogin(request: APIRequestContext, page: Page, suffix: string) {
  4  |   const username = `user_${suffix}`;
  5  |   const email = `${username}@example.com`;
  6  |   const password = 'Passw0rd!';
  7  | 
  8  |   const register = await request.post('http://localhost:8080/auth/register', {
  9  |     data: { username, email, password }
  10 |   });
  11 | 
  12 |   if (!register.ok() && register.status() !== 400) {
  13 |     throw new Error(`Falha ao registrar usuário: ${register.status()}`);
  14 |   }
  15 | 
  16 |   const login = await request.post('http://localhost:8080/auth/login', {
  17 |     data: { username, password }
  18 |   });
  19 |   expect(login.ok()).toBeTruthy();
  20 |   const body = await login.json();
  21 | 
  22 |   await page.addInitScript(({ token, username: user }) => {
  23 |     localStorage.setItem('token', token);
  24 |     localStorage.setItem('username', user);
  25 | 
  26 |     const originalOpen = XMLHttpRequest.prototype.open;
  27 |     const originalSend = XMLHttpRequest.prototype.send;
  28 | 
  29 |     XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  30 |       (this as any).__requestUrl = String(url || '');
  31 |       return originalOpen.call(this, method, url as string, ...rest);
  32 |     };
  33 | 
  34 |     XMLHttpRequest.prototype.send = function(body) {
  35 |       const requestUrl = String((this as any).__requestUrl || '');
  36 |       if (requestUrl.includes('/api/')) {
  37 |         try {
  38 |           this.setRequestHeader('Authorization', `Bearer ${token}`);
  39 |         } catch {
  40 |           // ignore
  41 |         }
  42 |       }
  43 | 
  44 |       return originalSend.call(this, body);
  45 |     };
  46 |   }, { token: body.token, username });
  47 |   await page.route('**/api/**', async (route) => {
  48 |     const requestUrl = new URL(route.request().url());
  49 |     requestUrl.protocol = 'http:';
  50 |     requestUrl.host = 'localhost:8080';
  51 |     requestUrl.pathname = requestUrl.pathname.replace(/^\/api/, '') || '/';
  52 | 
  53 |     await route.continue({
  54 |       url: requestUrl.toString(),
  55 |       headers: {
  56 |         ...route.request().headers(),
  57 |         authorization: `Bearer ${body.token}`
  58 |       }
  59 |     });
  60 |   });
  61 | 
> 62 |   await page.goto('/');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4200/
  63 |   await page.evaluate(({ token, username: user }) => {
  64 |     localStorage.setItem('token', token);
  65 |     localStorage.setItem('username', user);
  66 |   }, { token: body.token, username });
  67 | 
  68 |   return { username, password, token: body.token };
  69 | }
  70 | 
```