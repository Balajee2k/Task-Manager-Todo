import { test, expect } from '@playwright/test';

test.describe('Task Manager E2E Tests', () => {
  test('should display homepage correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    await expect(page.getByText('Organize Your Tasks')).toBeVisible();
    
    // Check for navigation buttons
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the link to be ready and use waitForNavigation
    await page.click('a:has-text("Get Started")');
    await page.waitForURL('**/register', { waitUntil: 'networkidle' });
    
    await expect(page).toHaveURL('/register');
    await expect(page.getByText('Create your account')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click the first Login link
    await page.click('a:has-text("Login")');
    await page.waitForURL('**/login', { waitUntil: 'networkidle' });

    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');
    
    const timestamp = Date.now();
    await page.fill('#name', 'Test User');
    await page.fill('#email', `test${timestamp}@example.com`);
    await page.fill('#password', 'Test1234');
    
    // Wait for navigation after form submission
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.getByRole('button', { name: 'Sign Up' }).click()
    ]);
    
    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('should login existing user', async ({ page }) => {
    // First register a user
    await page.goto('/register');
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.fill('#name', 'Test User');
    await page.fill('#email', testEmail);
    await page.fill('#password', 'Test1234');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.getByRole('button', { name: 'Sign Up' }).click()
    ]);
    
    // Wait for redirect
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Now login
    await page.waitForURL('/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', 'Test1234');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.getByRole('button', { name: 'Sign In' }).click()
    ]);
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(page.getByText('My Tasks')).toBeVisible();
  });
});
