import { expect, test } from '@playwright/test';
import { registerAndLogin } from './helpers';

test('criação, listagem, edição e exclusão', async ({ page, request }) => {
  await registerAndLogin(request, page, Date.now().toString());

  await page.goto('/meal-plans');
  await page.locator('input[formcontrolname="plan_name"]').fill('Plano E2E');
  await page.locator('input[formcontrolname="start_date"]').fill('2026-06-08');
  await page.locator('select[formcontrolname="MONDAY_LUNCH"]').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Salvar plano' }).click();
  await expect(page.getByText('Plano de refeicao criado com sucesso!')).toBeVisible();

  await expect(page.getByText('Plano E2E')).toBeVisible();
  await page.getByRole('button', { name: 'Editar' }).first().click();
  await page.locator('input[formcontrolname="plan_name"]').fill('Plano E2E Atualizado');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Plano atualizado com sucesso!')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Excluir' }).first().click();
  await expect(page.getByText('Plano E2E Atualizado')).toHaveCount(0);
});
