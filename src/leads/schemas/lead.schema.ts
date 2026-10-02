import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LeadStatus, PropertyType } from '../../common/types/enums';

export type LeadDocument = HydratedDocument<Lead>;

@Schema({ _id: false })
export class LeadNote {
  @Prop({ required: true })
  text!: string;

  @Prop({ default: () => new Date() })
  createdAt!: Date;
}
export const LeadNoteSchema = SchemaFactory.createForClass(LeadNote);

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ type: String, enum: PropertyType })
  propertyType?: PropertyType;

  @Prop()
  monthlyBill?: number;

  /** Free-text: product name, service name, or general enquiry topic. */
  @Prop({ trim: true })
  interest?: string;

  @Prop()
  message?: string;

  @Prop({
    type: String,
    enum: LeadStatus,
    default: LeadStatus.NEW,
    index: true,
  })
  status!: LeadStatus;

  @Prop({ type: [LeadNoteSchema], default: [] })
  notes!: LeadNote[];

  /** Where the enquiry originated from (e.g. "product:550w-mono-panel", "calculator", "contact-page"). */
  @Prop()
  source?: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ createdAt: -1 });
