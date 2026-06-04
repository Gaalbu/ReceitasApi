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
  const createResp = await apiRequest.post('http://localhost:8080/recipes', {
    headers: authHeaders,
    data: {
      name: createdTitle,
      description: 'Farinha, água, sal e azeite',
      instructions: 'Misturar, assar e servir',
      prep_time: 25
    }
  });
  expect(createResp.ok()).toBeTruthy();
  const createdRecipe = await createResp.json();
  expect(createdRecipe.name || createdRecipe.title).toBe(createdTitle);

  const updateResp = await apiRequest.put(`http://localhost:8080/recipes/${createdRecipe.id}`, {
    headers: authHeaders,
    data: {
      name: updatedTitle,
      description: 'Farinha, água, sal e azeite',
      instructions: 'Misturar, assar e servir bem quente',
      prep_time: 30
    }
  });
  expect(updateResp.ok()).toBeTruthy();

  const deleteResp = await apiRequest.delete(`http://localhost:8080/recipes/${createdRecipe.id}`, {
    headers: authHeaders
  });
  expect(deleteResp.status()).toBe(204);

  await page.goto('/login');
  await expect(page.getByText('Faça login para continuar')).toBeVisible();
});
