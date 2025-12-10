# Lotus's Playwright Automation Testing

Comprehensive end-to-end testing framework for the Lotus's e-commerce website using Playwright and TypeScript.

## 🚀 Features

- ✅ Product search and selection test cases
- ✅ Multi-browser testing (Chromium, Firefox, WebKit)
- ✅ Mobile device testing (iOS & Android)
- ✅ Three different API mocking strategies
- ✅ Screenshot and video recording on failures
- ✅ TypeScript for type safety
- ✅ Detailed HTML test reports

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

   This will download Chromium, Firefox, and WebKit browsers.

## 🧪 Running Tests

### Run all tests (headless mode)
```bash
npm test
```

### Run tests with visible browser
```bash
npm run test:headed
```

### Run tests in UI mode (interactive debugging)
```bash
npm run test:ui
```

### Run specific test file
```bash
npx playwright test tests/search-product.spec.ts
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests on mobile devices
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Debug mode
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

## 📁 Project Structure

```
automation-testing/
├── tests/
│   ├── search-product.spec.ts          # Main test cases
│   ├── mocks/
│   │   ├── route-interception.spec.ts  # API mocking approach 1
│   │   └── proxy-server.spec.ts        # API mocking approach 3
│   └── fixtures/
│       └── product-mock-data.json      # Mock API response data
├── utils/
│   └── proxy-server.ts                 # Reusable proxy server utility
├── playwright.config.ts                # Playwright configuration
├── tsconfig.json                       # TypeScript configuration
└── package.json                        # Project dependencies
```

## 🎯 Test Cases

### 1. Product Search
Tests searching for "ซีพี คุโรบูตะ สเต็กหมู" on the Lotus's website.

**File:** `tests/search-product.spec.ts`

```bash
npx playwright test tests/search-product.spec.ts -g "should search"
```

### 2. Product Selection
Tests selecting the specific product "ซีพี คุโรบูตะ สเต็กหมูหมักพริกไทยดำ 200 กรัม" from search results.

**File:** `tests/search-product.spec.ts`

```bash
npx playwright test tests/search-product.spec.ts -g "should select"
```

### 3. Complete User Journey
Tests the full flow: search → select → view product details.

**File:** `tests/search-product.spec.ts`

```bash
npx playwright test tests/search-product.spec.ts -g "complete full user journey"
```

## 🎭 API Mocking Strategies

This project demonstrates three different approaches to mock the Lotus's product API:

### Approach 1: Route Interception (Recommended for most cases)

**Pros:** Simple, built-in, no external dependencies  
**Cons:** Limited to Playwright tests only

**File:** `tests/mocks/route-interception.spec.ts`

```typescript
await page.route('**/lotuss-mobile-bff/product/v4/product*', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData),
  });
});
```

**Run tests:**
```bash
npx playwright test tests/mocks/route-interception.spec.ts
```

**Features:**
- ✅ Mock API responses
- ✅ Modify responses on the fly
- ✅ Simulate errors (500, 404, etc.)
- ✅ Simulate slow network
- ✅ Log all API requests

### Approach 2: Proxy Server (Advanced)

**Pros:** Full control, works with any browser, request logging  
**Cons:** More complex setup

**File:** `tests/mocks/proxy-server.spec.ts`

**Run tests:**
```bash
npx playwright test tests/mocks/proxy-server.spec.ts
```

**Standalone proxy server:**
```bash
npx ts-node utils/proxy-server.ts
```

Then configure your browser to use proxy: `http://localhost:8888`

## 🔧 Configuration

### Playwright Configuration

Edit `playwright.config.ts` to customize:

- **Timeout:** Change `timeout` value (default: 60000ms)
- **Browsers:** Enable/disable browsers in `projects` array
- **Screenshots:** Modify `screenshot` setting
- **Videos:** Modify `video` setting
- **Base URL:** Change `baseURL` if testing different environment

### TypeScript Configuration

Edit `tsconfig.json` for TypeScript settings.

## 📸 Screenshots & Videos

- **Screenshots:** Saved to `test-results/screenshots/` on failure
- **Videos:** Saved to `test-results/` on failure
- **Traces:** Saved to `test-results/` for debugging

## 🐛 Debugging

### Visual debugging with UI mode
```bash
npm run test:ui
```

### Step-by-step debugging
```bash
npm run test:debug
```

### Generate code with Codegen
```bash
npm run test:codegen
```

This opens a browser where you can interact with the site, and Playwright will generate test code for you!

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

This opens an interactive report showing:
- ✅ Passed/failed tests
- 📸 Screenshots
- 🎥 Videos
- 📝 Detailed logs
- ⏱️ Execution time

## 🔍 Troubleshooting

### Tests are failing with timeout errors

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
timeout: 90000, // Increase to 90 seconds
```

### Selectors not finding elements

**Solution:** Use Playwright Inspector to find correct selectors:
```bash
npm run test:debug
```

### API mocking not working

**Solution:** Ensure route interception is set up BEFORE navigating to the page:
```typescript
await page.route('**/api/**', ...);  // Set up route first
await page.goto('/product');          // Then navigate
```

### Proxy server not intercepting requests

**Solution:** Verify proxy configuration in browser context:
```typescript
const context = await browser.newContext({
  proxy: { server: 'http://localhost:8888' }
});
```

## 📚 Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for network idle** before assertions: `await page.waitForLoadState('networkidle')`
3. **Use Page Object Model** for reusable components
4. **Mock external APIs** to avoid flaky tests
5. **Take screenshots** at key points for debugging
6. **Run tests in parallel** for faster execution
7. **Use TypeScript** for better IDE support and type safety

## 🔗 Useful Links

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Lotus's Website](https://www.lotuss.com/th)

## 📝 Example: Adding a New Test

```typescript
import { test, expect } from '@playwright/test';

test('should add product to cart', async ({ page }) => {
  // Navigate to product page
  await page.goto('/th/product/cpf-72072326');
  
  // Click add to cart button
  await page.click('button:has-text("เพิ่มลงตะกร้า")');
  
  // Verify cart count increased
  const cartCount = page.locator('[data-testid="cart-count"]');
  await expect(cartCount).toHaveText('1');
});
```

## 🤝 Contributing

1. Create a new branch for your feature
2. Write tests following existing patterns
3. Ensure all tests pass: `npm test`
4. Submit a pull request

## 📄 License

ISC

---

**Happy Testing! 🎉**
