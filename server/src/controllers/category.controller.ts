import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { ApiResponse } from '../utils/apiResponse';

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAllCategories();
      return ApiResponse.success(res, categories);
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, icon } = req.body;
      const category = await CategoryService.createCategory(name, description, icon);
      return ApiResponse.success(res, category, 201, 'Category created successfully.');
    } catch (error) {
      return next(error);
    }
  }
}
