import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  BaseEntity,
} from "typeorm";
import { Board } from "./board";
import { Comment } from "./comment";
import { Design } from "./design";
import { Otp } from "./otp";
import { Plan } from "./plan";

@Entity("user")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({unique:true})
  email: string;

  @Column()
  password: string;

  @Column()
  verified: boolean;

  //-----------------------RELATIONS-----------------------

  @OneToMany((type) => Board, (board) => board.user)
  boards: Board[];

  @OneToOne((type) => Plan, (plan) => plan.user)
  plan: Plan;

  @OneToMany((type) => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany((type) => Design, (design) => design.user)
  designs: Design[];

  @OneToMany((type) => Otp, (otp) => otp.user)
  otp: Otp[];
}
