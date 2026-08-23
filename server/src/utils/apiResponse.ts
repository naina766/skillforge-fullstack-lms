import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200, message?: string) {
    return res.status(statusCode).json({
      success: true,
      ...(message ? { message } : {}),
      data,
    });
  }

  static paginated<T>(res: Response, items: T[], pagination: PaginationMeta, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data: {
        items,
        pagination,
      },
    });
  }

  static error(res: Response, message: string, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    return res.status(statusCode).json({
      success: false,
      message,
      errorCode,
    });
  }
}
