import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Situations } from './Situations';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'recovery_token_hash', type: 'varchar', length: 64, nullable: true })
  recoveryTokenHash!: string | null;

  @Column({ name: 'recovery_token_expires_at', type: 'datetime', nullable: true })
  recoveryTokenExpiresAt!: Date | null;

  @Column({ name: 'situation_id', type: 'int', nullable: true })
  situationId!: number | null;

  @ManyToOne(() => Situations, (situation) => situation.users, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'situation_id' })
  situation!: Situations | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
