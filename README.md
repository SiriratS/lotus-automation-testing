# Lotus's Playwright Automation Testing

Comprehensive end-to-end testing framework for the Lotus's e-commerce website using Playwright and TypeScript.

## 🚀 Features

- ✅ **Smart Wait Strategies**: Uses `networkidle` and element-specific waits for reliability
- ✅ **Robust Selectors**: Prioritizes `data-testid` and `data-cta-name-*` attributes
- ✅ **Helper Class Architecture**: Reusable `PageHelper` and `SearchProductHelper`
- ✅ **Integrated API Mocking**: Hybrid approach using fixtures within test files
- ✅ **Media Capture**: Auto-screenshots and videos on failure
- ✅ **Cross-Browser & Mobile**: Tested on Chromium, Firefox, WebKit, iOS, and Android
- ✅ **Type-Safe**: Full TypeScript implementation

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

## 🧪 Running Tests

### Run all tests (headless)
```bash
npm test
```

### Run with visible browser
```bash
npm run test:headed
```

### Interactive UI Mode (Recommended for debugging)
```bash
npm run test:ui
```
This mode lets you see each step, explore selectors, and view network requests in real-time.

### Run specific test suites
```bash
npx playwright test tests/search-product.spec.ts
npx playwright test tests/product-detail.spec.ts
```

### View Test Report
```bash
npm run test:report
```

### Export Report to PDF
After running tests, you can export the HTML report to PDF:
```bash
npm run export:pdf
```
This will generate `test-report.pdf` in the project root with:
- Formatted A4 pages with margins
- Header showing "Playwright Test Report"
- Footer with page numbers
- All test results, screenshots, and traces

## 📁 Project Structure

```
automation-testing/
├── tests/
│   ├── search-product.spec.ts          # Search & Navigation tests
│   ├── product-detail.spec.ts          # Product Detail & API Mocking tests
│   ├── helpers/
│   │   ├── page-helper.ts              # General page utilities (Dialogs, Cookies)
│   │   └── search-product-helper.ts    # Search-specific logic
│   └── fixtures/
│       ├── product-normal.json         # Standard product data
│       ├── product-out-of-stock.json   # Out of stock scenario
│       ├── product-long-price.json     # Edge case data
│       └── product-no-image.json       # Missing image scenario
├── utils/
│   └── proxy-server.ts                 # Standalone proxy utility
├── playwright.config.ts                # Configuration
└── package.json
```

## 🧩 Helper Classes

### PageHelper (`tests/helpers/page-helper.ts`)
General utilities usable across all tests:
- `closeAllDialogs(page)`: Closes ads, popups, and cookie banners
- `closeCookieDialog(page)`: Handles cookie consent specifically
- `waitForPageLoad(page)`: Combines `domcontentloaded` + `networkidle`
- `takeScreenshot(page)`: Standardized screenshot capturing

### SearchProductHelper (`tests/helpers/search-product-helper.ts`)
Domain-specific logic for product operations:
- `searchForProduct(page)`: Handles search interaction and autocomplete
- `findProductInResults(page)`: Locates specific products in the grid
- `clickProduct(page)`: Navigates to detail page with verification

## 🎭 API Mocking Strategy

We use Playwright's route interception directly within `product-detail.spec.ts` to test various UI states without relying on the live backend data.

**Example from `tests/product-detail.spec.ts`:**
```typescript
import productOutOfStock from './fixtures/product-out-of-stock.json';

await page.route('**/lotuss-mobile-bff/product/v4/product*', async (route) => {
    await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productOutOfStock),
    });
});
```

## 📚 Best Practices

### 1. Wait Strategies
Avoid fixed timeouts (e.g., `waitForTimeout(3000)`). Instead, use smart waits:
```typescript
// ✅ Good
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('h1').waitFor({ state: 'visible' });

// ❌ Avoid
await page.waitForTimeout(5000);
```

### 2. Robust Selectors
Prefer data attributes over text content which changes with language/design.
```typescript
// ✅ Good
page.locator('button[data-cta-name-en="Add To Cart"]')

// ⚠️ Risky (Fragile)
page.locator('text="Add To Cart"')
```

### 3. Handle Dynamic Content
Use `PageHelper.closeAllDialogs(page)` to handle random popups that block interaction.

## 🐛 Troubleshooting

### Tests failing on CI?
Ensure `networkidle` is used, as CI networks can be slower. Check `playwright.config.ts` to increase timeouts if necessary.

### Selectors failing?
Use the Playwright Inspector:
```bash
npm run test:debug
```

## 📜 License
ISC
