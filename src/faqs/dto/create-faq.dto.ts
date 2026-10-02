import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
