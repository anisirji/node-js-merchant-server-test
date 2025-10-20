import { Router, Request, Response } from 'express';
import inventoryService from '../services/inventory.service';
import { validate, schemas } from '../middleware/validation';
import { success, error } from '../utils/response';

const router = Router();

// POST /inventory/check - Check multiple SKUs
router.post('/check', validate(schemas.inventoryCheck), (req: Request, res: Response) => {
  try {
    const { skus } = req.body;

    const availability = inventoryService.checkMultiple(skus);

    success(res, availability);
  } catch (err: any) {
    error(res, 'INVENTORY_ERROR', err.message, 400);
  }
});

// GET /inventory/:sku - Check single SKU
router.get('/:sku', (req: Request, res: Response) => {
  try {
    const availability = inventoryService.checkAvailability(req.params.sku);

    success(res, availability);
  } catch (err: any) {
    error(res, 'INVENTORY_ERROR', err.message, 404);
  }
});

export default router;
