import { test, expect } from '@playwright/test';

test('login, cria plano semanal e ve na propria lista', async ({ page, request: apiRequest }) => {
  const unique = Date.now();
  const username = `meal-user-${unique}`;
  const email = `${username}@example.com`;
  const password = 'abc12345';
  const recipeName = `Receita Plano ${unique}`;
  const planName = `Plano ${unique}`;

  const register = await apiRequest.post('http://localhost:8080/auth/register', {
    data: { username, email, password }
  });
  expect(register.ok() || register.status() === 400).toBeTruthy();

  const loginResponse = await apiRequest.post('http://localhost:8080/auth/login', {
    data: { username, password }
  });
  expect(loginResponse.ok()).toBeTruthy();

  const loginBody = await loginResponse.json();
  const token = loginBody.token as string;
  expect(token).toBeTruthy();

  const createRecipeResponse = await apiRequest.post('http://localhost:8080/recipes', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: {
      name: recipeName,
      description: 'Frango e legumes',
      instructions: 'Preparar e servir',
      prep_time: 30
    }
  });
  expect(createRecipeResponse.ok()).toBeTruthy();

  const createdRecipe = await createRecipeResponse.json();
  const recipeId = Number(createdRecipe.id);
  expect(recipeId).toBeGreaterThan(0);

  await page.addInitScript((storedToken) => {
    window.localStorage.setItem('token', storedToken);
  }, token);

  await page.goto('/meal-plans');
  await expect(page.getByRole('heading', { name: /Plano Semanal de Refei/i })).toBeVisible();

  await page.locator('input[formcontrolname="plan_name"]').fill(planName);
  await page.locator('input[formcontrolname="start_date"]').fill('2026-06-08');
  await page.locator('select[formcontrolname="MONDAY_LUNCH"]').selectOption(String(recipeId));

  await page.getByRole('button', { name: 'Salvar plano' }).click();

  await expect(page.getByText('Plano de refeicao criado com sucesso!')).toBeVisible();
  await expect(page.getByRole('cell', { name: planName })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Segunda' })).toBeVisible();
});
