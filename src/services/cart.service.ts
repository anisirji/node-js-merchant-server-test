import { v4 as uuidv4 } from 'uuid';
import { Cart, CartItem } from '../types';
import productService from './product.service';

class CartService {
  private carts: Map<string, Cart> = new Map();
  private cartTTL: number = parseInt(process.env.CART_TTL_MINUTES || '120') * 60 * 1000;

  private cleanExpiredCarts() {
    const now = new Date();
    for (const [cartId, cart] of this.carts.entries()) {
      if (cart.expiresAt < now) {
        this.carts.delete(cartId);
      }
    }
  }

  private calculateExpiry(): Date {
    return new Date(Date.now() + this.cartTTL);
  }

  createOrUpdateCart(
    items: Array<{ sku: string; quantity: number }>,
    cartId?: string
  ): Cart {
    this.cleanExpiredCarts();

    const id = cartId && this.carts.has(cartId) ? cartId : uuidv4();
    const now = new Date();

    const cartItems: CartItem[] = [];

    for (const item of items) {
      const product = productService.getProductBySku(item.sku);
      if (!product) {
        throw new Error(`Product with SKU ${item.sku} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      cartItems.push({
        sku: item.sku,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    const cart: Cart = {
      cartId: id,
      items: cartItems,
      createdAt: now,
      updatedAt: now,
      expiresAt: this.calculateExpiry(),
    };

    this.carts.set(id, cart);
    return cart;
  }

  getCart(cartId: string): Cart | null {
    this.cleanExpiredCarts();

    const cart = this.carts.get(cartId);
    if (!cart) {
      return null;
    }

    if (cart.expiresAt < new Date()) {
      this.carts.delete(cartId);
      return null;
    }

    return cart;
  }

  updateCartItem(cartId: string, sku: string, quantity: number): Cart {
    const cart = this.getCart(cartId);
    if (!cart) {
      throw new Error('Cart not found or expired');
    }

    if (quantity === 0) {
      // Remove item
      cart.items = cart.items.filter((item) => item.sku !== sku);
    } else {
      const product = productService.getProductBySku(sku);
      if (!product) {
        throw new Error(`Product with SKU ${sku} not found`);
      }

      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      const existingItem = cart.items.find((item) => item.sku === sku);
      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        cart.items.push({
          sku,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images[0],
        });
      }
    }

    cart.updatedAt = new Date();
    cart.expiresAt = this.calculateExpiry();
    this.carts.set(cartId, cart);

    return cart;
  }

  deleteCart(cartId: string): boolean {
    return this.carts.delete(cartId);
  }

  getCartTotal(cart: Cart): number {
    return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}

// Need to add uuid package
export default new CartService();
