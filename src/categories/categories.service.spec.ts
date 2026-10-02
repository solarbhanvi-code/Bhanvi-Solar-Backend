import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';
import { Product } from '../products/schemas/product.schema';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: { findByIdAndDelete: jest.Mock };
  let productModel: { countDocuments: jest.Mock; updateMany: jest.Mock };

  beforeEach(async () => {
    categoryModel = {
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ id: 'cat-1' }),
      }),
    };
    productModel = {
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
      updateMany: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getModelToken(Category.name), useValue: categoryModel },
        { provide: getModelToken(Product.name), useValue: productModel },
      ],
    }).compile();

    service = module.get(CategoriesService);
  });

  it('refuses to delete a category that still has products, without a reassignTo target', async () => {
    productModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(3),
    });

    await expect(service.remove('cat-1')).rejects.toThrow(ConflictException);
    expect(categoryModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('deletes a category with no dependent products', async () => {
    productModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    await service.remove('cat-1');
    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith('cat-1');
  });
});
