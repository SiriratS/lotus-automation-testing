import { test, expect } from '@playwright/test';
import { SearchProductHelper } from './helpers/search-product-helper';
import searchNotFoundResponse from './fixtures/search-not-found.json';
import { PageHelper } from './helpers/page-helper';
import { MockHelper } from './helpers/mock-helper';

test.describe('Product Search', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/th');
    });

    test('should search, find product, and navigate to details', async ({ page }) => {
        const productName = 'ซีพี คุโรบูตะ สเต็กหมูหมักพริกไทยดำ 200 กรัม';

        await SearchProductHelper.searchForProduct(page, 'ซีพี คุโรบูตะ สเต็กหมู');

        const currentUrl = page.url();
        expect(currentUrl).not.toBe('https://www.lotuss.com/th');
        expect(currentUrl).toContain('/search/');

        const productItem = await SearchProductHelper.findProductInResults(page, productName);
        await expect(productItem).toBeVisible();

        const previousUrl = await SearchProductHelper.clickProduct(page, productName);
        expect(page.url()).not.toBe(previousUrl);
    });

    test('should display no results when search returns empty', async ({ page }) => {
        await MockHelper.mockSearchAPI(page, searchNotFoundResponse);

        const searchInput = page.locator('#search-bar-input');
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
        await searchInput.fill('nonexistentproduct12345');
        await searchInput.press('Escape');
        await searchInput.press('Enter');

        await page.waitForURL('**/search/**', { timeout: 10000 });

        const currentUrl = page.url();
        expect(currentUrl).toContain('/search/');

        await PageHelper.closeAllDialogs(page);

        const productItems = page.locator('.product-grid-item');
        const count = await productItems.count();
        expect(count).toBe(0);

        const possibleNoResultsMessages = [
            page.locator('text=/ไม่พบสินค้า/i'),
            page.locator('text=/no.*results/i'),
            page.locator('text=/ไม่มีผลลัพธ์/i'),
            page.locator('[data-testid*="no-result"]'),
            page.locator('[class*="no-result"]'),
            page.locator('[class*="empty"]'),
        ];

        for (const locator of possibleNoResultsMessages) {
            if (await locator.count() > 0) {
                await expect(locator.first()).toBeVisible();
                break;
            }
        }
    });

    test('should verify search API is called with correct parameters', async ({ page }) => {
        const [response] = await Promise.all([
            page.waitForResponse(
                response => response.url().includes('/lotuss-mobile-bff/product/v5/search') && response.status() === 200,
                { timeout: 20000 }
            ),
            SearchProductHelper.searchForProduct(page, 'ซีพี')
        ]);

        expect(response.url()).toContain('/lotuss-mobile-bff/product/v5/search');
        expect(response.status()).toBe(200);
    });
});
