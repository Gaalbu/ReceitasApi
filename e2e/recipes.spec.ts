import { expect, test } from '@playwright/test';
import { registerAndLogin } from './helpers';

test('busca via TheMealDB, criação, edição e exclusão', async ({ page, request }) => {
  await registerAndLogin(request, page, Date.now().toString());

  await page.goto('/');
  await page.getByPlaceholder('Digite o nome da receita...').fill('chicken');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByText('Avaliar esta receita')).toBeVisible();

  await page.goto('/my-recipes');
  await page.locator('#recipe-title').fill('Bolo E2E');
  await page.locator('#recipe-ingredients').fill('Farinha, ovos, leite');
  await page.locator('#recipe-instructions').fill('Misturar e assar');
  await page.locator('#recipe-prep-time').fill('20');
  await page.locator('#recipe-submit').click();
  await expect(page.getByText('Bolo E2E', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Editar' }).first().click();
  await page.locator('#recipe-title').fill('Bolo E2E Atualizado');
  await page.locator('#recipe-submit').click();
  await expect(page.getByText('Bolo E2E Atualizado', { exact: true })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Remover' }).first().click();
  await expect(page.getByText('Bolo E2E Atualizado', { exact: true })).toHaveCount(0);
});
