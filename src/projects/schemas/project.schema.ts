import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Seo, SeoSchema } from '../../common/schemas/seo.schema';
import { ImageStage, ProjectType } from '../../common/types/enums';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ _id: false })
export class ProjectImage {
  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  publicId!: string;

  @Prop({ default: '' })
  alt?: string;

  @Prop({ type: String, enum: ImageStage, default: ImageStage.COMPLETED })
  stage!: ImageStage;
}
export const ProjectImageSchema = SchemaFactory.createForClass(ProjectImage);

@Schema({ _id: false })
export class GenerationData {
  @Prop()
  annualGenerationKwh?: number;

  @Prop()
  annualSavings?: number;
}
export const GenerationDataSchema =
  SchemaFactory.createForClass(GenerationData);

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  location!: string;

  @Prop({ required: true })
  capacity!: string;

  @Prop({ type: String, enum: ProjectType, required: true, index: true })
  projectType!: ProjectType;

  @Prop({ required: true })
  description!: string;

  @Prop()
  installationDate?: Date;

  @Prop({ type: [ProjectImageSchema], default: [] })
  images!: ProjectImage[];

  @Prop({ default: false, index: true })
  featured!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: GenerationDataSchema })
  generationData?: GenerationData;

  @Prop({ type: SeoSchema, default: {} })
  seo?: Seo;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
