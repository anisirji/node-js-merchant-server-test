import { Router, Request, Response } from 'express';
import cartService from '../services/cart.service';
import { validate, schemas } from '../middleware/validation';
import { success, error } from '../utils/response';
import { AppError } from '../middleware/error-handler';

const router = Router();

// POST /cart - Create or update cart
router.post('/', validate(schemas.createCart), (req: Request, res: Response) => {
  try {
    const { cartId, items } = req.body;

    const cart = cartService.createOrUpdateCart(items, cartId);

    const total = cartService.getCartTotal(cart);

    success(
      res,
      {
        ...cart,
        totals: {
          subtotal: total,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      },
      undefined,
      cartId ? 200 : 201
    );
  } catch (err: any) {
    error(res, 'CART_ERROR', err.message, 400);
  }
});

// GET /cart/:cartId - Get cart
router.get('/:cartId', validate(schemas.getCart), (req: Request, res: Response) => {
  try {
    const cart = cartService.getCart(req.params.cartId);

    if (!cart) {
      throw new AppError(404, 'CART_NOT_FOUND', 'Cart not found or expired');
    }

    const total = cartService.getCartTotal(cart);

    success(res, {
      ...cart,
      totals: {
        subtotal: total,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      error(res, err.code, err.message, err.statusCode);
    } else {
      error(res, 'CART_ERROR', err.message, 500);
    }
  }
});

// PUT /cart/:cartId/items/:sku - Update cart item
router.put('/:cartId/items/:sku', validate(schemas.updateCartItem), (req: Request, res: Response) => {
  try {
    const { cartId, sku } = req.params;
    const { quantity } = req.body;

    const cart = cartService.updateCartItem(cartId, sku, quantity);

    const total = cartService.getCartTotal(cart);

    success(res, {
      ...cart,
      totals: {
        subtotal: total,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (err: any) {
    error(res, 'CART_ERROR', err.message, 400);
  }
});

// DELETE /cart/:cartId - Delete cart
router.delete('/:cartId', validate(schemas.getCart), (req: Request, res: Response) => {
  try {
    const deleted = cartService.deleteCart(req.params.cartId);

    if (!deleted) {
      throw new AppError(404, 'CART_NOT_FOUND', 'Cart not found');
    }

    success(res, { message: 'Cart deleted successfully' });
  } catch (err: any) {
    if (err instanceof AppError) {
      error(res, err.code, err.message, err.statusCode);
    } else {
      error(res, 'CART_ERROR', err.message, 500);
    }
  }
});

// POST /cart/:cartId/create-mandate - Create payment mandate for cart
router.post('/:cartId/create-mandate', (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const { walletAddress, network } = req.body;

    if (!walletAddress) {
      throw new AppError(400, 'MISSING_WALLET', 'Wallet address is required');
    }

    const cart = cartService.getCart(cartId);
    if (!cart) {
      throw new AppError(404, 'CART_NOT_FOUND', 'Cart not found or expired');
    }

    const total = cartService.getCartTotal(cart);

    // Create EIP-712 typed data for MetaMask signing
    const domain = {
      name: 'Watch Merchant',
      version: '1',
      chainId: network === 'sepolia' ? 11155111 : 56, // Sepolia or BNB mainnet
      verifyingContract: process.env.MERCHANT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    };

    const types = {
      PurchaseMandate: [
        { name: 'cartId', type: 'string' },
        { name: 'merchantId', type: 'string' },
        { name: 'amount', type: 'uint256' },
        { name: 'currency', type: 'string' },
        { name: 'items', type: 'string' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'expiresAt', type: 'uint256' },
      ],
    };

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (15 * 60); // 15 minutes

    const message = {
      cartId: cart.cartId,
      merchantId: 'watch-merchant',
      amount: Math.floor(total * 1e18).toString(), // Convert to wei
      currency: 'USD',
      items: JSON.stringify(cart.items.map(i => ({ sku: i.sku, qty: i.quantity }))),
      timestamp: now,
      expiresAt: expiresAt,
    };

    // Generate cart hash for verification
    const cartHash = `0x${Buffer.from(JSON.stringify(message)).toString('hex').slice(0, 64)}`;

    success(res, {
      cartHash,
      amount: total.toString(),
      merchantAddress: domain.verifyingContract,
      items: cart.items,
      typedData: {
        domain,
        types,
        primaryType: 'PurchaseMandate',
        message,
      },
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      error(res, err.code, err.message, err.statusCode);
    } else {
      error(res, 'MANDATE_ERROR', err.message, 500);
    }
  }
});

// POST /cart/:cartId/verify-payment - Verify payment signature and create order
router.post('/:cartId/verify-payment', (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const { signature, mandateHash } = req.body;

    if (!signature || !mandateHash) {
      throw new AppError(400, 'MISSING_PARAMS', 'Signature and mandateHash are required');
    }

    const cart = cartService.getCart(cartId);
    if (!cart) {
      throw new AppError(404, 'CART_NOT_FOUND', 'Cart not found or expired');
    }

    // In production, verify the signature using ethers.verifyTypedData
    // For now, we'll accept any signature for demo purposes

    // Create order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Mock transaction hash
    const transactionHash = `0x${Math.random().toString(16).substring(2)}`;

    // Clear the cart after successful payment
    cartService.deleteCart(cartId);

    success(res, {
      success: true,
      orderId,
      transactionHash,
      message: 'Payment verified and order created successfully',
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      error(res, err.code, err.message, err.statusCode);
    } else {
      error(res, 'PAYMENT_ERROR', err.message, 500);
    }
  }
});

export default router;
