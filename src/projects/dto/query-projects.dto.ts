import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ProjectType } from '../../common/types/enums';

export class QueryProjectsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ProjectType)
  projectType?: ProjectType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;
}
