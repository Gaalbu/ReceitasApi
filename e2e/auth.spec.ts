import { expect, test } from '@playwright/test';

test('registro e login válido/inválido', async ({ request, page }) => {
  const suffix = Date.now().toString();
  const username = `auth_${suffix}`;
  const email = `${username}@example.com`;
  const password = 'Passw0rd!';

  const register = await request.post('http://localhost:8080/auth/register', {
    data: { username, email, password }
  });
  expect(register.ok()).toBeTruthy();

  const loginOk = await request.post('http://localhost:8080/auth/login', {
    data: { username, password }
  });
  expect(loginOk.ok()).toBeTruthy();
  const body = await loginOk.json();
  expect(body.token).toBeTruthy();

  const loginFail = await request.post('http://localhost:8080/auth/login', {
    data: { username, password: 'wrong' }
  });
  expect(loginFail.status()).toBeGreaterThanOrEqual(400);

  await page.goto('/login');
  await expect(page).toHaveURL(/login/);
});
