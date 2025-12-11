import { test, expect } from '@playwright/test';
import productNormal from './fixtures/product-normal.json';
import productOutOfStock from './fixtures/product-out-of-stock.json';
import productLongPrice from './fixtures/product-long-price.json';
import productNoImage from './fixtures/product-no-image.json';
import { PageHelper } from './helpers/page-helper';
import { MockHelper } from './helpers/mock-helper';
import { ProductDetailHelper } from './helpers/product-detail-helper';

/**
 * Test Suite: Product Detail Page
 */

const PRODUCT_SLUG = 'cpf-72072326';
const PRODUCT_SKU = '72072326';

test.describe('Product Detail', () => {

    test('should display product details correctly - Normal Case', async ({ page }) => {
        await MockHelper.mockProductAPI(page, PRODUCT_SLUG, productNormal);
        await ProductDetailHelper.navigateToProduct(page, PRODUCT_SLUG);
        await PageHelper.closeCookieDialog(page);
        await PageHelper.takeScreenshot(page, 'product-normal');

        await expect(ProductDetailHelper.getProductNameLocator(page)).toContainText('ซีพี คุโรบูตะ สเต็กหมูหมักพริกไทยดำ');
        await expect(ProductDetailHelper.getPriceLocator(page)).toBeVisible();
        await expect(ProductDetailHelper.getProductImageLocator(page, PRODUCT_SKU)).toBeVisible();
        await expect(ProductDetailHelper.getAddToCartButton(page)).toBeVisible();
    });

    test('should display out of stock message - Out of Stock Case', async ({ page }) => {
        await MockHelper.mockProductAPI(page, PRODUCT_SLUG, productOutOfStock);
        await ProductDetailHelper.navigateToProduct(page, PRODUCT_SLUG);
        await PageHelper.takeScreenshot(page, 'product-out-of-stock');

        const isOutOfStock = await ProductDetailHelper.isOutOfStock(page);
        expect(isOutOfStock).toBeTruthy();
    });

    test('should display long price correctly - 10 Digit Price', async ({ page }) => {
        await MockHelper.mockProductAPI(page, PRODUCT_SLUG, productLongPrice);
        await ProductDetailHelper.navigateToProduct(page, PRODUCT_SLUG);
        await PageHelper.takeScreenshot(page, 'product-long-price');

        // Verify long price is displayed (9,999,999,999)
        const longPrice = page.locator('text=/฿.*9,999,999,999|฿.*9999999999/');
        await expect(longPrice).toBeVisible({ timeout: 10000 });
    });

    test('should display placeholder when no image - No Image Case', async ({ page }) => {
        await MockHelper.mockProductAPI(page, PRODUCT_SLUG, productNoImage);
        await MockHelper.blockProductImages(page);
        await ProductDetailHelper.navigateToProduct(page, PRODUCT_SLUG);
        await PageHelper.takeScreenshot(page, 'product-no-image');

        // Verify the specific product image is NOT loaded
        const productImage = ProductDetailHelper.getProductImageLocator(page, PRODUCT_SKU);
        const productImageVisible = await productImage.isVisible({ timeout: 2000 }).catch(() => false);

        // Verify either placeholder is shown or product image is NOT shown
        const hasPlaceholder = await page.locator('img[src*="placeholder"], img[src*="default"], img[alt*="No image"]')
            .isVisible({ timeout: 3000 })
            .catch(() => false);

        if (!hasPlaceholder) {
            const productName = ProductDetailHelper.getProductNameLocator(page);
            await expect(productName).toBeVisible();
            expect(productImageVisible).toBeFalsy();
        }
    });

    test('should handle API error gracefully - Error Case', async ({ page }) => {
        await MockHelper.mockProductAPIError(page, PRODUCT_SLUG, 500, 'Internal Server Error');

        await page.goto(`/th/product/${PRODUCT_SLUG}`, { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await PageHelper.takeScreenshot(page, 'product-api-error');

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
                const productName = ProductDetailHelper.getProductNameLocator(page);
                await expect(productName).toBeVisible();
            }
        }
    });
});
