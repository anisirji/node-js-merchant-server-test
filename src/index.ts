import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// Import middleware
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

// Import routes
import productsRoutes from './routes/products.routes';
import cartRoutes from './routes/cart.routes';
import pricingRoutes from './routes/pricing.routes';
import inventoryRoutes from './routes/inventory.routes';
import shippingRoutes from './routes/shipping.routes';
import ordersRoutes from './routes/orders.routes';
import supportingRoutes from './routes/supporting.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Watch Merchant API',
    version: '1.0.0',
    description: 'Demo watch merchant API for AP2 integration',
    baseUrl: BASE_URL,
    endpoints: {
      products: '/api/v1/products',
      cart: '/api/v1/cart',
      pricing: '/api/v1/pricing',
      inventory: '/api/v1/inventory',
      shipping: '/api/v1/shipping',
      orders: '/api/v1/orders',
      brands: '/api/v1/brands',
      categories: '/api/v1/categories',
      collections: '/api/v1/collections',
      health: '/api/v1/health',
    },
    documentation: {
      openapi: '/docs/openapi.yaml',
      swagger: '/docs',
    },
  });
});

// API routes
const apiRouter = express.Router();

apiRouter.use('/products', productsRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/pricing', pricingRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/shipping', shippingRoutes);
apiRouter.use('/orders', ordersRoutes);

// Supporting routes (brands, categories, collections, health)
apiRouter.use('/', supportingRoutes);

app.use('/api/v1', apiRouter);

// OpenAPI documentation
const openapiPath = path.join(__dirname, '../openapi.yaml');

// Serve raw OpenAPI YAML
app.get('/docs/openapi.yaml', (_req, res) => {
  if (fs.existsSync(openapiPath)) {
    res.sendFile(openapiPath);
  } else {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'OpenAPI specification not found',
      },
    });
  }
});

// Swagger UI
if (fs.existsSync(openapiPath)) {
  try {
    const openapiDocument = yaml.load(fs.readFileSync(openapiPath, 'utf8')) as any;
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
  } catch (err) {
    console.error('Failed to load OpenAPI spec:', err);
  }
}

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         🕐 Watch Merchant API Server                     ║
║                                                           ║
║  Status: Running                                          ║
║  Port: ${PORT}                                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}   ║
║                                                           ║
║  Base URL: ${BASE_URL}                                    ║
║  API Endpoint: ${BASE_URL}/api/v1                         ║
║  Documentation: ${BASE_URL}/docs                          ║
║  OpenAPI Spec: ${BASE_URL}/docs/openapi.yaml              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
