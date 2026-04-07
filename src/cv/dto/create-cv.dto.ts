export class CreateCvDto {
  name: string;
  firstname: string;
  age: number;
  cin: string;
  job: string;
  path: string;
  userId?: number; // Optional, for linking to a user
  skillIds?: number[]; // Optional, for linking to skills
}
