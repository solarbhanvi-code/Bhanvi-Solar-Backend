import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  description?: string;

  @Prop()
  image?: string;

  @Prop({ default: 0 })
  order!: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
