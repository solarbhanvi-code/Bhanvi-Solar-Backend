import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Seo, SeoSchema } from '../../common/schemas/seo.schema';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ _id: false })
export class SocialLinks {
  @Prop() facebook?: string;
  @Prop() instagram?: string;
  @Prop() twitter?: string;
  @Prop() linkedin?: string;
  @Prop() youtube?: string;
}
export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

@Schema({ _id: false })
export class Statistics {
  @Prop() projectsCompleted?: number;
  @Prop() kwInstalled?: number;
  @Prop() happyCustomers?: number;
  @Prop() yearsExperience?: number;
}
export const StatisticsSchema = SchemaFactory.createForClass(Statistics);

@Schema({ _id: false })
export class CalculatorConfig {
  /** Grid electricity cost per kWh, in the local currency's smallest configured unit. */
  @Prop({ default: 8 })
  costPerKwh!: number;

  /** Average usable peak sun hours per day for the service region. */
  @Prop({ default: 5 })
  sunHours!: number;

  /** Overall system efficiency factor (inverter, wiring, soiling, temperature losses). */
  @Prop({ default: 0.8 })
  systemEfficiency!: number;

  /** Installed cost per kW of system size. */
  @Prop({ default: 55000 })
  costPerKw!: number;

  /** Annual output degradation factor applied for payback estimation. */
  @Prop({ default: 0.005 })
  annualDegradation!: number;

  /** Rough roof area (sq. ft.) required per kW of installed capacity. */
  @Prop({ default: 100 })
  sqftPerKw!: number;
}
export const CalculatorConfigSchema =
  SchemaFactory.createForClass(CalculatorConfig);

@Schema({ timestamps: true })
export class Settings {
  @Prop({ default: 'Bhanvi Solar' })
  companyName!: string;

  @Prop({ default: 'Power Your Future With Solar Energy' })
  tagline!: string;

  @Prop()
  logo?: string;

  @Prop()
  phone?: string;

  @Prop()
  whatsapp?: string;

  @Prop()
  email?: string;

  @Prop()
  address?: string;

  @Prop()
  businessHours?: string;

  @Prop({ type: SocialLinksSchema, default: {} })
  socialLinks?: SocialLinks;

  @Prop()
  googleMapsUrl?: string;

  @Prop({ default: 'Power Your Future With Solar Energy' })
  heroTitle!: string;

  @Prop({
    default: 'Professional solar solutions for homes and businesses.',
  })
  heroSubtitle!: string;

  @Prop()
  heroImage?: string;

  @Prop()
  aboutText?: string;

  @Prop({ type: StatisticsSchema, default: {} })
  statistics?: Statistics;

  @Prop({ type: CalculatorConfigSchema, default: {} })
  calculatorConfig!: CalculatorConfig;

  @Prop({ type: SeoSchema, default: {} })
  defaultSEO?: Seo;

  @Prop()
  footerText?: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
