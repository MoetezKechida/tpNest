import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateCvDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 100)
  firstname: string;

  @Type(() => Number)
  @IsInt()
  @Min(16)
  @Max(120)
  age: number;

  @IsString()
  @Length(5, 20)
  cin: string;

  @IsString()
  @Length(1, 120)
  job: string;

  @IsString()
  @Length(1, 255)
  path: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  skillIds?: number[];
}
