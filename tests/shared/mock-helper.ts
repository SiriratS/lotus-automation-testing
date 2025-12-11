import { Page, Route } from '@playwright/test';

/**
 * Helper class for mocking API responses in Playwright tests
 */
export class MockHelper {
    /**
     * Mock a product API endpoint with custom data
     * @param page - Playwright page object
     * @param productSlug - Product slug (e.g., 'cpf-72072326')
     * @param mockData - Mock response data
     * @param status - HTTP status code (default: 200)
     */
    static async mockProductAPI(
        page: Page,
        productSlug: string,
        mockData: any,
        status: number = 200
    ): Promise<void> {
        const apiUrl = `**/lotuss-mobile-bff/product/v4/product?slug=${productSlug}*`;

        await page.route(apiUrl, async (route: Route) => {
            await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify(mockData),
            });
        });
    }

    /**
     * Mock a search API endpoint with custom data
     * @param page - Playwright page object
     * @param mockData - Mock response data
     * @param status - HTTP status code (default: 200)
     */
    static async mockSearchAPI(
        page: Page,
        mockData: any,
        status: number = 200
    ): Promise<void> {
        const apiUrl = '**/lotuss-mobile-bff/product/v5/search*';

        await page.route(apiUrl, async (route: Route) => {
            await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify(mockData),
            });
        });
    }

    /**
     * Block product images from loading (useful for testing no-image scenarios)
     * @param page - Playwright page object
     */
    static async blockProductImages(page: Page): Promise<void> {
        await page.route('**/o2o-static.lotuss.com/products/**/*.jpg', async (route: Route) => {
            await route.abort('failed');
        });
        await page.route('**/o2o-static.lotuss.com/products/**/*.png', async (route: Route) => {
            await route.abort('failed');
        });
        await page.route('**/o2o-static.lotuss.com/products/**/*.webp', async (route: Route) => {
            await route.abort('failed');
        });
    }

    /**
     * Mock API error response
     * @param page - Playwright page object
     * @param apiPattern - API URL pattern to mock
     * @param errorCode - HTTP error code (default: 500)
     * @param errorMessage - Error message (default: 'Internal Server Error')
     */
    static async mockAPIError(
        page: Page,
        apiPattern: string,
        errorCode: number = 500,
        errorMessage: string = 'Internal Server Error'
    ): Promise<void> {
        await page.route(apiPattern, async (route: Route) => {
            await route.fulfill({
                status: errorCode,
                contentType: 'application/json',
                body: JSON.stringify({
                    code: errorCode,
                    message: errorMessage,
                    data: null
                }),
            });
        });
    }

    /**
     * Mock product API with error
     * @param page - Playwright page object
     * @param productSlug - Product slug
     * @param errorCode - HTTP error code (default: 500)
     * @param errorMessage - Error message (default: 'Internal Server Error')
     */
    static async mockProductAPIError(
        page: Page,
        productSlug: string,
        errorCode: number = 500,
        errorMessage: string = 'Internal Server Error'
    ): Promise<void> {
        const apiUrl = `**/lotuss-mobile-bff/product/v4/product?slug=${productSlug}*`;
        await this.mockAPIError(page, apiUrl, errorCode, errorMessage);
    }

    /**
     * Clear all route mocks
     * @param page - Playwright page object
     */
    static async clearMocks(page: Page): Promise<void> {
        await page.unroute('**/*');
    }

    /**
     * Mock multiple API endpoints at once
     * @param page - Playwright page object
     * @param mocks - Array of mock configurations
     */
    static async mockMultipleAPIs(
        page: Page,
        mocks: Array<{
            pattern: string;
            data: any;
            status?: number;
        }>
    ): Promise<void> {
        for (const mock of mocks) {
            await page.route(mock.pattern, async (route: Route) => {
                await route.fulfill({
                    status: mock.status || 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mock.data),
                });
            });
        }
    }
}
