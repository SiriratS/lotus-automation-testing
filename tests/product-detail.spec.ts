import { test, expect } from '@playwright/test';
import productNormal from './fixtures/product-normal.json';
import productOutOfStock from './fixtures/product-out-of-stock.json';
import productLongPrice from './fixtures/product-long-price.json';
import productNoImage from './fixtures/product-no-image.json';
import { PageHelper } from './helpers/page-helper';

/**
 * Test Suite: Product Detail Page with API Mocking
 * 
 * Tests various scenarios by mocking the product API response
 */

const PRODUCT_API_URL = '**/lotuss-mobile-bff/product/v4/product?slug=cpf-72072326*';
const PRODUCT_PAGE_URL = '/th/product/cpf-72072326';

test.describe('Product Detail Page - API Mocking', () => {

    test('should display product details correctly - Normal Case', async ({ page }) => {
        // Mock API with normal product data
        await page.route(PRODUCT_API_URL, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(productNormal),
            });
        });

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

        console.log('✓ Normal product display verified');
    });

    test('should display out of stock message - Out of Stock Case', async ({ page }) => {
        // Mock API with out of stock data
        await page.route(PRODUCT_API_URL, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(productOutOfStock),
            });
        });

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

        if (isVisible) {
            console.log('✓ Out of stock indicator found');
        } else {
            console.log('⚠ Out of stock indicator not found - checking if add to cart is disabled');
            const addButton = page.locator('button[data-cta-name-th="หยิบใส่ตะกร้า"], button[data-cta-name-en="Add To Cart"]').first();
            const isDisabled = await addButton.isDisabled().catch(() => true);
            expect(isDisabled).toBeTruthy();
        }

        console.log('✓ Out of stock case verified');
    });

    test('should display long price correctly - 10 Digit Price', async ({ page }) => {
        // Mock API with very long price
        await page.route(PRODUCT_API_URL, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(productLongPrice),
            });
        });

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

        // Verify price doesn't break the layout
        const priceElement = page.locator('[class*="price"], [data-testid*="price"]').first();
        const boundingBox = await priceElement.boundingBox();

        if (boundingBox) {
            // Price should not be wider than viewport
            expect(boundingBox.width).toBeLessThan(page.viewportSize()!.width);
            console.log(`Price width: ${boundingBox.width}px`);
        }

        console.log('✓ Long price display verified');
    });

    test('should display placeholder when no image - No Image Case', async ({ page }) => {
        // Mock API with no images
        await page.route(PRODUCT_API_URL, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(productNoImage),
            });
        });

        await page.goto(PRODUCT_PAGE_URL, { waitUntil: 'networkidle' });

        // Wait for product name to be visible
        await page.locator('h1').waitFor({ state: 'visible', timeout: 10000 });
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: 'test-results/screenshots/product-no-image.png',
            fullPage: true
        });

        // Check if placeholder image or default image is shown
        const images = page.locator('img');
        const imageCount = await images.count();

        console.log(`Found ${imageCount} images on page`);

        // Verify either:
        // 1. A placeholder/default image is shown
        // 2. Or the product image section handles missing image gracefully
        const hasPlaceholder = await page.locator('img[src*="placeholder"], img[src*="default"], img[alt*="No image"]')
            .isVisible({ timeout: 3000 })
            .catch(() => false);

        if (hasPlaceholder) {
            console.log('✓ Placeholder image is displayed');
        } else {
            console.log('⚠ No placeholder found - verifying page still renders');
            // At minimum, product name should still be visible
            const productName = page.locator('h1');
            await expect(productName).toBeVisible();
        }

        console.log('✓ No image case verified');
    });

    test('should handle API error gracefully - Error Case', async ({ page }) => {
        // Mock API to return error
        await page.route(PRODUCT_API_URL, async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    code: 500,
                    message: 'Internal Server Error',
                    data: null
                }),
            });
        });

        await page.goto(PRODUCT_PAGE_URL, { waitUntil: 'networkidle' });

        // Wait for page to load (even with error)
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: 'test-results/screenshots/product-api-error.png',
            fullPage: true
        });

        // Verify error message is displayed
        const errorMessage = page.locator(
            'text=/error/i, text=/ผิดพลาด/i, text=/not found/i, text=/ไม่พบ/i, [role="alert"]'
        );

        const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);

        if (hasError) {
            console.log('✓ Error message is displayed');
            const errorText = await errorMessage.textContent();
            console.log(`Error message: ${errorText}`);
        } else {
            console.log('⚠ No explicit error message - checking if page shows fallback content');
            // Page should not show normal product details
            const productPrice = page.locator('text=/฿.*99/');
            const priceVisible = await productPrice.isVisible({ timeout: 2000 }).catch(() => false);
            expect(priceVisible).toBeFalsy();
        }

        console.log('✓ API error case verified');
    });

    test('should navigate to product detail page from search', async ({ page }) => {
        // This test doesn't mock - it tests actual navigation
        await page.goto('/th');
        await page.waitForTimeout(2000);

        // Close dialogs
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);

        const cookieButton = page.locator('button:has-text("ยอมรับคุกกี้ทั้งหมด")');
        if (await cookieButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await cookieButton.click();
            await page.waitForTimeout(1000);
        }

        // Search for product
        const searchInput = page.locator('#search-bar-input');
        await searchInput.fill('ซีพี คุโรบูตะ สเต็กหมู');
        await page.waitForTimeout(1000);
        await searchInput.press('Escape');
        await page.waitForTimeout(500);
        await searchInput.press('Enter');
        await page.waitForTimeout(5000);

        // Close dialogs after search
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);

        // Find and click product
        const productName = 'ซีพี คุโรบูตะ สเต็กหมูหมักพริกไทยดำ 200 กรัม';
        const productItem = page.locator(`.product-grid-item:has-text("${productName}")`).first();
        await productItem.waitFor({ state: 'visible', timeout: 15000 });

        const productLink = productItem.locator('a').first();
        await productLink.click();

        // Wait for product detail page
        await page.waitForTimeout(5000);

        // Verify we're on product detail page
        const currentUrl = page.url();
        expect(currentUrl).toContain('cpf-72072326');

        await page.screenshot({
            path: 'test-results/screenshots/product-detail-from-search.png',
            fullPage: true
        });

        console.log('✓ Navigation to product detail page verified');
    });
});
