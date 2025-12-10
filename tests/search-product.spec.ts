import { test, expect } from '@playwright/test';
import { SearchProductHelper } from './helpers/search-product-helper';

test.describe('Lotus Product Search', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/th');
        await page.waitForTimeout(2000);
    });

    test('should search, find product, and navigate to details', async ({ page }) => {
        const productName = 'ซีพี คุโรบูตะ สเต็กหมูหมักพริกไทยดำ 200 กรัม';

        // Test 1: Search works
        console.log('Testing: Search functionality');
        await SearchProductHelper.searchForProduct(page, 'ซีพี คุโรบูตะ สเต็กหมู');

        const currentUrl = page.url();
        expect(currentUrl).not.toBe('https://www.lotuss.com/th');
        expect(currentUrl).toContain('/search/');

        console.log('✓ Search works');

        // Test 2: Product exists
        console.log('Testing: Product visibility');
        const productItem = await SearchProductHelper.findProductInResults(page, productName);
        await expect(productItem).toBeVisible();
        console.log('✓ Product found');

        // Test 3: Navigation works
        console.log('Testing: Product navigation');
        const previousUrl = await SearchProductHelper.clickProduct(page, productName);
        await SearchProductHelper.verifyProductDetailPage(page, previousUrl);
        console.log('✓ Navigation works');

        console.log('✓ All tests passed in single run!');
    });
});
