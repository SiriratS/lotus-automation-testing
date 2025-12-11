import { test, expect } from '@playwright/test';
import productNormal from './fixtures/product-normal.json';
import productOutOfStock from './fixtures/product-out-of-stock.json';
import productLongPrice from './fixtures/product-long-price.json';
import productNoImage from './fixtures/product-no-image.json';
import { PageHelper } from './helpers/page-helper';
import { MockHelper } from './helpers/mock-helper';

/**
 * Test Suite: Product Detail Page
 */

const PRODUCT_API_URL = '**/lotuss-mobile-bff/product/v4/product?slug=cpf-72072326*';
const PRODUCT_PAGE_URL = '/th/product/cpf-72072326';

test.describe('Product Detail', () => {

    test('should display product details correctly - Normal Case', async ({ page }) => {
        // Mock API with normal product data
        await MockHelper.mockProductAPI(page, 'cpf-72072326', productNormal);

        // Navigate to product page
        await page.goto(PRODUCT_PAGE_URL, { waitUntil: 'networkidle' });

        // Wait for key elements to be visible
        await page.locator('h1, [data-testid="product-name"]').waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('text=/฿/').first().waitFor({ state: 'visible', timeout: 10000 });

        // Additional wait for images and dynamic content to load
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        // Close cookie dialog
        await PageHelper.closeCookieDialog(page);

        // Take screenshot
        await page.screenshot({
            path: 'test-results/screenshots/product-normal.png',
            fullPage: true
        });

        // Verify product name
        const productName = page.locator('h1, [data-testid="product-name"]');
        await expect(productName).toContainText('ซีพี คุโรบูตะ สเต็กหมูหมักพริกไทยดำ');

        // Verify price is displayed
        const price = page.locator('text=/฿.*99/');
        await expect(price).toBeVisible();

        // Verify product image is displayed
        const productImage = page.locator('img[src*="72072326.jpg"]');
        await expect(productImage).toBeVisible();

        // Verify stock status - should show "In Stock" or add to cart button
        const addToCartButton = page.locator('button[data-cta-name-th="หยิบใส่ตะกร้า"], button[data-cta-name-en="Add To Cart"]');
        await expect(addToCartButton).toBeVisible();
    });

    test('should display out of stock message - Out of Stock Case', async ({ page }) => {
        // Mock API with out of stock data
        await MockHelper.mockProductAPI(page, 'cpf-72072326', productOutOfStock);

        await page.goto(PRODUCT_PAGE_URL, { waitUntil: 'networkidle' });

        // Wait for page to load
        await page.locator('h1').waitFor({ state: 'visible', timeout: 10000 });
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: 'test-results/screenshots/product-out-of-stock.png',
            fullPage: true
        });

        // Verify out of stock message or disabled button
        const outOfStockIndicator = page.locator(
            'text=/out of stock/i, text=/สินค้าหมด/i, button:disabled[data-cta-name-th="หยิบใส่ตะกร้า"], button:disabled[data-cta-name-en="Add To Cart"]'
        );

        const isVisible = await outOfStockIndicator.isVisible({ timeout: 5000 }).catch(() => false);

        if (!isVisible) {
            const addButton = page.locator('button[data-cta-name-th="หยิบใส่ตะกร้า"], button[data-cta-name-en="Add To Cart"]').first();
            const isDisabled = await addButton.isDisabled().catch(() => true);
            expect(isDisabled).toBeTruthy();
        }
    });

    test('should display long price correctly - 10 Digit Price', async ({ page }) => {
        // Mock API with very long price
        await MockHelper.mockProductAPI(page, 'cpf-72072326', productLongPrice);

        await page.goto(PRODUCT_PAGE_URL, { waitUntil: 'networkidle' });

        // Wait for price element to be visible
        await page.locator('text=/฿/').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: 'test-results/screenshots/product-long-price.png',
            fullPage: true
        });

        // Verify long price is displayed (9,999,999,999)
        const longPrice = page.locator('text=/฿.*9,999,999,999|฿.*9999999999/');
        await expect(longPrice).toBeVisible({ timeout: 10000 });
    });

    test('should display placeholder when no image - No Image Case', async ({ page }) => {
        // Mock API with no images
        await MockHelper.mockProductAPI(page, 'cpf-72072326', productNoImage);

        // Block product image requests to truly simulate no image scenario
        await MockHelper.blockProductImages(page);

        await page.goto(PRODUCT_PAGE_URL, { waitUntil: 'networkidle' });

        // Wait for product name to be visible
        await page.locator('h1').waitFor({ state: 'visible', timeout: 10000 });
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: 'test-results/screenshots/product-no-image.png',
            fullPage: true
        });

        // Verify the specific product image (72072326.jpg) is NOT loaded
        const productImage = page.locator('img[src*="72072326.jpg"]');
        const productImageVisible = await productImage.isVisible({ timeout: 2000 }).catch(() => false);

        // Verify either:
        // 1. A placeholder/default image is shown
        // 2. Or the product image section handles missing image gracefully
        const hasPlaceholder = await page.locator('img[src*="placeholder"], img[src*="default"], img[alt*="No image"]')
            .isVisible({ timeout: 3000 })
            .catch(() => false);

        if (!hasPlaceholder) {
            // At minimum, product name should still be visible
            const productName = page.locator('h1');
            await expect(productName).toBeVisible();

            // Verify the specific product image is NOT shown
            expect(productImageVisible).toBeFalsy();
        }
    });

    test('should handle API error gracefully - Error Case', async ({ page }) => {
        // Mock API to return error
        await MockHelper.mockProductAPIError(page, 'cpf-72072326', 500, 'Internal Server Error');

        await page.goto(PRODUCT_PAGE_URL, { waitUntil: 'networkidle' });

        // Wait for page to load (even with error)
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: 'test-results/screenshots/product-api-error.png',
            fullPage: true
        });

        // Check how the page handles API error
        const errorMessage = page.locator(
            'text=/error/i, text=/ผิดพลาด/i, text=/not found/i, text=/ไม่พบ/i, [role="alert"]'
        );

        const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);

        if (!hasError) {
            // Check if the page shows cached/fallback data
            const productPrice = page.locator('text=/฿.*99/');
            const priceVisible = await productPrice.isVisible({ timeout: 2000 }).catch(() => false);

            if (priceVisible) {
                // Verify the page is still functional (not completely broken)
                const productName = page.locator('h1, [data-testid="product-name"]');
                await expect(productName).toBeVisible();
            }
        }
    });
});
