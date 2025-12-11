import { Page, Locator } from '@playwright/test';

/**
 * Helper class for product detail page functionality
 * Provides reusable methods for navigation, element location, and verification
 */
export class ProductDetailHelper {
    /**
     * Navigate to a product detail page and wait for it to load
     * @param page - Playwright page object
     * @param productSlug - Product slug (e.g., 'cpf-72072326')
     */
    static async navigateToProduct(page: Page, productSlug: string): Promise<void> {
        await page.goto(`/th/product/${productSlug}`, { waitUntil: 'networkidle' });
        await this.waitForProductPageLoad(page);
    }

    /**
     * Wait for product page to fully load
     * @param page - Playwright page object
     */
    static async waitForProductPageLoad(page: Page): Promise<void> {
        // Wait for key elements to be visible
        await page.locator('h1, [data-testid="product-name"]').waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('text=/฿/').first().waitFor({ state: 'visible', timeout: 10000 });

        // Additional wait for dynamic content
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
    }

    /**
     * Get product name locator
     * @param page - Playwright page object
     * @returns Product name locator
     */
    static getProductNameLocator(page: Page): Locator {
        return page.locator('h1, [data-testid="product-name"]');
    }

    /**
     * Get price locator
     * @param page - Playwright page object
     * @returns Price locator
     */
    static getPriceLocator(page: Page): Locator {
        return page.locator('text=/฿/').first();
    }

    /**
     * Get product image locator
     * @param page - Playwright page object
     * @param productSku - Product SKU (e.g., '72072326')
     * @returns Product image locator
     */
    static getProductImageLocator(page: Page, productSku: string): Locator {
        return page.locator(`img[src*="${productSku}.jpg"]`);
    }

    /**
     * Get add to cart button locator
     * @param page - Playwright page object
     * @returns Add to cart button locator
     */
    static getAddToCartButton(page: Page): Locator {
        return page.locator('button[data-cta-name-th="หยิบใส่ตะกร้า"], button[data-cta-name-en="Add To Cart"]');
    }

    /**
     * Get out of stock indicator locator
     * @param page - Playwright page object
     * @returns Out of stock indicator locator
     */
    static getOutOfStockIndicator(page: Page): Locator {
        return page.locator(
            'text=/out of stock/i, text=/สินค้าหมด/i, button:disabled[data-cta-name-th="หยิบใส่ตะกร้า"], button:disabled[data-cta-name-en="Add To Cart"]'
        );
    }

    /**
     * Check if product is out of stock
     * Returns true if out of stock indicator is visible or add to cart is disabled
     * @param page - Playwright page object
     * @returns Promise<boolean> - True if out of stock
     */
    static async isOutOfStock(page: Page): Promise<boolean> {
        const outOfStockIndicator = this.getOutOfStockIndicator(page);
        const isVisible = await outOfStockIndicator.isVisible({ timeout: 5000 }).catch(() => false);

        if (isVisible) {
            return true;
        }

        // Check if add to cart button is disabled
        const addButton = this.getAddToCartButton(page).first();
        const isDisabled = await addButton.isDisabled().catch(() => true);
        return isDisabled;
    }
}
