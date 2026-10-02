import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Availability } from '../../common/types/enums';

export class QueryProductsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsIn(['newest', 'price-asc', 'price-desc', 'name-asc'])
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
}
