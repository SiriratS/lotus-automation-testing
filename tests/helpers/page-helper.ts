import { Page } from '@playwright/test';

/**
 * Abstract helper class for general page-level utilities
 * Contains reusable functions that can be used across all pages
 */
export abstract class PageHelper {
    /**
     * Close all dialogs and popups on the page
     * Useful for dismissing cookie banners, modals, and other overlays
     */
    static async closeAllDialogs(page: Page): Promise<void> {
        console.log('Closing all dialogs...');

        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);

        await this.closeCookieDialog(page);

        const closeButtons = page.locator('button[aria-label*="lose"], button[aria-label*="ปิด"], button:has-text("ปิด"), button:has-text("×")');
        const count = await closeButtons.count();

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const btn = closeButtons.nth(i);
                if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                    await btn.click();
                    await page.waitForTimeout(1000);
                }
            }
        }

        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
    }

    /**
     * Close cookie consent dialog
     * Accepts all cookies if the dialog is visible
     */
    static async closeCookieDialog(page: Page): Promise<void> {
        const cookieButton = page.locator('button:has-text("ยอมรับคุกกี้ทั้งหมด")');
        if (await cookieButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await cookieButton.click();
            await page.waitForTimeout(1000);
        }
    }

    /**
     * Wait for page to be fully loaded
     * Combines multiple wait strategies for reliability
     */
    static async waitForPageLoad(page: Page): Promise<void> {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('networkidle');
    }

    /**
     * Take a screenshot with a standardized naming convention
     * @param page - Playwright page object
     * @param name - Screenshot name (without extension)
     * @param fullPage - Whether to capture full page or just viewport
     */
    static async takeScreenshot(page: Page, name: string, fullPage: boolean = true): Promise<void> {
        await page.screenshot({
            path: `test-results/screenshots/${name}.png`,
            fullPage
        });
        console.log(`📸 Screenshot saved: ${name}.png`);
    }
}
