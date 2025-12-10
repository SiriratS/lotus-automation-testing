import { Page, expect } from '@playwright/test';
import { PageHelper } from './page-helper';

/**
 * Abstract helper class for product search functionality on Lotus website
 * This class encapsulates common search and navigation actions
 */
export abstract class SearchProductHelper {
    /**
     * Perform a search on Lotus website
     * @param page - Playwright page object
     * @param searchTerm - Term to search for
     */
    static async searchForProduct(page: Page, searchTerm: string): Promise<void> {
        console.log(`Searching for: ${searchTerm}`);

        const searchInput = page.locator('#search-bar-input');
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });

        await searchInput.fill(searchTerm);
        await page.waitForTimeout(1000);

        // Close autocomplete dropdown
        await searchInput.press('Escape');
        await page.waitForTimeout(500);

        // Submit search
        await searchInput.press('Enter');
        await page.waitForTimeout(5000);

        // Close any dialogs that appear after search
        await PageHelper.closeAllDialogs(page);
    }

    /**
     * Find a product in search results by name
     * @param page - Playwright page object
     * @param productName - Full or partial product name
     * @returns The product item locator
     */
    static async findProductInResults(page: Page, productName: string) {
        console.log(`Looking for product: ${productName}`);

        const productItem = page.locator(`.product-grid-item:has-text("${productName}")`).first();
        await productItem.waitFor({ state: 'visible', timeout: 15000 });

        return productItem;
    }

    /**
     * Click on a product to navigate to its detail page
     * @param page - Playwright page object
     * @param productName - Product name to click on
     * @returns The URL before clicking (for verification)
     */
    static async clickProduct(page: Page, productName: string): Promise<string> {
        const productItem = await this.findProductInResults(page, productName);

        // Find clickable link within the product item
        const productLink = productItem.locator('a').first();
        await productLink.waitFor({ state: 'visible', timeout: 5000 });

        const beforeUrl = page.url();
        await productLink.click();
        await page.waitForTimeout(5000);

        return beforeUrl;
    }

    /**
     * Verify navigation to product detail page
     * @param page - Playwright page object
     * @param previousUrl - URL before navigation
     */
    static async verifyProductDetailPage(page: Page, previousUrl: string): Promise<void> {
        const currentUrl = page.url();
        expect(currentUrl).not.toBe(previousUrl);

        console.log(`✓ Navigated from ${previousUrl} to ${currentUrl}`);
    }
}
