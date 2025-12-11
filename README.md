# Lotus's Playwright Automation Testing

Comprehensive end-to-end testing framework for the Lotus's e-commerce website using Playwright and TypeScript.

## 🚀 Features

- ✅ **Feature-Based Architecture**: Modular structure grouped by domain (Search, Product Detail)
- ✅ **Smart Wait Strategies**: Uses `networkidle` and element-specific waits for reliability
- ✅ **Self-Recording Demo Mode**: Automated video recording with slow-motion execution
- ✅ **Integrated API Mocking**: Native Playwright interception with co-located mock data
- ✅ **Code Quality**: Strict linting with ESLint and TypeScript
- ✅ **Cross-Browser & Mobile**: Tested on Chromium, Firefox, WebKit, iOS, and Android

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

### 🎥 Run Demo (Best for Presentation)
Executes tests in **visible mode** with **slow motion** and **records video** automatically.
```bash
npm run test:demo
```
*Videos will be saved in `test-results/` directory.*

### Run all tests (headless)
```bash
npm test
```

### Run with visible browser
```bash
npm run test:headed
```

### Interactive UI Mode (Debugging)
```bash
npm run test:ui
```

### View Test Report
```bash
npm run test:report
```

## 🧹 Code Quality

Check code quality and style:
```bash
npm run lint
```

Auto-fix issues:
```bash
npm run lint:fix
```

## 📁 Project Structure

```
automation-testing/
├── tests/
│   ├── search-product/             # Feature: Product Search
│   │   ├── search-product.spec.ts  # Test definitions
│   │   ├── search-product-helper.ts# Helper logic
│   │   └── mocks/                  # Co-located mock data
│   │       └── search-not-found.json
│   │
│   ├── product-detail/             # Feature: Product Detail
│   │   ├── product-detail.spec.ts
│   │   ├── product-detail-helper.ts
│   │   └── mocks/
│   │       ├── product-normal.json
│   │       ├── product-out-of-stock.json
│   │       └── ...
│   │
│   └── shared/                     # Shared Utilities
│       ├── page-helper.ts          # Global page actions (Cookies, Dialogs)
│       └── mock-helper.ts          # API Interception logic
│
├── playwright.config.ts            # Main Config
├── playwright.demo.config.ts       # Demo Mode Config
├── eslint.config.js                # Linting Config
└── package.json
```

## 🧩 Shared Helpers

### PageHelper (`tests/shared/page-helper.ts`)
General utilities usable across all tests:
- `closeAllDialogs(page)`: Closes ads, popups, and cookie banners
- `closeCookieDialog(page)`: Handles cookie consent specifically
- `waitForPageLoad(page)`: Combines `domcontentloaded` + `networkidle`
- `takeScreenshot(page)`: Standardized screenshot capturing

### MockHelper (`tests/shared/mock-helper.ts`)
Centralizer API interception logic:
- `mockProductAPI(page, slug, data)`: Mocks product detail responses
- `mockSearchAPI(page, data)`: Mocks search results

## 📚 Best Practices

### 1. Wait Strategies
Avoid fixed timeouts. Use smart waits:
```typescript
// ✅ Good
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('h1').waitFor({ state: 'visible' });
```

### 2. Robust Selectors
Prefer data attributes:
```typescript
// ✅ Good
page.locator('button[data-cta-name-en="Add To Cart"]')
```

## 📜 License
ISC
