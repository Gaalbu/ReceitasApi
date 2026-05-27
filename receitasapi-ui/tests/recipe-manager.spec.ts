import { test, expect } from '@playwright/test';

test('recipe manager CRUD through navbar route', async ({ page, request: apiRequest }) => {
  page.setDefaultTimeout(7000);

  const unique = Date.now();
  const username = `recipe-user-${unique}`;
  const email = `${username}@example.com`;
  const password = 'abc12345';
  const createdTitle = `Receita Playwright ${unique}`;
  const updatedTitle = `${createdTitle} Atualizada`;

  await page.setViewportSize({ width: 390, height: 844 });

  await apiRequest.post('http://localhost:8080/auth/register', {
    data: { username, email, password }
  });

  const loginResponse = await apiRequest.post('http://localhost:8080/auth/login', {
    data: { username, password }
  });

  expect(loginResponse.ok()).toBeTruthy();

  const loginBody = await loginResponse.json();
  const token = loginBody.token;
  expect(token).toBeTruthy();
  const authHeaders = {
    Authorization: `Bearer ${token}`
  };
  await page.addInitScript((value) => {
    window.localStorage.setItem('token', value);
  }, token);

  await page.goto('/');

  await page.locator('button.navbar-toggler').click();
  await expect(page.locator('div.navbar-collapse.show')).toBeVisible();

  await page.locator('a.dropdown-toggle').click();
  await page.locator('a[href="/my-recipes"]').click();

  await expect(page.getByRole('heading', { name: 'Gestão completa de receitas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Minhas receitas' })).toBeVisible();

  await page.locator('#recipe-title').fill(createdTitle);
  await page.locator('#recipe-ingredients').fill('Farinha, água, sal e azeite');
  await page.locator('#recipe-instructions').fill('Misturar, assar e servir');
  await page.locator('#recipe-prep-time').fill('25');
  await page.locator('#recipe-submit').click();

  await expect(page.getByText(createdTitle, { exact: true })).toBeVisible();
  await expect(page.locator('[data-recipe-id]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Editar' }).first().click();
  await expect(page.locator('#recipe-title')).toHaveValue(createdTitle);
  await page.locator('#recipe-title').fill(updatedTitle);
  await page.locator('#recipe-instructions').fill('Misturar, assar e servir bem quente');
  await page.locator('#recipe-prep-time').fill('30');
  await page.locator('#recipe-submit').click();

  await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
  const recipeId = await page.locator('[data-recipe-id]').first().getAttribute('data-recipe-id');
  expect(recipeId).toBeTruthy();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Remover' }).first().click();

  const deleteStatus = await page.evaluate(async ({ token, id }) => {
    const response = await fetch(`/api/recipes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.status;
  }, { token, id: recipeId });

  expect(deleteStatus).toBe(204);

  const finalRecipes = await page.evaluate(async (tokenValue) => {
    const response = await fetch('/api/recipes/me', {
      headers: {
        Authorization: `Bearer ${tokenValue}`
      }
    });
    return response.json();
  }, token);
  expect(finalRecipes).toHaveLength(0);
});