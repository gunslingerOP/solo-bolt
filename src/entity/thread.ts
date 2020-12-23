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
import { Design } from "./design";

@Entity("thread")
export class Thread extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({nullable:true})
  location: string;
  

  @Column()
  edited: boolean;

  @Column({nullable:true})
  domElement: string;

  @Column()
  completed: boolean;

  @Column()
  review: boolean;

  //-----------------------RELATIONS-----------------------
  @ManyToOne((type) => Design, (design) => design.threads)
  design: Design;

  @OneToMany((type) => Comment, (comment) => comment.thread)
  comments: Comment[];
}
