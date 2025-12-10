# Product Detail Page Tests

## Overview

Comprehensive test suite for the product detail page with API mocking to test various scenarios.

## Test Cases

### 1. Normal Case ✅
**File:** `product-normal.json`  
**Tests:** Product displays correctly with all information
- Product name visible
- Price displayed (฿99)
- Product image loaded
- Add to cart button enabled

### 2. Out of Stock 📦
**File:** `product-out-of-stock.json`  
**Tests:** Out of stock handling
- Out of stock message displayed
- Add to cart button disabled
- Stock status shows 0

### 3. Long Price (10 Digits) 💰
**File:** `product-long-price.json`  
**Tests:** UI handles very long prices
- Price: ฿9,999,999,999
- Layout doesn't break
- Price is readable
- No overflow issues

### 4. No Image 🖼️
**File:** `product-no-image.json`  
**Tests:** Missing image handling
- Placeholder image shown OR
- Page renders without image
- No broken image icons
- Product info still accessible

### 5. API Error ⚠️
**Tests:** Error handling when API fails
- Returns 500 error
- Error message displayed
- Page doesn't crash
- Graceful degradation

### 6. Navigation from Search 🔍
**Tests:** End-to-end user journey
- Search for product
- Click on product from results
- Navigate to detail page
- URL contains product slug

## Running Tests

```bash
# Run all product detail tests
npx playwright test product-detail.spec.ts

# Run specific test
npx playwright test product-detail.spec.ts -g "Normal Case"

# Run in UI mode
npx playwright test product-detail.spec.ts --ui

# Run in headed mode (see browser)
npx playwright test product-detail.spec.ts --headed
```

## API Mocking

Tests use Playwright's `route.fulfill()` to mock API responses:

```typescript
await page.route('**/product/v4/product?slug=cpf-72072326*', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify(mockData),
  });
});
```

## Mock Data Files

Located in `tests/fixtures/`:
- `product-normal.json` - Real API response
- `product-out-of-stock.json` - stockStatus: "OUT_OF_STOCK"
- `product-long-price.json` - price: 9,999,999,999
- `product-no-image.json` - mediaGallery: []

## Screenshots

Tests generate screenshots in `test-results/screenshots/`:
- `product-normal.png`
- `product-out-of-stock.png`
- `product-long-price.png`
- `product-no-image.png`
- `product-api-error.png`
- `product-detail-from-search.png`

## Test Structure

Each test follows the AAA pattern:

```typescript
test('scenario', async ({ page }) => {
  // ARRANGE: Mock API
  await page.route(API_URL, async (route) => {
    await route.fulfill({ body: mockData });
  });

  // ACT: Navigate to page
  await page.goto(PRODUCT_PAGE_URL);

  // ASSERT: Verify behavior
  await expect(element).toBeVisible();
});
```

## Selectors Used

Tests use flexible selectors to work with various UI implementations:

- Product name: `h1, [data-testid="product-name"]`
- Price: `text=/฿.*99/`
- Image: `img[src*="72072326.jpg"]`
- Add to cart: `button:has-text("Add"), button:has-text("เพิ่ม")`
- Out of stock: `text=/out of stock/i, text=/สินค้าหมด/i`

## Best Practices Demonstrated

1. ✅ **API Mocking** - Tests don't depend on real API
2. ✅ **Independent Tests** - Each test can run alone
3. ✅ **Edge Cases** - Tests boundary conditions
4. ✅ **Error Handling** - Tests failure scenarios
5. ✅ **Screenshots** - Visual proof of test results
6. ✅ **Flexible Selectors** - Works with UI changes

## Troubleshooting

### Test fails with "element not found"
- Check if selectors match your UI
- Increase timeout if page loads slowly
- Check screenshots to see actual page state

### Mock not working
- Verify API URL pattern matches
- Check network tab in headed mode
- Ensure route is set before navigation

### Price not displaying correctly
- Check if price selector matches your UI
- Verify price formatting (comma separators)
- Look at screenshot to see actual rendering

## Next Steps

To extend these tests:

1. Add more edge cases (negative prices, special characters)
2. Test different product types (weight-based, bundles)
3. Test promotions and discounts
4. Test quantity selector
5. Test add to cart functionality
6. Test product reviews section
