import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Seo {
  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  keywords?: string[];

  @Prop()
  ogImage?: string;
}

export const SeoSchema = SchemaFactory.createForClass(Seo);
