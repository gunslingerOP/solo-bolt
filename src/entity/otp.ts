import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
  } from "typeorm";
import { User } from "./User";
  
  @Entity("otp")
  export class Otp {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column("point")
    number: number;
  
    @Column()
    used: boolean;
  
    @Column()
    expired: boolean;
  
  //-----------------------RELATIONS-----------------------
  @OneToOne(()=>User, user=>user.otp)
  user:User
  }
  