import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { SessionFormateur } from './session-formateur.entity';

@Entity('session')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

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

  @OneToMany(() => SessionFormateur, (sessionFormateur) => sessionFormateur.session)
  sessionFormateurs: SessionFormateur[];
}
