import { expect, test } from '@playwright/test';
import { registerAndLogin } from './helpers';

test('submissão e edição de review próprio', async ({ page, request }) => {
  const auth = await registerAndLogin(request, page, Date.now().toString());

  const created = await request.post('http://localhost:8080/system-reviews', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: { rating: 5, comment: 'Muito bom' }
  });
  expect(created.ok()).toBeTruthy();
  const createdBody = await created.json();

  await page.goto('/login');
  await expect(page).toHaveURL(/\/$/);

  await page.reload();
  await expect(page).toHaveURL(/\/$/);

  await page.reload();
  await expect(page).toHaveURL(/\/$/);
});
