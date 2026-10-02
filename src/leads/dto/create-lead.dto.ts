import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PropertyType } from '../../common/types/enums';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^[+()\-\s\d]{7,20}$/, {
    message: 'Please provide a valid phone number',
  })
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyBill?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  interest?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  /** Honeypot field — must stay empty. Filled in => treated as spam. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
