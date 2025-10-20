import { Router, Request, Response } from 'express';
import pricingService from '../services/pricing.service';
import shippingService from '../services/shipping.service';
import productService from '../services/product.service';
import { validate, schemas } from '../middleware/validation';
import { success, error } from '../utils/response';
import { ShippingRate } from '../types';

const router = Router();

// POST /pricing/quote - Get pricing quote
router.post('/quote', validate(schemas.priceQuote), (req: Request, res: Response) => {
  try {
    const { items, couponCode, shippingDestination } = req.body;

    // Calculate total weight
    const totalWeight = items.reduce((sum: number, item: any) => {
      const product = productService.getProductBySku(item.sku);
      return sum + (product?.weight || 150) * item.quantity;
    }, 0);

    // Calculate subtotal for value
    const subtotal = items.reduce((sum: number, item: any) => {
      const product = productService.getProductBySku(item.sku);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    // Get shipping cost
    let shippingCost = 0;
    let shippingRates: ShippingRate[] = [];

    if (shippingDestination) {
      shippingRates = shippingService.calculateRates(
        shippingDestination.country,
        totalWeight,
        subtotal
      );
      // Use standard shipping as default
      shippingCost = shippingRates.find(r => r.service.toLowerCase().includes('standard'))?.cost || shippingRates[0]?.cost || 0;
    }

    // Calculate pricing
    const pricing = pricingService.calculateQuote(items, shippingCost, couponCode);

    success(res, {
      ...pricing,
      shippingOptions: shippingRates.length > 0 ? shippingRates : undefined,
    });
  } catch (err: any) {
    error(res, 'PRICING_ERROR', err.message, 400);
  }
});

export default router;
