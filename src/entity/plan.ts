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
import { User } from "./User";

@Entity("plan")
export class Plan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  price: string;

  @Column()
  boards: number;

  @Column()
  makePrivate: boolean;

  @Column()
  name: string;

  //-----------------------RELATIONS-----------------------
  @OneToMany((type) => User, (user) => user.plan)
  users: User[];
}
