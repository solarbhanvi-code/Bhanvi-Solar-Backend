import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Seo, SeoSchema } from '../../common/schemas/seo.schema';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  shortDescription!: string;

  @Prop({ required: true })
  description!: string;

  /** Lucide icon name rendered on the frontend. */
  @Prop({ default: 'Sun' })
  icon?: string;

  @Prop()
  image?: string;

  @Prop({ type: [String], default: [] })
  highlights!: string[];

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: SeoSchema, default: {} })
  seo?: Seo;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
