import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { Board } from "./board";

  import { User } from "./User";
  
  @Entity("following")
  export class Following extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column()
    boardId: number;
  
  
//-----------------------RELATIONS-----------------------
  
    @ManyToOne((type) => User, (user) => user.following)
    user: User;
  }
  