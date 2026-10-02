import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { Product } from '../products/schemas/product.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { toSlug } from '../common/utils/slugify.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async findAll() {
    return this.categoryModel.find().sort({ order: 1, name: 1 }).exec();
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = await this.uniqueSlug(toSlug(dto.name));
    const created = new this.categoryModel({ ...dto, slug });
    return created.save();
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findById(id);
    if (dto.name && dto.name !== category.name) {
      category.set('slug', await this.uniqueSlug(toSlug(dto.name), id));
    }
    Object.assign(category, dto);
    return category.save();
  }

  async remove(id: string, reassignTo?: string) {
    const productCount = await this.productModel
      .countDocuments({ category: id })
      .exec();

    if (productCount > 0) {
      if (!reassignTo) {
        throw new ConflictException(
          `Cannot delete category: ${productCount} product(s) still reference it. Provide reassignTo to move them first.`,
        );
      }
      await this.findById(reassignTo);
      await this.productModel
        .updateMany({ category: id }, { category: reassignTo })
        .exec();
    }

    const category = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base;
    let suffix = 1;
    while (
      await this.categoryModel.exists({
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
