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
import { Board } from "./board";
import { Comment } from "./comment";

@Entity("thread")
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column("point")
  location: string;

  @Column()
  edited: boolean;

  @Column()
  domElement: string;

  @Column()
  completed: boolean;

//-----------------------RELATIONS-----------------------
@ManyToOne(() => Board, board => board.threads)
board: Board;

@OneToMany(()=>Comment, comment=>comment.thread)
comments: Comment[]
}
