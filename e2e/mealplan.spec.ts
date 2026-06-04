import { expect, test } from '@playwright/test';
import { registerAndLogin } from './helpers';

test('login, cria plano semanal e vê na própria lista', async ({ page, request }) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const auth = await registerAndLogin(request, page, suffix);

  const recipeResp = await request.post('http://localhost:8080/recipes', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      name: `Receita Base ${suffix}`,
      description: 'Arroz',
      instructions: 'Cozinhar',
      prep_time: 10
    }
  });
  expect(recipeResp.ok()).toBeTruthy();
  const recipeBody = await recipeResp.json();
  const recipeId = String(recipeBody.id);
  const planName = `Plano E2E ${suffix}`;

  await page.goto('/meal-plans');
  await expect(page.getByRole('heading', { name: /Plano Semanal de Refei/i })).toBeVisible();

  await page.locator('input[formcontrolname="plan_name"]').fill(planName);
  await page.locator('input[formcontrolname="start_date"]').fill('2026-06-08');
  await page.locator('select[formcontrolname="MONDAY_LUNCH"]').selectOption(recipeId);

  await page.getByRole('button', { name: 'Salvar plano' }).click();
  await expect(page.getByText('Plano de refeicao criado com sucesso!')).toBeVisible();
  await expect(page.getByRole('cell', { name: planName })).toBeVisible();
  await expect(page.locator('tbody tr')).toContainText(planName);
});
