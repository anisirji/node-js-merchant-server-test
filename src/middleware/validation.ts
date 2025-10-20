import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        });
      } else {
        next(error);
      }
    }
  };
};

// Common validation schemas
export const schemas = {
  productFilters: z.object({
    query: z.object({
      search: z.string().optional(),
      brand: z.union([z.string(), z.array(z.string())]).optional(),
      category: z.union([z.string(), z.array(z.string())]).optional(),
      priceMin: z.string().transform(Number).optional(),
      priceMax: z.string().transform(Number).optional(),
      minRating: z.string().transform(Number).optional(),
      tags: z.union([z.string(), z.array(z.string())]).optional(),
      inStock: z.string().transform(val => val === 'true').optional(),
      sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
    }),
    body: z.any().optional(),
    params: z.any().optional(),
  }),

  productById: z.object({
    params: z.object({
      id: z.string().min(1),
    }),
    query: z.any().optional(),
    body: z.any().optional(),
  }),

  createCart: z.object({
    body: z.object({
      cartId: z.string().optional(),
      items: z.array(z.object({
        sku: z.string().min(1),
        quantity: z.number().int().positive(),
      })),
    }),
    query: z.any().optional(),
    params: z.any().optional(),
  }),

  getCart: z.object({
    params: z.object({
      cartId: z.string().min(1),
    }),
    query: z.any().optional(),
    body: z.any().optional(),
  }),

  updateCartItem: z.object({
    params: z.object({
      cartId: z.string().min(1),
      sku: z.string().min(1),
    }),
    body: z.object({
      quantity: z.number().int().min(0),
    }),
    query: z.any().optional(),
  }),

  priceQuote: z.object({
    body: z.object({
      items: z.array(z.object({
        sku: z.string().min(1),
        quantity: z.number().int().positive(),
      })),
      couponCode: z.string().optional(),
      shippingDestination: z.object({
        country: z.string().length(2),
        postalCode: z.string().optional(),
      }).optional(),
    }),
    query: z.any().optional(),
    params: z.any().optional(),
  }),

  inventoryCheck: z.object({
    body: z.object({
      skus: z.array(z.string().min(1)),
    }),
    query: z.any().optional(),
    params: z.any().optional(),
  }),

  shippingRates: z.object({
    body: z.object({
      destination: z.object({
        country: z.string().length(2),
        state: z.string().optional(),
        postalCode: z.string().optional(),
      }),
      weight: z.number().positive(),
      value: z.number().positive(),
    }),
    query: z.any().optional(),
    params: z.any().optional(),
  }),

  createOrder: z.object({
    body: z.object({
      cartId: z.string().min(1),
      customer: z.object({
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phone: z.string().optional(),
      }),
      shipping: z.object({
        address: z.object({
          line1: z.string().min(1),
          line2: z.string().optional(),
          city: z.string().min(1),
          state: z.string().min(1),
          postalCode: z.string().min(1),
          country: z.string().length(2),
        }),
        method: z.string().min(1),
      }),
      payment: z.object({
        method: z.string().min(1),
        token: z.string().optional(),
      }),
    }),
    query: z.any().optional(),
    params: z.any().optional(),
  }),

  createReturn: z.object({
    body: z.object({
      orderId: z.string().min(1),
      items: z.array(z.object({
        sku: z.string().min(1),
        quantity: z.number().int().positive(),
        reason: z.string().min(1),
      })),
      customerNotes: z.string().optional(),
    }),
    query: z.any().optional(),
    params: z.any().optional(),
  }),
};
