import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from "typeorm";
import { Board } from "./board";
import { Comment } from "./comment";
import { Otp } from "./otp";
import { Plan } from "./plan";

@Entity("user")
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;


//-----------------------RELATIONS-----------------------

@OneToMany(() => Board, board => board.user)
boards: Board[];

@OneToOne(() => Plan, plan => plan.user)
plan: Plan;

@OneToMany(()=>Comment, comment=>comment.user)
comments: Comment[]

@OneToOne(()=>Otp, otp=>otp.user)
otp:Otp
}
