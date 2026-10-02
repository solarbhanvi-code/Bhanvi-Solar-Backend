import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq } from './schemas/faq.schema';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(@InjectModel(Faq.name) private faqModel: Model<Faq>) {}

  async findAll(includeUnpublished = false) {
    const filter = includeUnpublished ? {} : { published: true };
    return this.faqModel.find(filter).sort({ order: 1, createdAt: 1 }).exec();
  }

  async findById(id: string) {
    const faq = await this.faqModel.findById(id).exec();
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async create(dto: CreateFaqDto) {
    const created = new this.faqModel(dto);
    return created.save();
  }

  async update(id: string, dto: UpdateFaqDto) {
    const faq = await this.findById(id);
    Object.assign(faq, dto);
    return faq.save();
  }

  async remove(id: string) {
    const faq = await this.faqModel.findByIdAndDelete(id).exec();
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }
}
