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
import { Thread } from "./thread";
import { User } from "./User";

@Entity("design")
export class Design extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  file: string;

  @Column()
  url: string;

  //-----------------------RELATIONS-----------------------

  @ManyToOne((type) => Board, (board) => board.designs)
  board: Board;

  @ManyToOne((type) => User, (user) => user.designs)
  user: User;
}
