import { IsEnum, IsOptional } from 'class-validator';
import { LeadStatus } from '../../common/types/enums';

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}
