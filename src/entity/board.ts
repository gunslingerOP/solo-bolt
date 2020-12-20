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


  //-----------------------RELATIONS-----------------------

  @ManyToOne((type) => User, (user) => user.boards)
  user: User;

  @OneToMany((type) => Thread, (thread) => thread.board)
  threads: Thread[];

  @OneToMany((type) => Design, (design) => design.board)
  designs: Design[];
}
