import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { toSlug } from '../common/utils/slugify.util';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  'name-asc': { name: 1 },
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async findAll(query: QueryProductsDto) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      availability,
      featured,
      sort,
    } = query;

    const filter: QueryFilter<Product> = { isActive: true };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (availability) filter.availability = availability;
    if (featured !== undefined) filter.featured = featured;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .sort(SORT_MAP[sort ?? 'newest'])
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findAllForAdmin(query: QueryProductsDto) {
    const { page = 1, limit = 20, search, category } = query;
    const filter: QueryFilter<Product> = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name slug')
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findRelated(productId: string, categoryId: string, limitCount = 4) {
    return this.productModel
      .find({ _id: { $ne: productId }, category: categoryId, isActive: true })
      .limit(limitCount)
      .exec();
  }

  async create(dto: CreateProductDto) {
    const slug = await this.uniqueSlug(toSlug(dto.name));
    const created = new this.productModel({ ...dto, slug });
    return created.save();
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findById(id);
    if (dto.name && dto.name !== product.name) {
      product.set('slug', await this.uniqueSlug(toSlug(dto.name), id));
    }
    Object.assign(product, dto);
    return product.save();
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base;
    let suffix = 1;
    while (
      await this.productModel.exists({
        slug,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      })
    ) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }
}
