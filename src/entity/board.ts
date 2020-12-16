import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
  } from "typeorm";
import { Thread } from "./thread";
import { User } from "./User";
  
  @Entity("board")
  export class Board {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column()
    public: boolean;
  
    @Column()
    thumbnail: string;
  
    @Column()
    file: string;

    @Column()
    url: string;
  

  
  //-----------------------RELATIONS-----------------------
  
  @ManyToOne(() => User, user => user.boards)
  user: User;


@OneToMany(() => Thread, thread => thread.board)
threads: Thread[];
  }