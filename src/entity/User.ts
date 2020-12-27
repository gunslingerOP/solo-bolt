import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  BaseEntity,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from "typeorm";
import { Board } from "./board";
import { Comment } from "./comment";
import { Design } from "./design";
import { Following } from "./following";
import { Otp } from "./otp";
import { Plan } from "./plan";
import { Profile } from "./profile";

@Entity("user")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({unique:true, nullable:true})
  email: string;

  @Column({unique:true, nullable:true})
  phone: string;

  @Column()
  verified: boolean;

  @Column()
  planPrice: string;
  

  //-----------------------RELATIONS-----------------------

  @OneToMany((type) => Board, (board) => board.user)
  boards: Board[];


  @OneToMany((type) => Following, (following) => following.user)
  following: Following[];


  @OneToMany((type) => Profile, (profile) => profile.user)
  profile: Profile[];


  @ManyToOne((type) => Plan, (plan) => plan.users)
  plan: Plan;

  @OneToMany((type) => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany((type) => Design, (design) => design.user)
  designs: Design[];

  @OneToMany((type) => Otp, (otp) => otp.user)
  otp: Otp[];
}
