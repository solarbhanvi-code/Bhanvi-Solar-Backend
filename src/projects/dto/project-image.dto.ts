import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ImageStage } from '../../common/types/enums';

export class ProjectImageDto {
  @IsString()
  url!: string;

  @IsString()
  publicId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @IsOptional()
  @IsEnum(ImageStage)
  stage?: ImageStage;
}
