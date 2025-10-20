# Quick Start Guide - Watch Merchant API

## Installation & Setup

```bash
cd watch-merchant-api
npm install
```

## Start the Server

```bash
npm run dev
```

Server will be available at: **http://localhost:3002**

## Access Documentation

- **Swagger UI**: http://localhost:3002/docs
- **OpenAPI Spec**: http://localhost:3002/docs/openapi.yaml
- **API Root**: http://localhost:3002/api/v1

## Quick API Tests

### 1. Check Health
```bash
curl http://localhost:3002/api/v1/health
```

### 2. List Products
```bash
curl "http://localhost:3002/api/v1/products?limit=5"
```

### 3. Search Rolex Watches
```bash
curl "http://localhost:3002/api/v1/products?brand=Rolex"
```

### 4. Filter by Price Range
```bash
curl "http://localhost:3002/api/v1/products?priceMin=5000&priceMax=10000"
```

### 5. Create a Cart
```bash
curl -X POST http://localhost:3002/api/v1/cart \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"sku": "ROL-SUB-116610LN", "quantity": 1}
    ]
  }'
```

### 6. Get Price Quote with Coupon
```bash
curl -X POST http://localhost:3002/api/v1/pricing/quote \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"sku": "ROL-SUB-116610LN", "quantity": 1}],
    "couponCode": "LUXURY10",
    "shippingDestination": {"country": "US"}
  }'
```

### 7. Check Inventory
```bash
curl http://localhost:3002/api/v1/inventory/ROL-SUB-116610LN
```

### 8. Get Shipping Rates
```bash
curl -X POST http://localhost:3002/api/v1/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "destination": {"country": "US", "postalCode": "10001"},
    "weight": 155,
    "value": 13450
  }'
```

### 9. List Brands
```bash
curl http://localhost:3002/api/v1/brands
```

### 10. List Categories
```bash
curl http://localhost:3002/api/v1/categories
```

## Available Coupon Codes

- `LUXURY10` - 10% off orders over $5,000
- `WELCOME15` - 15% off first order over $1,000
- `FREESHIP` - Free standard shipping
- `SUMMER25` - 25% off Seiko watches
- `VIP500` - $500 off orders over $20,000
- `DIVER20` - 20% off dive watches over $3,000

## AP2 Integration

### Base URL for AP2 Configuration
```
http://localhost:3002/api/v1
```

### OpenAPI Import URL
```
http://localhost:3002/docs/openapi.yaml
```

### Steps to Integrate with AP2:

1. Start the watch merchant API: `npm run dev`
2. Open AP2 dashboard
3. Navigate to merchant configuration
4. Add new merchant:
   - **Name**: Watch Merchant Demo
   - **Base URL**: `http://localhost:3002/api/v1`
5. Import OpenAPI specification from: `http://localhost:3002/docs/openapi.yaml`
6. AP2 will automatically generate tools for all endpoints

## Sample Products (SKUs)

| SKU | Brand | Model | Price |
|-----|-------|-------|-------|
| ROL-SUB-116610LN | Rolex | Submariner Date | $13,450 |
| OME-SEA-21030422001001 | Omega | Seamaster Diver 300M | $6,200 |
| TAG-CAR-CBK2110BA0715 | TAG Heuer | Carrera Chronograph | $4,100 |
| SEI-PRO-SPB143J1 | Seiko | Prospex Diver | $525 |
| PAT-CAL-5196G001 | Patek Philippe | Calatrava | $28,500 |
| AUD-ROY-15400ST | Audemars Piguet | Royal Oak | $29,800 |
| TUD-BB5-M79030N | Tudor | Black Bay 58 | $3,975 |

## Complete Purchase Flow Example

```bash
# 1. Browse products
curl "http://localhost:3002/api/v1/products?category=Dive&limit=3"

# 2. Create cart (save the cartId from response)
curl -X POST http://localhost:3002/api/v1/cart \
  -H "Content-Type: application/json" \
  -d '{"items": [{"sku": "ROL-SUB-116610LN", "quantity": 1}]}'

# 3. Get price quote
curl -X POST http://localhost:3002/api/v1/pricing/quote \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"sku": "ROL-SUB-116610LN", "quantity": 1}],
    "shippingDestination": {"country": "US"}
  }'

# 4. Create order (replace CART_ID with actual cart ID from step 2)
curl -X POST http://localhost:3002/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "CART_ID",
    "customer": {
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "shipping": {
      "address": {
        "line1": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "US"
      },
      "method": "standard"
    },
    "payment": {"method": "card"}
  }'
```

## Environment Configuration

Edit `.env` file to customize:

```env
PORT=3002
NODE_ENV=development
BASE_URL=http://localhost:3002
CORS_ORIGIN=*
TAX_RATE=8
CART_TTL_MINUTES=120
```

## Production Build

```bash
npm run build
npm start
```

## Need Help?

- Check the full [README.md](README.md) for detailed documentation
- View API docs at http://localhost:3002/docs
- All endpoints return standardized JSON responses with `success` flag
