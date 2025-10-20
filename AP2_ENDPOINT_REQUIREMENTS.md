# Watch Merchant – AP2 Endpoint Requirements

This page documents the HTTP surface a merchant must expose for the AP2
shopping experience and verifies that the **watch-merchant-api** project
implements each contract.

## Required Endpoints

| Flow Stage | Purpose | Expected Endpoint / Params | Implemented In Project |
| --- | --- | --- | --- |
| Product discovery | Search catalog items. The AP2 SDK calls this once the user asks for products. | `GET /products` with query params: `search`, `category`, `priceMin`, `priceMax`, `limit` (others optional). Response: array of products with at least `id`, `sku`, `name`, `price`, `currency`, optional `image*` fields. | ✅ `src/routes/products.routes.ts` (`router.get('/')`) |
| Product lookup (optional) | Fetch a specific product for follow-up actions. | `GET /products/:id` or similar. | ✅ `src/routes/products.routes.ts` (`router.get('/:id')`) |
| Cart creation/update | Build or update the user’s cart inside the merchant system. AP2 posts the entire list of `{ sku, quantity }` pairs and expects a cart id in return. | `POST /cart` body: `{ items: [{ sku, quantity }], cartId? }`. Response: `{ cartId, items, totals: { subtotal, itemCount } }`. | ✅ `src/routes/cart.routes.ts` (`router.post('/')`) |
| Cart retrieval | Pull the current cart to show line items or to prepare a mandate. | `GET /cart/{cartId}` → same structure as above. | ✅ `src/routes/cart.routes.ts` (`router.get('/:cartId')`) |
| Cart mutation (optional) | Update individual SKU quantities without resending the whole list. The SDK does not call this today but it is useful for richer flows. | `PUT /cart/{cartId}/items/{sku}` body: `{ quantity }`. | ✅ `src/routes/cart.routes.ts` (`router.put('/:cartId/items/:sku')`) |
| Cart deletion (optional) | Clear server-side state when a session resets. | `DELETE /cart/{cartId}`. | ✅ |
| Pricing quote (optional) | Produce taxes, shipping, or promos before mandate creation. | `POST /pricing/quote` body: `{ items, couponCode?, shippingDestination? }`. Response should include totals and any shipping options. | ✅ `src/routes/pricing.routes.ts` (`router.post('/quote')`) |
| Mandate creation | Generate the payment mandate and EIP-712 typed data that MetaMask will sign. | `POST /cart/{cartId}/create-mandate` body: `{ walletAddress, network }`. Response must include `cartHash`, `amount`, `merchantAddress`, `items`, `typedData`, `expiresAt`. | ✅ `src/routes/cart.routes.ts` (`router.post('/:cartId/create-mandate')`) |
| Payment verification | Confirm the MetaMask signature, create an order, and clear the cart. | `POST /cart/{cartId}/verify-payment` body: `{ signature, mandateHash }`. Response: `{ success, orderId, transactionHash?, message }`. | ✅ `src/routes/cart.routes.ts` (`router.post('/:cartId/verify-payment')`) |
| Order retrieval | Provide a receipt/record after payment succeeds. | `GET /orders/{orderId}`. | ✅ `src/routes/orders.routes.ts` (`router.get('/:orderId')`) |

### Response Envelope

The Nest backend accepts either a plain JSON object or a `{ data: ... }`
wrapper. The watch merchant API uses the helper in `src/utils/response.ts`
which nests payloads under `data`, and that is compatible with the SDK.

## Configuration Checklist

- **Merchant metadata:** In Termix, the merchant entry must include:
  - `id`: `watch-merchant`
  - `metadata.baseUrl`: URL of this service (e.g. `https://watch-merchant.local/api/v1`)
  - `enabled: true`
  - Optional presentation fields (`name`, `slug`, `categories`, `description`)
- **Wallet info:** If you want AP2 to initiate real payments, set
  `wallet`/`network` on the merchant or at the project level so the payment
  processor can route funds.

## Observations

- The SDK currently posts the entire cart via `POST /cart` (`createCart`)
  and does **not** call the `PUT /cart/{cartId}/items/{sku}` endpoint, but
  the latter is implemented and available if needed.
- `merchantHttpClient.updateCart` in the Termix backend expects a
  `PUT /cart/{cartId}` route. It is unused today, so no changes are required,
  but if you enable that path you may want to add the corresponding route for
  future compatibility.

With these endpoints active, the watch merchant can support the complete AP2
shopping protocol from browsing through payment verification.
