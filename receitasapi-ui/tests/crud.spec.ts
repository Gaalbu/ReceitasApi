import { test, expect } from '@playwright/test';

test('CRUD flows for Favorites, Ratings and Users (headless)', async ({ page, request: apiRequest }) => {
  page.setDefaultTimeout(5000);
  const uniq = Date.now();
  const username = `user${uniq}`;
  const email = `user${uniq}@example.com`;
  const password = 'abc123';
  await apiRequest.post('http://localhost:8080/auth/register', {
    headers: { Origin: 'http://localhost' },
    data: { username, email, password }
  }).catch(() => {});

  const login = await apiRequest.post('http://localhost:8080/auth/login', {
    headers: { Origin: 'http://localhost' },
    data: { username, password }
  });
  expect(login.ok()).toBeTruthy();
  const body = await login.json();
  const token = body.token as string;
  const authHeaders = { Authorization: `Bearer ${token}` };

  const recipeResp = await apiRequest.post('http://localhost:8080/recipes', {
    headers: authHeaders,
    data: {
      name: `Receita ${uniq}`,
      description: 'Farinha, agua, sal',
      instructions: 'Misturar e assar',
      prep_time: 20
    }
  });
  expect(recipeResp.ok()).toBeTruthy();
  const recipe = await recipeResp.json();

  const favoriteResp = await apiRequest.post('http://localhost:8080/favorites', {
    headers: authHeaders,
    data: {
      external_recipe_id: `ext-${uniq}`,
      recipe_name: `Favorito ${uniq}`,
      image_url: 'https://example.com/fav.png'
    }
  });
  expect(favoriteResp.ok()).toBeTruthy();
  const favorite = await favoriteResp.json();

  const favoritesList = await apiRequest.get('http://localhost:8080/favorites/me', { headers: authHeaders });
  expect(favoritesList.ok()).toBeTruthy();
  expect((await favoritesList.json()).some((item: any) => item.recipeName === `Favorito ${uniq}` || item.recipe_name === `Favorito ${uniq}`)).toBeTruthy();

  const ratingResp = await apiRequest.post(`http://localhost:8080/recipes/${recipe.id}/ratings`, {
    headers: authHeaders,
    data: { rating: 4, comment: 'Bom' }
  });
  expect(ratingResp.ok()).toBeTruthy();

  const ratingsList = await apiRequest.get('http://localhost:8080/recipes/ratings/me', { headers: authHeaders });
  expect(ratingsList.ok()).toBeTruthy();
  expect((await ratingsList.json()).length).toBeGreaterThan(0);

  const userUpdate = await apiRequest.put('http://localhost:8080/users/me', {
    headers: authHeaders,
    data: {
      username: `${username}-edited`,
      email: `demo${uniq}@example.com`,
      password
    }
  });
  expect(userUpdate.ok()).toBeTruthy();

  await page.goto('/login');
  await expect(page.getByText('Faça login para continuar')).toBeVisible();
});
