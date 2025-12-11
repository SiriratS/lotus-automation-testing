import { Page, Locator } from '@playwright/test';
import { PageHelper } from './page-helper';

/**
 * Helper class for product search functionality on Lotus website
 * This class encapsulates common search and navigation actions
 */
export class SearchProductHelper {
    /**
     * Get search input locator
     * @param page - Playwright page object
     * @returns Search input locator
     */
    static getSearchInput(page: Page): Locator {
        return page.locator('#search-bar-input');
    }

    /**
     * Get product grid item locator
     * @param page - Playwright page object
     * @param productName - Full or partial product name
     * @returns Product grid item locator
     */
    static getProductGridItem(page: Page, productName: string): Locator {
        return page.locator(`.product-grid-item:has-text("${productName}")`).first();
    }

    /**
     * Get product link within a product item
     * @param productItem - Product item locator
     * @returns Product link locator
     */
    static getProductLink(productItem: Locator): Locator {
        return productItem.locator('a').first();
    }

    /**
     * Perform a search on Lotus website
     * @param page - Playwright page object
     * @param searchTerm - Term to search for
     */
    static async searchForProduct(page: Page, searchTerm: string): Promise<void> {
        const searchInput = this.getSearchInput(page);
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
        const productItem = this.getProductGridItem(page, productName);
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
        const productLink = this.getProductLink(productItem);
        await productLink.waitFor({ state: 'visible', timeout: 5000 });

        const beforeUrl = page.url();
        await productLink.click();
        await page.waitForTimeout(5000);

        return beforeUrl;
    }
}
