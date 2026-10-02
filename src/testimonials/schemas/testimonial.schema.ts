import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  location?: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop()
  image?: string;

  @Prop({ default: false, index: true })
  published!: boolean;

  @Prop({ default: 0 })
  order!: number;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
