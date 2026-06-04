import { expect, test } from '@playwright/test';
import { registerAndLogin } from './helpers';

test('submissão e edição de review próprio', async ({ page, request }) => {
  await registerAndLogin(request, page, Date.now().toString());

  await page.goto('/feedback');
  await page.locator('input[formcontrolname="rating"]').fill('5');
  await page.locator('textarea[formcontrolname="comment"]').fill('Muito bom');
  await page.getByRole('button', { name: 'Enviar review' }).click();
  await expect(page.getByText('Review enviado com sucesso.')).toBeVisible();

  await page.getByRole('button', { name: 'Editar' }).first().click();
  await page.locator('textarea[formcontrolname="comment"]').fill('Excelente');
  await page.getByRole('button', { name: 'Salvar alteração' }).click();
  await expect(page.getByText('Review atualizado com sucesso.')).toBeVisible();
});
