import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cv } from "src/cv/entities/cv.entity";

@Entity('skill')
export class Skill {
    @PrimaryGeneratedColumn()
  id: number;

  @Column() designation: string;

  @ManyToMany(() => Cv, (cv) => cv.skills)
  cvs: Cv[];
}
