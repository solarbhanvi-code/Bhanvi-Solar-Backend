import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Availability } from '../../common/types/enums';
import { ImageAssetDto } from '../../common/dto/image-asset.dto';
import { SeoDto } from '../../common/dto/seo.dto';
import { SpecificationDto } from './specification.dto';

export class CreateProductDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  shortDescription?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageAssetDto)
  images?: ImageAssetDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsMongoId()
  category!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationDto)
  specifications?: SpecificationDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  warranty?: string;

  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applications?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;
}
