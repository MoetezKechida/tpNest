import { PartialType } from '@nestjs/mapped-types';
import { CreateCvDto } from './create-cv.dto';

export class UpdateCvDto extends PartialType(CreateCvDto) {
  name?: string;
  firstname?: string;
  age?: number;
  cin?: string;
  job?: string;
  path?: string;
  userId?: number | null; // null to remove user relation
  skillIds?: number[]; // empty array to remove all skills
}
