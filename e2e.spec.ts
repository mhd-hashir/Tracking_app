
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.use({
    ignoreHTTPSErrors: true,
    headless: true,
    trace: 'on-first-retry',
});

test.describe('FieldTrack Full Lifecycle', () => {

    let ownerEmail = '';
    let empEmail = '';
    const timestamp = Date.now();

    test.beforeAll(async () => {
        ownerEmail = `owner_${timestamp} @test.com`;
        empEmail = `emp_${timestamp} @test.com`;
        console.log('Generated Test Emails:', { ownerEmail, empEmail });
    });

    test('01. Admin: Login and Create Owner', async ({ page }) => {
        console.log('Step 1: Login as Admin');
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', 'admin@fieldtrack.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/admin');
        console.log('Login successful');

        console.log('Step 2: Navigate to Owners (Direct)');
        await page.goto(`${BASE_URL}/admin/owners`);
        await page.waitForSelector('h3:has-text("Add New Owner")');

        console.log('Step 3: Fill Owner Form');
        await page.fill('input[name="name"]', 'Auto Owner');
        await page.fill('input[name="email"]', ownerEmail);
        await page.fill('input[name="password"]', 'pass123');

        console.log('Step 4: Submit Owner');
        await page.click('button:has-text("Add Owner")');

        // Wait for the table to update
        console.log('Step 5: Verify Owner in Table');
        await expect(page.locator('table')).toContainText(ownerEmail, { timeout: 10000 });
    });

    test('02. Owner: Login and Setup Shop/Employee/Route', async ({ page }) => {
        console.log('Step 1: Login as New Owner');
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', ownerEmail);
        await page.fill('input[name="password"]', 'pass123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/owner');

        // Add Shop
        console.log('Step 2: Add Shop');
        await page.click('a[href="/owner/shops"]');
        await page.waitForSelector('h3:has-text("Add Single Shop")');
        await page.fill('input[name="name"]', 'Auto Shop');
        await page.fill('input[name="address"]', '123 Auto St');
        await page.fill('input[name="dueAmount"]', '1000');
        await page.click('button:has-text("Add Shop")');
        await expect(page.locator('table')).toContainText('Auto Shop');

        // Add Employee
        console.log('Step 3: Add Employee');
        await page.click('a[href="/owner/employees"]');
        await page.waitForSelector('h3:has-text("Add New Employee")');
        await page.fill('input[name="name"]', 'Auto Emp');
        await page.fill('input[name="email"]', empEmail);
        await page.fill('input[name="password"]', 'pass123');
        await page.click('button:has-text("Add Employee")');
        await expect(page.locator('ul')).toContainText(empEmail);

        // Create Route
        console.log('Step 4: Create Route');
        await page.click('a[href="/owner/routes"]');
        await page.waitForSelector('h3:has-text("Create New Route")');

        await page.fill('input[name="name"]', 'Daily Route');
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const today = days[new Date().getDay()];
        await page.selectOption('select[name="dayOfWeek"]', today);

        // Ensure shop checkbox is visible and click it
        await page.waitForSelector('input[type="checkbox"]');
        await page.check('input[type="checkbox"]');

        await page.click('button:has-text("Create Route")');
        await expect(page.locator('.grid')).toContainText('Daily Route');
    });

    test('03. Employee: Login and Collect', async ({ page }) => {
        console.log('Step 1: Login as Employee');
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', empEmail);
        await page.fill('input[name="password"]', 'pass123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/employee');

        console.log('Step 2: Verify Dashboard');
        await expect(page.locator('body')).toContainText('Daily Route');

        console.log('Step 3: Navigate to Collection');
        // Click the first Collect link
        await page.click('text=Collect');
        await page.waitForSelector('h2:has-text("Auto Shop")');

        console.log('Step 4: Submit Collection');
        await page.fill('input[name="amount"]', '500');
        await page.selectOption('select[name="paymentMode"]', 'CASH');
        await page.click('button:has-text("CONFIRM COLLECTION")');

        console.log('Step 5: Verify Redirect');
        await page.waitForURL('**/employee');
    });

});
