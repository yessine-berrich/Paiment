import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';

@Entity('session')
export class Session {
  @PrimaryGeneratedColumn()
  id_session: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  promotion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  classe: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialite: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  niveau: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  semestre: string;

  @Column({ type: 'date', nullable: false })
  date_debut: Date;

  @Column({ type: 'date', nullable: false })
  date_fin: Date;

  @Column({ type: 'integer' })
  id_coordinateur: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_coordinateur' })
  coordinateur: User;
}
