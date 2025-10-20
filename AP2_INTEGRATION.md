# AP2 Integration Guide - Watch Merchant API

## Overview

This document provides step-by-step instructions for integrating the Watch Merchant API with the AP2 (Agent Protocol 2) system.

## Prerequisites

- Watch Merchant API running on `http://localhost:3002`
- AP2 dashboard access

## Integration Steps

### 1. Start the Watch Merchant API

```bash
cd watch-merchant-api
npm install
npm run dev
```

Verify the server is running:
```bash
curl http://localhost:3002/api/v1/health
```

### 2. Configure Merchant in AP2 Dashboard

#### Merchant Configuration Details

| Field | Value |
|-------|-------|
| **Merchant Name** | Watch Merchant Demo |
| **Base URL** | `http://localhost:3002/api/v1` |
| **OpenAPI Spec URL** | `http://localhost:3002/docs/openapi.yaml` |
| **Authentication** | None (demo) |

#### Import OpenAPI Specification

1. Navigate to merchant configuration in AP2
2. Click "Import OpenAPI Specification"
3. Enter URL: `http://localhost:3002/docs/openapi.yaml`
4. AP2 will parse the spec and generate tools automatically

### 3. Available Tools (Auto-Generated)

After importing, AP2 will create the following tools:

#### Product Tools
- `watches_listProducts` - Browse and search products with filters
- `watches_getProduct` - Get product details by ID
- `watches_getProductBySlug` - Get product by URL slug

#### Cart Tools
- `watches_createCart` - Create or update shopping cart
- `watches_getCart` - Retrieve cart contents
- `watches_updateCartItem` - Update item quantity
- `watches_deleteCart` - Remove cart

#### Pricing Tools
- `watches_getPriceQuote` - Calculate pricing with tax, shipping, discounts

#### Inventory Tools
- `watches_checkInventory` - Bulk inventory check
- `watches_checkInventorySingle` - Single SKU availability

#### Shipping Tools
- `watches_getShippingRates` - Calculate shipping options and costs

#### Order Tools
- `watches_createOrder` - Place new order
- `watches_getOrder` - Get order details
- `watches_updateOrderStatus` - Update order status
- `watches_createReturn` - Request product return

#### Supporting Tools
- `watches_listBrands` - Get all watch brands
- `watches_listCategories` - Get product categories
- `watches_listCollections` - Get featured collections
- `watches_healthCheck` - API health status

## Sample Workflows for AP2 Agents

### Workflow 1: Product Discovery

**User Query**: "Show me luxury dive watches under $10,000"

**Agent Actions**:
1. Use `watches_listProducts` with filters:
   ```json
   {
     "category": ["Dive", "Luxury"],
     "priceMax": 10000,
     "inStock": true,
     "sort": "rating"
   }
   ```

### Workflow 2: Purchase Flow

**User Query**: "I want to buy a Rolex Submariner"

**Agent Actions**:
1. `watches_listProducts` with `brand=Rolex` and `search=Submariner`
2. `watches_checkInventorySingle` with SKU `ROL-SUB-116610LN`
3. `watches_createCart` with product SKU
4. `watches_getPriceQuote` with cart items and shipping destination
5. `watches_createOrder` with customer and payment details

### Workflow 3: Price Comparison

**User Query**: "Compare prices of watches between $5,000 and $7,000"

**Agent Actions**:
1. `watches_listProducts` with `priceMin=5000&priceMax=7000`
2. For each product, show brand, model, price, rating
3. Optionally use `watches_getPriceQuote` with coupon codes

### Workflow 4: Order Tracking

**User Query**: "What's the status of my order?"

**Agent Actions**:
1. `watches_getOrder` with order ID
2. Display order status, items, tracking info

## Testing the Integration

### Test Case 1: Browse Products

**AP2 Prompt**: "Show me all Omega watches"

**Expected Tool Call**:
```json
{
  "tool": "watches_listProducts",
  "parameters": {
    "brand": "Omega"
  }
}
```

### Test Case 2: Get Price Quote

**AP2 Prompt**: "How much would a Rolex Submariner cost with shipping to New York?"

**Expected Tool Calls**:
1. `watches_listProducts` (find Submariner)
2. `watches_getPriceQuote`:
   ```json
   {
     "items": [{"sku": "ROL-SUB-116610LN", "quantity": 1}],
     "shippingDestination": {"country": "US", "postalCode": "10001"}
   }
   ```

### Test Case 3: Apply Coupon

**AP2 Prompt**: "What discounts are available for luxury watches?"

**Expected Tool Calls**:
1. Agent retrieves available coupons from documentation
2. `watches_getPriceQuote` with `couponCode`:
   ```json
   {
     "items": [{"sku": "ROL-SUB-116610LN", "quantity": 1}],
     "couponCode": "LUXURY10"
   }
   ```

## API Response Format

All endpoints return consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

## Available Test Data

### Sample Products
- **Rolex Submariner Date** (SKU: ROL-SUB-116610LN) - $13,450
- **Omega Seamaster Diver** (SKU: OME-SEA-21030422001001) - $6,200
- **Seiko Prospex Diver** (SKU: SEI-PRO-SPB143J1) - $525
- **Patek Philippe Calatrava** (SKU: PAT-CAL-5196G001) - $28,500

### Sample Coupons
- `LUXURY10` - 10% off orders over $5,000
- `WELCOME15` - 15% off first order over $1,000
- `FREESHIP` - Free standard shipping

### Supported Countries
- **US** - United States (standard, express, overnight)
- **CA** - Canada (standard, express)
- **GB** - United Kingdom (standard, express)
- **International** - All other countries (standard, express)

## Common AP2 Agent Patterns

### Pattern 1: Search → Details → Purchase
```
User: "I need a professional dive watch"
Agent:
  1. watches_listProducts (category=Dive)
  2. watches_getProduct (selected watch)
  3. watches_checkInventorySingle
  4. watches_createCart
  5. watches_getPriceQuote
```

### Pattern 2: Compare → Filter → Select
```
User: "Best watches under $5000"
Agent:
  1. watches_listProducts (priceMax=5000, sort=rating)
  2. watches_listBrands (show available brands)
  3. watches_listProducts (refined filters)
```

### Pattern 3: Stock Check → Price Quote → Order
```
User: "Buy Omega Speedmaster"
Agent:
  1. watches_listProducts (brand=Omega, search=Speedmaster)
  2. watches_checkInventorySingle
  3. watches_getPriceQuote
  4. watches_createOrder
```

## Troubleshooting

### Issue: Tools not appearing in AP2

**Solution**:
- Verify OpenAPI spec is accessible: `curl http://localhost:3002/docs/openapi.yaml`
- Check AP2 logs for parsing errors
- Ensure base URL is correct in merchant config

### Issue: API returns 404

**Solution**:
- Confirm API is running: `curl http://localhost:3002/api/v1/health`
- Check port number (should be 3002)
- Verify endpoint paths include `/api/v1` prefix

### Issue: CORS errors

**Solution**:
- Check `.env` file has `CORS_ORIGIN=*`
- Restart the API server after changing env vars

## Production Considerations

When moving to production:

1. **Change Port**: Update from 3002 to standard port (80/443)
2. **Enable HTTPS**: Use SSL/TLS certificates
3. **Add Authentication**: Implement API key or OAuth
4. **Rate Limiting**: Add rate limits per client
5. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
6. **Logging**: Enhance logging for production monitoring
7. **Error Handling**: Add more detailed error messages

## Support & Documentation

- **Full API Docs**: http://localhost:3002/docs
- **OpenAPI Spec**: http://localhost:3002/docs/openapi.yaml
- **README**: See [README.md](README.md)
- **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)

## Example AP2 Conversation

```
User: I want to buy a luxury watch as a gift

Agent: I'll help you find the perfect luxury watch. Let me show you our collection.
[Calls watches_listProducts with category=Luxury]

Agent: I found 10 luxury watches ranging from $4,100 to $29,800. Here are some highlights:
- Rolex Submariner Date ($13,450) - Iconic dive watch
- Omega Seamaster ($6,200) - James Bond's choice
- Patek Philippe Calatrava ($28,500) - Ultimate dress watch

What's your budget and preferred style?

User: I like the Rolex. Can you check if it's in stock and calculate shipping to California?

Agent: Let me check availability and get you a price quote.
[Calls watches_checkInventorySingle with SKU=ROL-SUB-116610LN]
[Calls watches_getPriceQuote with shipping to CA]

Agent: Great news! The Rolex Submariner Date is in stock (5 available). Here's your pricing:
- Watch: $13,450.00
- Tax (8%): $1,076.00
- Shipping (FedEx 2-Day): $45.00
- Total: $14,571.00

Would you like to proceed with the purchase?
```

---

**Note**: This is a demo API designed for testing and development. For production use, implement proper security, authentication, and database persistence.
