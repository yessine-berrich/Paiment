import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './users.entity';

@Entity('coordonnees_bancaires')
export class CoordonneesBancaires {
  @PrimaryGeneratedColumn()
  id_bancaire: number;

  @Column({ length: 20, unique: true })
  n_cin: string;

  @Column({ length: 24, unique: true })
  rib: string;

  @Column({ length: 100, nullable: true })
  banque: string;

  // Relation 1-1 vers l'utilisateur
  @OneToOne(() => User, (user) => user.coordonneesBancaires)
  @JoinColumn({ name: 'id_utilisateur' }) // La clé étrangère sera 'id_utilisateur'
  user: User;
}
