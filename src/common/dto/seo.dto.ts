import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class SeoDto {
  @IsOptional()
  @IsString()
  @MaxLength(70)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  ogImage?: string;
}
