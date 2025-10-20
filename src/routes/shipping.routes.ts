import { Router, Request, Response } from 'express';
import shippingService from '../services/shipping.service';
import { validate, schemas } from '../middleware/validation';
import { success, error } from '../utils/response';

const router = Router();

// POST /shipping/rates - Calculate shipping rates
router.post('/rates', validate(schemas.shippingRates), (req: Request, res: Response) => {
  try {
    const { destination, weight, value } = req.body;

    const rates = shippingService.calculateRates(
      destination.country,
      weight,
      value
    );

    success(res, rates);
  } catch (err: any) {
    error(res, 'SHIPPING_ERROR', err.message, 400);
  }
});

export default router;
