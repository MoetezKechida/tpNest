import { Column, Entity, JoinTable,OneToMany,PrimaryGeneratedColumn } from "typeorm";
import { Cv } from "../../cv/entities/cv.entity";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() username: string;
  @Column() email: string;
  @Column() password: string;

  @OneToMany(() => Cv, (cv) => cv.user)
  cvs: Cv[];
}
