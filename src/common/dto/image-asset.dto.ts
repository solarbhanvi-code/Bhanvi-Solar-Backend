import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ImageAssetDto {
  @IsString()
  url!: string;

  @IsString()
  publicId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;
}
