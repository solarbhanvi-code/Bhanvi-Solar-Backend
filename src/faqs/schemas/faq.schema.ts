import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FaqDocument = HydratedDocument<Faq>;

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true })
  question!: string;

  @Prop({ required: true })
  answer!: string;

  @Prop({ default: 'General', trim: true })
  category?: string;

  @Prop({ default: true, index: true })
  published!: boolean;

  @Prop({ default: 0 })
  order!: number;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
