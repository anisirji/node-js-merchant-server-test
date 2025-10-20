import { v4 as uuidv4 } from 'uuid';
import { Order, ReturnRequest, CustomerInfo, ShippingInfo } from '../types';
import cartService from './cart.service';
import pricingService from './pricing.service';
import shippingService from './shipping.service';

class OrderService {
  private orders: Map<string, Order> = new Map();
  private returns: Map<string, ReturnRequest> = new Map();

  createOrder(
    cartId: string,
    customer: CustomerInfo,
    shipping: ShippingInfo,
    paymentMethod: string,
    couponCode?: string
  ): Order {
    const cart = cartService.getCart(cartId);
    if (!cart) {
      throw new Error('Cart not found or expired');
    }

    if (cart.items.length === 0) {
      throw new Error('Cannot create order from empty cart');
    }

    // Calculate total weight
    const totalWeight = cart.items.reduce((sum, item) => {
      // Estimate 150g per watch item
      return sum + 150 * item.quantity;
    }, 0);

    // Calculate total value
    const subtotal = cartService.getCartTotal(cart);

    // Get shipping cost
    const shippingCost = shippingService.getShippingCost(
      shipping.address.country,
      totalWeight,
      subtotal,
      shipping.method
    );

    // Calculate pricing
    const pricing = pricingService.calculateQuote(
      cart.items.map((item) => ({ sku: item.sku, quantity: item.quantity })),
      shippingCost,
      couponCode
    );

    const order: Order = {
      orderId: uuidv4(),
      cartId,
      status: 'pending_payment',
      items: cart.items.map((item) => ({
        sku: item.sku,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      customer,
      shipping,
      pricing,
      payment: {
        method: paymentMethod,
        status: 'pending',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(order.orderId, order);
    return order;
  }

  getOrder(orderId: string): Order | null {
    return this.orders.get(orderId) || null;
  }

  updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Order {
    const order = this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    order.updatedAt = new Date();

    if (status === 'processing') {
      order.payment.status = 'completed';
    }

    this.orders.set(orderId, order);
    return order;
  }

  createReturn(
    orderId: string,
    items: Array<{ sku: string; quantity: number; reason: string }>,
    customerNotes?: string
  ): ReturnRequest {
    const order = this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'delivered') {
      throw new Error('Can only return delivered orders');
    }

    // Validate return items are in the order
    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.sku === item.sku);
      if (!orderItem) {
        throw new Error(`SKU ${item.sku} not found in order`);
      }
      if (orderItem.quantity < item.quantity) {
        throw new Error(`Cannot return more than ordered quantity for ${item.sku}`);
      }
    }

    const returnRequest: ReturnRequest = {
      returnId: uuidv4(),
      orderId,
      items,
      customerNotes,
      status: 'pending_review',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.returns.set(returnRequest.returnId, returnRequest);
    return returnRequest;
  }

  getReturn(returnId: string): ReturnRequest | null {
    return this.returns.get(returnId) || null;
  }

  getOrdersByCustomerEmail(email: string): Order[] {
    return Array.from(this.orders.values()).filter(
      (order) => order.customer.email.toLowerCase() === email.toLowerCase()
    );
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values());
  }
}

export default new OrderService();
