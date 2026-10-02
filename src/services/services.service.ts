import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { toSlug } from '../common/utils/slugify.util';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  async findAll(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return this.serviceModel.find(filter).sort({ order: 1, name: 1 }).exec();
  }

  async findBySlug(slug: string) {
    const service = await this.serviceModel
      .findOne({ slug, isActive: true })
      .exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async findById(id: string) {
    const service = await this.serviceModel.findById(id).exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(dto: CreateServiceDto) {
    const slug = await this.uniqueSlug(toSlug(dto.name));
    const created = new this.serviceModel({ ...dto, slug });
    return created.save();
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.findById(id);
    if (dto.name && dto.name !== service.name) {
      service.set('slug', await this.uniqueSlug(toSlug(dto.name), id));
    }
    Object.assign(service, dto);
    return service.save();
  }

  async remove(id: string) {
    const service = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base;
    let suffix = 1;
    while (
      await this.serviceModel.exists({
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
