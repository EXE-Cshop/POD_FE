import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully with admin credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Fill in the credentials
    await page.getByPlaceholder(/Admin Email/i).fill('admin');
    await page.getByPlaceholder(/Enter your password/i).fill('admin');

    // Click the sign-in button and wait for navigation
    await Promise.all([
      page.waitForURL(/\/admin\/users/),
      page.getByRole('button', { name: /Sign In/i }).click()
    ]);
    
    // Verify dashboard content
    await expect(page.getByRole('heading', { name: /User Management/i })).toBeVisible();
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/Admin Email/i).fill('wronguser');
    await page.getByPlaceholder(/Enter your password/i).fill('wrongpass');
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.locator('text=Login failed')).toBeVisible();
    const errorAlert = page.locator('.text-red-500');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Invalid username or password');
  });
});
