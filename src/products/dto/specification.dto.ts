import { IsString, MaxLength } from 'class-validator';

export class SpecificationDto {
  @IsString()
  @MaxLength(100)
  key!: string;

  @IsString()
  @MaxLength(200)
  value!: string;
}
