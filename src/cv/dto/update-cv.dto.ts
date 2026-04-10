import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCvDto } from './create-cv.dto';

export class UpdateCvDto extends PartialType(CreateCvDto) {
  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @Type(() => Number)
  @IsInt()
  userId?: number | null;
}
