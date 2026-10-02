import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ImageAsset,
  ImageAssetSchema,
} from '../../common/schemas/image.schema';
import { Seo, SeoSchema } from '../../common/schemas/seo.schema';
import { Availability } from '../../common/types/enums';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class Specification {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  value!: string;
}
export const SpecificationSchema = SchemaFactory.createForClass(Specification);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  shortDescription?: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: [ImageAssetSchema], default: [] })
  images!: ImageAsset[];

  /** null/undefined => "Request Quote" on the storefront. */
  @Prop({ type: Number, min: 0 })
  price?: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category!: Types.ObjectId;

  @Prop({ default: '' })
  brand?: string;

  @Prop({ type: [SpecificationSchema], default: [] })
  specifications!: Specification[];

  @Prop({ type: [String], default: [] })
  features!: string[];

  @Prop({ default: '' })
  warranty?: string;

  @Prop({
    type: String,
    enum: Availability,
    default: Availability.IN_STOCK,
  })
  availability!: Availability;

  @Prop({ type: [String], default: [] })
  applications!: string[];

  @Prop({ default: false, index: true })
  featured!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: SeoSchema, default: {} })
  seo?: Seo;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', description: 'text' });
