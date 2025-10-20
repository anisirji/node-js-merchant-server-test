import { Router, Request, Response } from 'express';
import productService from '../services/product.service';
import { validate, schemas } from '../middleware/validation';
import { success, error } from '../utils/response';
import { AppError } from '../middleware/error-handler';

const router = Router();

// GET /products - List products with filters
router.get('/', validate(schemas.productFilters), (req: Request, res: Response) => {
  try {
    const brandParam = req.query.brand;
    const categoryParam = req.query.category;
    const tagsParam = req.query.tags;

    const filters = {
      search: req.query.search as string,
      brand: brandParam ? (Array.isArray(brandParam) ? brandParam.map(String) : [String(brandParam)]) : undefined,
      category: categoryParam ? (Array.isArray(categoryParam) ? categoryParam.map(String) : [String(categoryParam)]) : undefined,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
      tags: tagsParam ? (Array.isArray(tagsParam) ? tagsParam.map(String) : [String(tagsParam)]) : undefined,
      inStock: req.query.inStock === 'true',
      sort: req.query.sort as any,
    };

    const pagination = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = productService.getAllProducts(filters, pagination);

    success(res, result.products, { pagination: result.meta });
  } catch (err: any) {
    error(res, 'FETCH_ERROR', err.message, 500);
  }
});

// GET /products/:id - Get product by ID
router.get('/:id', validate(schemas.productById), (req: Request, res: Response) => {
  try {
    const product = productService.getProductById(req.params.id);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    success(res, product);
  } catch (err: any) {
    if (err instanceof AppError) {
      error(res, err.code, err.message, err.statusCode);
    } else {
      error(res, 'FETCH_ERROR', err.message, 500);
    }
  }
});

// GET /products/slug/:slug - Get product by slug
router.get('/slug/:slug', (req: Request, res: Response) => {
  try {
    const product = productService.getProductBySlug(req.params.slug);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    success(res, product);
  } catch (err: any) {
    if (err instanceof AppError) {
      error(res, err.code, err.message, err.statusCode);
    } else {
      error(res, 'FETCH_ERROR', err.message, 500);
    }
  }
});

export default router;
