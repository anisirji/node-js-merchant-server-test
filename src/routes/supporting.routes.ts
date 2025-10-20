import { Router, Request, Response } from 'express';
import productService from '../services/product.service';
import { success } from '../utils/response';

const router = Router();

// GET /brands - Get all brands
router.get('/brands', (_req: Request, res: Response) => {
  const brands = productService.getAllBrands();
  success(res, brands);
});

// GET /categories - Get all categories
router.get('/categories', (_req: Request, res: Response) => {
  const categories = productService.getAllCategories();
  success(res, categories);
});

// GET /collections - Get all collections
router.get('/collections', (_req: Request, res: Response) => {
  const collections = productService.getCollections();
  success(res, collections);
});

// GET /health - Health check
router.get('/health', (_req: Request, res: Response) => {
  success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
