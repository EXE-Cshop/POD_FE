import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto('/login');
    await page.getByPlaceholder(/Admin Email/i).fill('admin');
    await page.getByPlaceholder(/Enter your password/i).fill('admin');
    await Promise.all([
      page.waitForURL(/\/admin\/users/),
      page.getByRole('button', { name: /Sign In/i }).click()
    ]);
  });

  test('should display user list correctly', async ({ page }) => {
    // Verify the header
    await expect(page.getByRole('heading', { name: /User Management/i })).toBeVisible();

    // Verify search functionality (UI check)
    const searchInput = page.locator('input[placeholder*="Search users"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('admin');
    // Verify admin is visible (which should be seeded)
    await expect(page.locator('text=admin')).toBeVisible();
  });

  test('should open add user button', async ({ page }) => {
    const addUserBtn = page.getByRole('button', { name: /Add New User/i });
    await expect(addUserBtn).toBeVisible();
    await addUserBtn.click();
  });
});
