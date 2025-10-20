import { Response } from 'express';
import { ApiResponse } from '../types';

export const success = <T>(res: Response, data: T, meta?: any, statusCode = 200) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const error = (
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: any
) => {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };

  return res.status(statusCode).json(response);
};
