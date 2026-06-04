import { test, expect } from '@playwright/test';

test('create meal plan from protected route', async ({ page, request: apiRequest }) => {
  const unique = Date.now();
  const username = `meal-user-${unique}`;
  const email = `${username}@example.com`;
  const password = 'abc12345';
  const recipeName = `Receita Plano ${unique}`;

  await apiRequest.post('http://localhost:8080/auth/register', {
    data: { username, email, password }
  });

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

  await page.goto('/login');
  await page.evaluate((storedToken) => {
    window.localStorage.setItem('token', storedToken);
  }, token);

  await page.goto('/');
  await page.locator('a.dropdown-toggle').click();
  await page.locator('a[href="/meal-plans"]').click();
  await expect(page.getByRole('heading', { name: /Plano Semanal de Refei/i })).toBeVisible();

  await page.locator('input[formcontrolname="plan_name"]').fill(`Plano ${unique}`);
  await page.locator('input[formcontrolname="start_date"]').fill('2026-06-08');

  const mondayLunch = page.locator('select[formcontrolname="MONDAY_LUNCH"]');
  await expect(mondayLunch).toBeVisible();
  await expect(mondayLunch.locator(`option[value="${recipeId}"]`)).toBeVisible();
  await mondayLunch.selectOption(String(recipeId));

  await page.getByRole('button', { name: 'Salvar plano' }).click();
  await expect(page.getByText('Plano de refeicao criado com sucesso!')).toBeVisible();

  const mealPlansResponse = await apiRequest.get('http://localhost:8080/meal-plans', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  expect(mealPlansResponse.ok()).toBeTruthy();

  const mealPlans = await mealPlansResponse.json();
  expect(Array.isArray(mealPlans)).toBeTruthy();
  expect(mealPlans.some((plan: any) => plan.planName === `Plano ${unique}` || plan.plan_name === `Plano ${unique}`)).toBeTruthy();
});
