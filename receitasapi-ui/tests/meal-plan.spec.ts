import { test, expect } from '@playwright/test';

test('login, cria plano semanal e ve na propria lista', async ({ page, request: apiRequest }) => {
  const unique = Date.now();
  const username = `meal-user-${unique}`;
  const email = `${username}@example.com`;
  const password = 'abc12345';

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

  await page.goto('/login');
  await page.getByPlaceholder('Digite seu usuário').fill(username);
  await page.getByPlaceholder('Digite sua senha').fill(password);
  await page.getByRole('button', { name: /Entrar/ }).click();
  await expect(page.getByRole('link', { name: /Buscar Receitas/ })).toBeVisible();
  await page.locator('a.nav-link.dropdown-toggle').click();
  await page.getByRole('link', { name: 'Criar receita semanal' }).click();
  await expect(page).toHaveURL(/\/meal-plans/);
  await expect(page.getByRole('heading', { name: /Plano Semanal de Refei/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Salvar plano' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Segunda/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Domingo/ })).toBeVisible();
});
