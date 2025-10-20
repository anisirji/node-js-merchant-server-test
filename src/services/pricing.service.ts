import couponsData from '../data/coupons.json';
import { Coupon, PricingBreakdown } from '../types';
import productService from './product.service';

class PricingService {
  private coupons: Coupon[] = couponsData as Coupon[];
  private taxRate: number = parseFloat(process.env.TAX_RATE || '8') / 100;

  calculateQuote(
    items: Array<{ sku: string; quantity: number }>,
    shippingCost: number,
    couponCode?: string
  ): PricingBreakdown {
    // Calculate subtotal
    let subtotal = 0;
    const products = [];

    for (const item of items) {
      const product = productService.getProductBySku(item.sku);
      if (!product) {
        throw new Error(`Product with SKU ${item.sku} not found`);
      }
      subtotal += product.price * item.quantity;
      products.push(product);
    }

    // Apply coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = this.getCoupon(couponCode);
      if (coupon) {
        discount = this.calculateDiscount(subtotal, coupon, products);
      }
    }

    // Calculate after discount
    const afterDiscount = subtotal - discount;

    // Calculate tax (on discounted amount)
    const tax = parseFloat((afterDiscount * this.taxRate).toFixed(2));

    // Total
    const total = afterDiscount + tax + shippingCost;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      shipping: shippingCost,
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  private getCoupon(code: string): Coupon | null {
    return this.coupons.find((c) => c.code.toLowerCase() === code.toLowerCase()) || null;
  }

  private calculateDiscount(
    subtotal: number,
    coupon: Coupon,
    products: any[]
  ): number {
    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new Error(
        `Coupon requires minimum order of $${coupon.minOrderAmount}`
      );
    }

    // Check applicable brands
    if (coupon.applicableBrands && coupon.applicableBrands.length > 0) {
      const applicableAmount = products
        .filter((p) => coupon.applicableBrands?.includes(p.brand))
        .reduce((sum, p) => sum + p.price, 0);

      if (applicableAmount === 0) {
        throw new Error('Coupon not applicable to any items in cart');
      }

      if (coupon.type === 'percentage') {
        return (applicableAmount * coupon.value) / 100;
      } else if (coupon.type === 'fixed') {
        return Math.min(coupon.value, applicableAmount);
      }
    }

    // General discount
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.value, subtotal);
    }

    return 0;
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; message?: string } {
    const coupon = this.getCoupon(code);

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Requires minimum order of $${coupon.minOrderAmount}`,
      };
    }

    return { valid: true };
  }

  getAllCoupons(): Coupon[] {
    return this.coupons;
  }
}

export default new PricingService();
