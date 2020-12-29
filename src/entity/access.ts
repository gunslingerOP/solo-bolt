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
import { Board } from "./board";
  import { Thread } from "./thread";
  import { User } from "./User";
  
  @Entity("access")
  export class Access extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column()
    type: number;


    @Column({nullable:true})
    active: boolean;
  

    @Column()
    userId: number;

  
    //-----------------------RELATIONS-----------------------
    @ManyToOne((type) => Board, (board) => board.accesses)
    board: Board;

}
  