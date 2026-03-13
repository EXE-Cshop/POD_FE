import { test, expect } from '@playwright/test';

test.describe('Base Product Flow', () => {
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

  test('should create a new base product successfully', async ({ page }) => {
    // Navigate to Base Product Management using getByRole for better link detection
    await page.getByRole('link', { name: /Base Products/i }).click();
    await expect(page).toHaveURL(/\/admin\/base-products/);

    // Initial check of the list
    const initialProductCount = await page.locator('.group.bg-white.rounded-xl').count();

    // Open the creation modal
    await page.getByRole('button', { name: /Add Base Product/i }).click();
    await expect(page.getByRole('heading', { name: /Add New Base Product/i })).toBeVisible();

    // Fill the form
    const timestamp = Date.now();
    const productName = `E2E Test Shirt ${timestamp}`;
    const productCode = `E2E-${timestamp}`;

    await page.fill('input[name="name"]', productName);
    await page.fill('input[name="code"]', productCode);
    await page.fill('input[name="basePrice"]', '250000');
    await page.fill('input[name="material"]', 'Cotton 100%');
    await page.fill('input[name="printTechnology"]', 'DTG');
    await page.fill('input[name="imageUrl"]', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1080&auto=format&fit=crop');

    // Submit the form
    await page.click('button:has-text("Create Product")');

    // Wait for the modal to close and refresh (UI triggers fetchProducts)
    await expect(page.locator('text=Add New Base Product')).not.toBeVisible();

    // Verify the new product appears in the list
    await expect(page.locator(`text=${productName}`)).toBeVisible();
    
    // Check if count increased (if no other UI interference)
    const newProductCount = await page.locator('.group.bg-white.rounded-xl').count();
    expect(newProductCount).toBeGreaterThan(initialProductCount);
  });
});
