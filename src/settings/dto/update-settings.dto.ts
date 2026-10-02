import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { SeoDto } from '../../common/dto/seo.dto';

class SocialLinksDto {
  @IsOptional() @IsUrl() facebook?: string;
  @IsOptional() @IsUrl() instagram?: string;
  @IsOptional() @IsUrl() twitter?: string;
  @IsOptional() @IsUrl() linkedin?: string;
  @IsOptional() @IsUrl() youtube?: string;
}

class StatisticsDto {
  @IsOptional() @IsNumber() @Min(0) projectsCompleted?: number;
  @IsOptional() @IsNumber() @Min(0) kwInstalled?: number;
  @IsOptional() @IsNumber() @Min(0) happyCustomers?: number;
  @IsOptional() @IsNumber() @Min(0) yearsExperience?: number;
}

class CalculatorConfigDto {
  @IsOptional() @IsNumber() @Min(0) costPerKwh?: number;
  @IsOptional() @IsNumber() @Min(0) sunHours?: number;
  @IsOptional() @IsNumber() @Min(0) systemEfficiency?: number;
  @IsOptional() @IsNumber() @Min(0) costPerKw?: number;
  @IsOptional() @IsNumber() @Min(0) annualDegradation?: number;
  @IsOptional() @IsNumber() @Min(0) sqftPerKw?: number;
}

export class UpdateSettingsDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() businessHours?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional() @IsUrl() googleMapsUrl?: string;
  @IsOptional() @IsString() heroTitle?: string;
  @IsOptional() @IsString() heroSubtitle?: string;
  @IsOptional() @IsString() heroImage?: string;
  @IsOptional() @IsString() aboutText?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StatisticsDto)
  statistics?: StatisticsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CalculatorConfigDto)
  calculatorConfig?: CalculatorConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  defaultSEO?: SeoDto;

  @IsOptional() @IsString() footerText?: string;
}
