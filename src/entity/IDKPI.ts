import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum IDKPITypes {
  VOD = "VOD",
  PHY = "PHY",
  ETOP = "ETOP",
}

@Entity()
export class IDKPI {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  type: string;
  enum: IDKPITypes;

  @Column()
  value: number;

  @Column({ nullable: true })
  isTrusted: boolean;
}
