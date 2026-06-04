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
  }, { token: body.token, username });

  await page.goto('/');
  await page.evaluate(({ token, username: user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user);
  }, { token: body.token, username });

  return { username, password, token: body.token };
}
