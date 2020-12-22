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
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Access } from "./access";
import { Design } from "./design";
import { Thread } from "./thread";
import { User } from "./User";

@Entity("board")
export class Board extends BaseEntity {
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
  name: string;

  @Column()
  author: number;

  //-----------------------RELATIONS-----------------------

  @ManyToOne((type) => User, (user) => user.boards)
  user: User;

  @OneToMany((type) => Thread, (thread) => thread.board)
  threads: Thread[];

  @OneToMany((type) => Design, (design) => design.board)
  designs: Design[];

  @OneToMany((type) => Access, (access) => access.board)
  accesses: Access[];
}
