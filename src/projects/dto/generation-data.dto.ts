import { IsNumber, IsOptional, Min } from 'class-validator';

export class GenerationDataDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualGenerationKwh?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualSavings?: number;
}
