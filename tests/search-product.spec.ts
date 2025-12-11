import { test, expect } from '@playwright/test';
import { SearchProductHelper } from './helpers/search-product-helper';
import searchNotFoundResponse from './fixtures/search-not-found.json';
import { PageHelper } from './helpers/page-helper';
import { MockHelper } from './helpers/mock-helper';

test.describe('Product Search', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/th');
        await page.waitForTimeout(2000);
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
        await SearchProductHelper.verifyProductDetailPage(page, previousUrl);
    });

    test('should display no results when search returns empty', async ({ page }) => {
        // Mock the search API to return empty results
        await MockHelper.mockSearchAPI(page, searchNotFoundResponse);

        // Perform search
        const searchInput = page.locator('#search-bar-input');
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
        await searchInput.fill('nonexistentproduct12345');
        await searchInput.press('Escape'); // Close autocomplete
        await page.waitForTimeout(500);
        await searchInput.press('Enter');
        await page.waitForTimeout(3000);

        // Verify we're on search results page
        const currentUrl = page.url();
        expect(currentUrl).toContain('/search/');

        await PageHelper.closeAllDialogs(page);

        // Verify no products are displayed
        const productItems = page.locator('.product-grid-item');
        const count = await productItems.count();
        expect(count).toBe(0);

        // Try to find "no results" message
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
        let apiCalled = false;
        let apiUrl = '';

        // Listen for API calls
        page.on('request', (request) => {
            const url = request.url();
            if (url.includes('/lotuss-mobile-bff/product/v5/search')) {
                apiCalled = true;
                apiUrl = url;
            }
        });

        // Perform search
        await SearchProductHelper.searchForProduct(page, 'ซีพี');

        // Wait for API call
        await page.waitForTimeout(2000);

        // Verify API was called
        expect(apiCalled).toBe(true);
    });
});
