import { Router, Request, Response } from 'express';
import orderService from '../services/order.service';
import { validate, schemas } from '../middleware/validation';
import { success, error } from '../utils/response';
import { AppError } from '../middleware/error-handler';

const router = Router();

// POST /orders - Create order
router.post('/', validate(schemas.createOrder), (req: Request, res: Response) => {
  try {
    const { cartId, customer, shipping, payment } = req.body;
    const couponCode = req.body.couponCode;

    const order = orderService.createOrder(
      cartId,
      customer,
      shipping,
      payment.method,
      couponCode
    );

    success(res, order, undefined, 201);
  } catch (err: any) {
    error(res, 'ORDER_ERROR', err.message, 400);
  }
});

// GET /orders/:orderId - Get order
router.get('/:orderId', (req: Request, res: Response) => {
  try {
    const order = orderService.getOrder(req.params.orderId);

    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    success(res, order);
  } catch (err: any) {
    if (err instanceof AppError) {
      error(res, err.code, err.message, err.statusCode);
    } else {
      error(res, 'ORDER_ERROR', err.message, 500);
    }
  }
});

// PATCH /orders/:orderId/status - Update order status
router.patch('/:orderId/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      throw new AppError(400, 'INVALID_STATUS', 'Status is required');
    }

    const validStatuses = ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError(400, 'INVALID_STATUS', `Status must be one of: ${validStatuses.join(', ')}`);
    }

    const order = orderService.updateOrderStatus(req.params.orderId, status);

    success(res, order);
  } catch (err: any) {
    if (err instanceof AppError) {
      error(res, err.code, err.message, err.statusCode);
    } else {
      error(res, 'ORDER_ERROR', err.message, 400);
    }
  }
});

// POST /orders/:orderId/returns - Create return
router.post('/:orderId/returns', validate(schemas.createReturn), (req: Request, res: Response) => {
  try {
    const { items, customerNotes } = req.body;
    const orderId = req.params.orderId;

    const returnRequest = orderService.createReturn(orderId, items, customerNotes);

    success(res, returnRequest, undefined, 201);
  } catch (err: any) {
    error(res, 'RETURN_ERROR', err.message, 400);
  }
});

export default router;
