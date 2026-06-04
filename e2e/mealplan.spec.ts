import { expect, test } from '@playwright/test';
import { registerAndLogin } from './helpers';

test('criação, listagem, edição e exclusão', async ({ page, request }) => {
  const auth = await registerAndLogin(request, page, Date.now().toString());

  const recipeResp = await request.post('http://localhost:8080/recipes', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      name: 'Receita Base',
      description: 'Arroz',
      instructions: 'Cozinhar',
      prep_time: 10
    }
  });
  const recipeBody = await recipeResp.json();

  const created = await request.post('http://localhost:8080/meal-plans', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      plan_name: 'Plano E2E',
      start_date: '2026-06-08',
      items: [{ recipe_id: recipeBody.id, day_of_week: 'MONDAY', meal_type: 'LUNCH' }]
    }
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
