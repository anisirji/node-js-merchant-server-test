# Watch Merchant API

A demo RESTful API for a luxury watch merchant, featuring a complete product catalog, shopping cart, pricing calculations, inventory management, and order processing. Built specifically for AP2 integration and testing.

## Features

- 📦 **15 Luxury Watch Products** - Curated catalog from brands like Rolex, Omega, Patek Philippe, and more
- 🛒 **Shopping Cart** - In-memory cart with TTL expiration
- 💰 **Dynamic Pricing** - Tax calculation, coupon support, shipping integration
- 📊 **Inventory Management** - Real-time stock availability checks
- 🚚 **Shipping Rates** - Multi-carrier support with dynamic rate calculation
- 📝 **Order Processing** - Complete order lifecycle management
- 🔄 **Returns** - Return request handling
- 📖 **OpenAPI 3.0** - Complete API documentation with Swagger UI
- 🔍 **Advanced Filtering** - Search, filter, and sort products

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd watch-merchant-api
npm install
```

### Configuration

Create a `.env` file (or copy from `.env.example`):

```bash
PORT=3001
NODE_ENV=development
BASE_URL=http://localhost:3001
CORS_ORIGIN=*
LOG_LEVEL=info
TAX_RATE=8
CART_TTL_MINUTES=120
```

### Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001`

### Build for Production

```bash
npm run build
npm start
```

## API Documentation

### Interactive Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:3001/docs
- **OpenAPI Spec**: http://localhost:3001/docs/openapi.yaml

### Base URL

```
http://localhost:3001/api/v1
```

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products with filters |
| GET | `/products/:id` | Get product by ID |
| GET | `/products/slug/:slug` | Get product by slug |

**Example: Search for Rolex watches**
```bash
curl "http://localhost:3001/api/v1/products?brand=Rolex"
```

**Example: Filter by price range**
```bash
curl "http://localhost:3001/api/v1/products?priceMin=5000&priceMax=15000&sort=price_asc"
```

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cart` | Create or update cart |
| GET | `/cart/:cartId` | Get cart contents |
| PUT | `/cart/:cartId/items/:sku` | Update item quantity |
| DELETE | `/cart/:cartId` | Delete cart |

**Example: Create cart**
```bash
curl -X POST http://localhost:3001/api/v1/cart \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"sku": "ROL-SUB-116610LN", "quantity": 1}
    ]
  }'
```

### Pricing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pricing/quote` | Get price quote with tax & shipping |

**Example: Get price quote**
```bash
curl -X POST http://localhost:3001/api/v1/pricing/quote \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"sku": "ROL-SUB-116610LN", "quantity": 1}],
    "couponCode": "LUXURY10",
    "shippingDestination": {"country": "US", "postalCode": "10001"}
  }'
```

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory/check` | Check multiple SKUs |
| GET | `/inventory/:sku` | Check single SKU |

### Shipping

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/shipping/rates` | Calculate shipping rates |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders/:orderId` | Get order details |
| PATCH | `/orders/:orderId/status` | Update order status |
| POST | `/orders/:orderId/returns` | Create return request |

### Supporting

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/brands` | List all brands |
| GET | `/categories` | List all categories |
| GET | `/collections` | List featured collections |
| GET | `/health` | Health check |

## Sample Products

The API includes 15 luxury watches:

1. **Rolex Submariner Date** - $13,450
2. **Omega Seamaster Diver 300M** - $6,200
3. **TAG Heuer Carrera Chronograph** - $4,100
4. **Seiko Prospex Automatic Diver** - $525
5. **Cartier Santos de Cartier** - $7,750
6. **Patek Philippe Calatrava** - $28,500
7. **Audemars Piguet Royal Oak** - $29,800
8. **IWC Big Pilot's Watch** - $5,950
9. **Breitling Navitimer** - $8,600
10. **Rolex Datejust 36** - $9,150
11. **Omega Speedmaster Moonwatch** - $6,800
12. **TAG Heuer Aquaracer** - $2,950
13. **Seiko Presage Cocktail** - $495
14. **Grand Seiko Heritage** - $5,200
15. **Tudor Black Bay Fifty-Eight** - $3,975

## Coupon Codes

Test the pricing API with these coupons:

- `LUXURY10` - 10% off orders over $5,000
- `WELCOME15` - 15% off first order over $1,000
- `FREESHIP` - Free standard shipping
- `SUMMER25` - 25% off Seiko watches
- `VIP500` - $500 off orders over $20,000
- `DIVER20` - 20% off dive watches over $3,000

## Complete Workflow Example

Here's a complete purchase flow:

```bash
# 1. Browse products
curl "http://localhost:3001/api/v1/products?category=Dive&inStock=true"

# 2. Create cart
CART=$(curl -X POST http://localhost:3001/api/v1/cart \
  -H "Content-Type: application/json" \
  -d '{"items": [{"sku": "ROL-SUB-116610LN", "quantity": 1}]}' \
  | jq -r '.data.cartId')

# 3. Get price quote
curl -X POST http://localhost:3001/api/v1/pricing/quote \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [{\"sku\": \"ROL-SUB-116610LN\", \"quantity\": 1}],
    \"shippingDestination\": {\"country\": \"US\"}
  }"

# 4. Create order
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -d "{
    \"cartId\": \"$CART\",
    \"customer\": {
      \"email\": \"customer@example.com\",
      \"firstName\": \"John\",
      \"lastName\": \"Doe\"
    },
    \"shipping\": {
      \"address\": {
        \"line1\": \"123 Main St\",
        \"city\": \"New York\",
        \"state\": \"NY\",
        \"postalCode\": \"10001\",
        \"country\": \"US\"
      },
      \"method\": \"standard\"
    },
    \"payment\": {\"method\": \"card\"}
  }"
```

## AP2 Integration

### Importing into AP2

1. Start the watch merchant API server
2. In the AP2 dashboard, navigate to merchant configuration
3. Add new merchant with base URL: `http://localhost:3001/api/v1`
4. Import OpenAPI spec from: `http://localhost:3001/docs/openapi.yaml`
5. AP2 will auto-generate tools for all endpoints

### Operation IDs

All endpoints use descriptive operation IDs for tool generation:

- `watches_listProducts`
- `watches_getProduct`
- `watches_createCart`
- `watches_getPriceQuote`
- `watches_checkInventory`
- `watches_getShippingRates`
- `watches_createOrder`
- And more...

## Project Structure

```
watch-merchant-api/
├── src/
│   ├── data/              # Static JSON data files
│   │   ├── products.json
│   │   ├── brands.json
│   │   ├── coupons.json
│   │   └── shipping-rates.json
│   ├── middleware/        # Express middleware
│   │   ├── error-handler.ts
│   │   ├── logger.ts
│   │   └── validation.ts
│   ├── routes/            # API route handlers
│   │   ├── products.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── pricing.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── shipping.routes.ts
│   │   ├── orders.routes.ts
│   │   └── supporting.routes.ts
│   ├── services/          # Business logic
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── pricing.service.ts
│   │   ├── inventory.service.ts
│   │   ├── shipping.service.ts
│   │   └── order.service.ts
│   ├── types/             # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   └── response.ts
│   └── index.ts           # Express app entry
├── openapi.yaml           # OpenAPI 3.0 specification
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Run with auto-reload

```bash
npm run dev
```

### Lint code

```bash
npm run lint
```

### Run tests (when implemented)

```bash
npm test
```

## Technical Details

### Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **Documentation**: OpenAPI 3.0 + Swagger UI

### Data Storage

This is a demo API, so all data is stored in-memory:

- **Products**: Loaded from static JSON file
- **Carts**: Map with 2-hour TTL
- **Orders**: In-memory Map
- **Returns**: In-memory Map

For production use, replace with a database (PostgreSQL, MongoDB, etc.)

### CORS

CORS is enabled for all origins by default. Configure in `.env`:

```
CORS_ORIGIN=https://yourdomain.com
```

## Future Enhancements

- [ ] PostgreSQL/SQLite database integration
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Webhook notifications
- [ ] Product image uploads
- [ ] Customer accounts
- [ ] Order history
- [ ] Real payment integration (Stripe)
- [ ] Multi-currency support

## License

MIT

## Support

For issues or questions about this demo API, please refer to the AP2 documentation or create an issue in the project repository.
# node-js-merchant-server-test
