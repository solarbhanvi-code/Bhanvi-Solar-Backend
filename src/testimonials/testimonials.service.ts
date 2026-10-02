import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Testimonial } from './schemas/testimonial.schema';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<Testimonial>,
  ) {}

  async findAll(includeUnpublished = false) {
    const filter = includeUnpublished ? {} : { published: true };
    return this.testimonialModel
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const testimonial = await this.testimonialModel.findById(id).exec();
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  async create(dto: CreateTestimonialDto) {
    const created = new this.testimonialModel(dto);
    return created.save();
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const testimonial = await this.findById(id);
    Object.assign(testimonial, dto);
    return testimonial.save();
  }

  async remove(id: string) {
    const testimonial = await this.testimonialModel
      .findByIdAndDelete(id)
      .exec();
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }
}
