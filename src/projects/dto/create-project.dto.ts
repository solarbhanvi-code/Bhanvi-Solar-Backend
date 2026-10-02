import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProjectType } from '../../common/types/enums';
import { SeoDto } from '../../common/dto/seo.dto';
import { ProjectImageDto } from './project-image.dto';
import { GenerationDataDto } from './generation-data.dto';

export class CreateProjectDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsString()
  @MaxLength(150)
  location!: string;

  @IsString()
  @MaxLength(50)
  capacity!: string;

  @IsEnum(ProjectType)
  projectType!: ProjectType;

  @IsString()
  description!: string;

  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectImageDto)
  images?: ProjectImageDto[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => GenerationDataDto)
  generationData?: GenerationDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;
}
