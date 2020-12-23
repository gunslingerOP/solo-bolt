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
  JoinColumn,
} from "typeorm";
import { Board } from "./board";
import { Design } from "./design";
import { Thread } from "./thread";
import { User } from "./User";

@Entity("comment")
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  text: string;

  @Column()
  review: boolean;

  @Column()
  completed: boolean;

  @Column()
  edited: boolean;

  //-----------------------RELATIONS-----------------------
  @ManyToOne((type) => User, (user) => user.comments)
  user: User;

  @OneToMany((type) => Design, (design) => design.comment)
  designs: Design[];

  @ManyToOne((type) => Thread, (thread) => thread.comments)
  thread: Thread;

  @ManyToOne((type) => Board, (board) => board.comments)
  board: Board;
}
