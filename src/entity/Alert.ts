import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { IDKPI } from "./IDKPI";

export enum AlertTypes {
  CRITICAL = "CRITICAL",
  MAJOR = "MAJOR",
  MINOR = "MINOR",
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  type: string;
  enum: AlertTypes;

  @OneToOne(() => IDKPI)
  @JoinColumn()
  IDKPI: IDKPI;
}
