import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { User } from "./User";
  
  @Entity("profile")
  export class Profile extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column()
    url: string;
  
  
//-----------------------RELATIONS-----------------------
  
    @ManyToOne((type) => User, (user) => user.profile)
    user: User;
  }
  