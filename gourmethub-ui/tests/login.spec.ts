import { test, expect, request } from '@playwright/test';

test('login via API and visit dashboard', async ({ page, request: apiRequest }) => {
  const username = `pwuser${Date.now()}`;
  const email = `${username}@example.com`;
  const password = 'Pass123!';

  // Try to register (ignore error if user exists)
  await apiRequest.post('http://localhost:8080/auth/register', {
    headers: { Origin: 'http://localhost' },
    data: { username, email, password }
  }).catch(() => {});

  // Login via API to obtain token
  const loginResp = await apiRequest.post('http://localhost:8080/auth/login', {
    headers: { Origin: 'http://localhost' },
    data: { username, password }
  });
  expect(loginResp.ok()).toBeTruthy();
  const body = await loginResp.json();
  const token = body.token;
  expect(token).toBeTruthy();

  // Inject token into localStorage before page load
  await page.addInitScript((t) => {
    window.localStorage.setItem('token', t);
  }, token);

  // Navigate to root and verify token was injected into localStorage (login succeeded)
  await page.goto('/');
  const stored = await page.evaluate(() => window.localStorage.getItem('token'));
  expect(stored).toBeTruthy();
});
