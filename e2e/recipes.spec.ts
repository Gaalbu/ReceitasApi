import { expect, test } from '@playwright/test';
import { registerAndLogin } from './helpers';

test('busca via TheMealDB, criação, edição e exclusão', async ({ page, request }) => {
  const auth = await registerAndLogin(request, page, Date.now().toString());

  const created = await request.post('http://localhost:8080/recipes', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      name: 'Bolo E2E',
      description: 'Farinha, ovos, leite',
      instructions: 'Misturar e assar',
      prep_time: 20
    }
  });
  expect(created.ok()).toBeTruthy();
  const createdBody = await created.json();

  await page.goto('/login');
  await expect(page).toHaveURL(/\/$/);

  const updated = await request.put(`http://localhost:8080/recipes/${createdBody.id}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      name: 'Bolo E2E Atualizado',
      description: 'Farinha, ovos, leite',
      instructions: 'Misturar e assar',
      prep_time: 25
    }
  });
  expect(updated.ok()).toBeTruthy();

  await page.reload();
  await expect(page).toHaveURL(/\/$/);

  const deleted = await request.delete(`http://localhost:8080/recipes/${createdBody.id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  expect(deleted.ok()).toBeTruthy();

  await page.reload();
  await expect(page).toHaveURL(/\/$/);
});
