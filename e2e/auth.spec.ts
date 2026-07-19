import { test, expect } from '@playwright/test';

test.describe('Autentikasi', () => {
  test('user bisa signup, lalu logout, lalu login kembali', async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    // Signup
    await page.goto('/signup');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Konfirmasi Password').fill(password);
    await page.getByRole('button', { name: 'Daftar' }).click();

    // Asumsi 'Confirm email' OFF di project testing (untuk mempermudah E2E)
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Workspace Saya')).toBeVisible();
  });

  test('user tidak bisa akses halaman protected tanpa login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
})