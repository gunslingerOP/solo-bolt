import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity("otp")
export class Otp extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  code: string;

  @Column()
  used: boolean;

  @Column()
  type: string;

  @Column()
  expired: boolean;

  //-----------------------RELATIONS-----------------------
  @ManyToOne((type) => User, (user) => user.otp)
  user: User;
}
