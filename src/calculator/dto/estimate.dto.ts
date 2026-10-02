import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PropertyType } from '../../common/types/enums';

export class EstimateDto {
  @ValidateIf((o: EstimateDto) => !o.monthlyConsumptionKwh)
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  monthlyBill?: number;

  @ValidateIf((o: EstimateDto) => !o.monthlyBill)
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  monthlyConsumptionKwh?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  roofAreaSqft?: number;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
