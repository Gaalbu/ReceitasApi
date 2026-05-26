import { test, expect } from '@playwright/test';

test('CRUD flows for Favorites, Ratings and Users (headless)', async ({ page }) => {
  page.setDefaultTimeout(5000);
  const uniq = Date.now();
  const username = `user${uniq}`;
  const email = `user${uniq}@example.com`;
  const password = 'abc123';

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

  await page.goto('/register');
  await page.locator('input[placeholder="Escolha um usuário"]').fill(username);
  await page.locator('input[placeholder="seu@email.com"]').fill(email);
  await page.locator('input[placeholder="Mínimo 6 caracteres"]').fill(password);
  await page.locator('button:has-text("Cadastrar")').click();
  await page.waitForURL(/login/);

  await page.locator('input[placeholder="Digite seu usuário"]').fill(username);
  await page.locator('input[placeholder="Digite sua senha"]').fill(password);
  await page.locator('button:has-text("Entrar")').click();
  await page.waitForURL(/\/$/);
  await waitForAngular();
  await expect(page.getByText('Menu')).toBeVisible();
  await page.evaluate(() => {
    window.localStorage.setItem('receitasapi_demo_mode', '1');
  });

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
