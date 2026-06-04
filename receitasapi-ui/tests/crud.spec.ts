import { test, expect } from '@playwright/test';

test('CRUD flows for Favorites, Ratings and Users (headless)', async ({ page, request: apiRequest }) => {
  page.setDefaultTimeout(5000);
  const uniq = Date.now();
  const username = `user${uniq}`;
  const email = `user${uniq}@example.com`;
  const password = 'abc123';
  await apiRequest.post('http://localhost:8080/auth/register', {
    data: { username, email, password }
  });

  const login = await apiRequest.post('http://localhost:8080/auth/login', {
    data: { username, password }
  });
  expect(login.ok()).toBeTruthy();
  const body = await login.json();
  const token = body.token as string;

  const waitForAngular = async () => {
    await page.waitForFunction(() => {
      const testabilities = (window as any).getAllAngularTestabilities?.();
      return !testabilities || testabilities.every((t: any) => t.isStable());
    });
  };

  const openMenuAndGo = async (href: string) => {
    await page.locator('a.dropdown-toggle').click();
    await page.locator('ul.dropdown-menu.show').waitFor();
    console.log('dropdown-items', await page.locator('a.dropdown-item').allTextContents());
    await page.locator(`a[href="${href}"]`).click();
    await waitForAngular();
  };

  await page.addInitScript((storedToken) => {
    window.localStorage.setItem('token', storedToken);
    window.localStorage.setItem('username', 'demo');
    window.localStorage.setItem('receitasapi_demo_mode', '1');
  }, token);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await waitForAngular();
  await expect(page.getByText('Menu')).toBeVisible();

  // FAVORITES: create, edit, delete
  await openMenuAndGo('/favorites');
  await expect(page.getByRole('heading', { name: 'Favoritos' })).toBeVisible();
  await page.locator('button:has-text("Adicionar favorito")').click();
  await page.locator('#favorite-recipe-id').fill('12345');
  await page.locator('#favorite-title').fill(`Fav Recipe ${uniq}`);
  await page.locator('button:has-text("Salvar")').last().click();
  // verify created
  await expect(page.getByText(`Fav Recipe ${uniq}`)).toBeVisible();
  // edit
  await page.locator('button:has-text("Editar")').first().click();
  // change title
  await page.locator('#favorite-edit-title').fill(`Fav Recipe ${uniq}-edited`);
  await page.locator('button:has-text("Salvar")').last().click();
  await expect(page.getByText(`Fav Recipe ${uniq}-edited`)).toBeVisible();
  // delete
  await page.locator('button:has-text("Remover")').first().click();
  await expect(page.getByText(`Fav Recipe ${uniq}-edited`)).not.toBeVisible();

  // RATINGS: create, edit, delete
  await openMenuAndGo('/ratings');
  await expect(page.getByRole('heading', { name: 'Avaliações' })).toBeVisible();
  await page.locator('#rating-recipe-id').fill('222');
  await page.locator('#rating-score').fill('4');
  await page.locator('button:has-text("Adicionar")').last().click();
  // edit
  await page.locator('button:has-text("Editar")').first().click();
  await page.locator('#rating-edit-score').fill('5');
  await page.locator('button:has-text("Salvar")').last().click();

  // USERS: create, edit, delete
  await openMenuAndGo('/users');
  await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible();
  await page.locator('#user-name').fill(`Demo ${uniq}`);
  await page.locator('#user-email').fill(`demo${uniq}@example.com`);
  await page.locator('button:has-text("Criar")').click();
  await expect(page.getByText(`Demo ${uniq}`)).toBeVisible();
  // edit row
  await page.locator('a:has-text("Editar")').first().click();
  await page.locator('#user-edit-name').fill(`Demo ${uniq}-edited`);
  await page.locator('button:has-text("Salvar")').last().click();
  await expect(page.getByText(`Demo ${uniq}-edited`)).toBeVisible();
  // delete
  await page.locator('button:has-text("Remover")').first().click();
  await expect(page.getByText(`Demo ${uniq}-edited`)).not.toBeVisible();
});
