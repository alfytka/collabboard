import { test, expect } from '@playwright/test';

test.describe('Board - alur inti', () => {
  test.beforeEach(async ({ page }) => {
    // Login dengan user yang sudah pasti ada (buat manual 1x di Supabase testing,
    // atau lewat test signup di atas - untuk sekarang asumsikan sudah ada)
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel('Password').fill(process.env.E2E_TEST_EMAIL!);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/');
  });

  test('user bisa membuat workspace, board, list, and card', async ({ page }) => {
    const workspaceName = `Test Workspace ${Date.now()}`;

    await page.getByPlaceholder('Nama workspace baru...').fill(workspaceName);
    await page.getByRole('button', { name: 'Buat' }).click();
    await expect(page.getByText(workspaceName)).toBeVisible();

    await page.getByText(workspaceName).click();
    await expect(page).toHaveURL(/\/workspace\//);

    await page.getByPlaceholder('Nama board baru...').fill('Test Board');
    await page.getByRole('button', { name: 'Buat Board' }).click();
    await expect(page.getByText('Test Board')).toBeVisible();

    await page.getByText('Test Board').click();
    await expect(page).toHaveURL(/\/board\//);

    await page.getByText('+ Tambah list').click();
    await page.getByPlaceholder('Nama list...').fill('To Do');
    await page.getByRole('button', { name: 'Tambah' }).click();
    await expect(page.getByText('To Do')).toBeVisible();

    await page.getByText('+ Tambah card').click();
    await page.getByPlaceholder('Nama card...').fill('Belajar Playwright');
    await page.getByRole('button', { name: 'Tambah' }).click();
    await expect(page.getByText('Belajar Playwright')).toBeVisible();
  });

  test('perubahan card oleh user A langsung terlihat oleh user B (real-time)', async ({ browser }) => {
    // Buat 2 context terpisah — masing-masing simulasi 1 user/browser berbeda
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Kedua user login sebagai member workspace yang sama
    // (asumsikan workspace + board test sudah disiapkan, atau setup di beforeAll)
    for (const page of [pageA, pageB]) {
      await page.goto('/login');
      await page.getByLabel('Email').fill(process.env.E2E_TEST_EMAIL!);
      await page.getByLabel('Password').fill(process.env.E2E_TEST_PASSWORD!);
      await page.getByRole('button', { name: 'Login' }).click();
    }

    // Kedua user buka board yang sama
    const boardUrl = '/board/BOARD_ID_YANG_SUDAH_DISIAPKAN';
    await pageA.goto(boardUrl);
    await pageB.goto(boardUrl);

    // User A menambah card baru
    await pageA.getByText('+ Tambah card').first().click();
    await pageA.getByPlaceholder('Nama card...').fill('Card dari User A');
    await pageA.getByRole('button', { name: 'Tambah' }).click();

    // User B (TANPA refresh) harus melihat card itu muncul via real-time subscription
    await expect(pageB.getByText('Card dari User A')).toBeVisible({ timeout: 5000 });

    await contextA.close();
    await contextB.close();
  });
});