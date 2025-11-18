import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { CoordonneesBancaires } from './coordonnees-bancaires.entity';
// import { SessionFormation } from './session-formation.entity';
// import { HeuresFormation } from './heures-formation.entity';
// import { PaiementCoordination } from './paiement-coordination.entity';
// import { MemoireReglement } from './memoire-reglement.entity';
import { userRole } from 'utils/constants';

@Entity('utilisateur')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: userRole })
  role: userRole;

  @Column({ default: false })
  est_actif: boolean; // Activé par l'Admin

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_creation: Date;

  // Relation 1-1 avec les coordonnées bancaires
  @OneToOne(() => CoordonneesBancaires, (bancaire) => bancaire.user)
  coordonneesBancaires: CoordonneesBancaires;

  // Relations pour les rôles spécifiques:
  // Si l'utilisateur est un COORDINATEUR
  //   @OneToMany(() => SessionFormation, session => session.coordinateur)
  //   sessionsCoordonnees: SessionFormation[];

  //   @OneToMany(() => PaiementCoordination, paiement => paiement.coordinateur)
  //   paiementsCoordination: PaiementCoordination[];

  //   // Si l'utilisateur est un FORMATEUR
  //   @OneToMany(() => HeuresFormation, heures => heures.formateur)
  //   heuresFormation: HeuresFormation[];

  //   // Si l'utilisateur est un COMPTABLE
  //   @OneToMany(() => MemoireReglement, memoire => memoire.comptable)
  //   memoiresCrees: MemoireReglement[];
}
