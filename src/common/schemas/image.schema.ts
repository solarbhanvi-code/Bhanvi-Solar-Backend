import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ImageAsset {
  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  publicId!: string;

  @Prop({ default: '' })
  alt?: string;
}

export const ImageAssetSchema = SchemaFactory.createForClass(ImageAsset);
