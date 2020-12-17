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
  file: string;

  @Column()
  completed: boolean;

  @Column()
  edited: boolean;

  //-----------------------RELATIONS-----------------------
  @ManyToOne((type) => User, (user) => user.comments)
  user: User;

  @ManyToOne((type) => Thread, (thread) => thread.comments)
  thread: Thread;
}
