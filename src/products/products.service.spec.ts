import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { Availability } from '../common/types/enums';

describe('ProductsService', () => {
  let service: ProductsService;
  let saveMock: jest.Mock;
  let existsMock: jest.Mock;
  let findOneMock: jest.Mock;
  let modelConstructor: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn();
    existsMock = jest.fn().mockResolvedValue(null);
    findOneMock = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    });

    modelConstructor = jest
      .fn()
      .mockImplementation((data: Record<string, unknown>) => ({
        ...data,
        save: saveMock,
      }));
    Object.assign(modelConstructor, {
      exists: existsMock,
      findOne: findOneMock,
      findById: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: modelConstructor },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('generates a slug from the product name on create', async () => {
    saveMock.mockImplementation(function (this: Record<string, unknown>) {
      return Promise.resolve(this);
    });

    await service.create({
      name: '550W Mono Solar Panel',
      description: 'A great panel',
      category: '507f1f77bcf86cd799439011',
      availability: Availability.IN_STOCK,
    });

    expect(modelConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '550w-mono-solar-panel' }),
    );
  });

  it('appends a numeric suffix when the slug is already taken', async () => {
    existsMock.mockResolvedValueOnce(true).mockResolvedValueOnce(null);
    saveMock.mockImplementation(function (this: Record<string, unknown>) {
      return Promise.resolve(this);
    });

    await service.create({
      name: '550W Mono Solar Panel',
      description: 'A great panel',
      category: '507f1f77bcf86cd799439011',
    });

    expect(modelConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '550w-mono-solar-panel-2' }),
    );
  });

  it('throws NotFoundException when a product slug does not exist', async () => {
    await expect(service.findBySlug('does-not-exist')).rejects.toThrow(
      NotFoundException,
    );
  });
});
