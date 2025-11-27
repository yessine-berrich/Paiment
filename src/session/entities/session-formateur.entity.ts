// src/session-formateur/entities/session-formateur.entity.ts

import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn, 
    Unique // Optionnel: Assure qu'un formateur n'est pas affecté deux fois à la même session
} from 'typeorm';
// 🚨 Assurez-vous que les chemins d'accès sont corrects par rapport à la racine du projet
import { Session } from '../../session/entities/session.entity'; 
import { User } from '../../users/entities/users.entity';       

/**
 * Entité de jointure gérant la relation Many-to-Many entre Session et User (Formateur).
 * Chaque enregistrement représente l'affectation d'un formateur à une session spécifique.
 */
@Entity('session_formateur')
@Unique(['id_session', 'id_formateur']) // 👈 Empêche les doublons d'affectation
export class SessionFormateur {
    
    @PrimaryGeneratedColumn()
    id: number;

    // ------------------------------------
    // 1. Relation vers la Session
    // ------------------------------------

    @Column({ type: 'integer' })
    id_session: number; // Clé étrangère

    @ManyToOne(() => Session, (session) => session.sessionFormateurs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_session' })
    session: Session;

    // ------------------------------------
    // 2. Relation vers le Formateur (User)
    // ------------------------------------
    
    @Column({ type: 'integer' })
    id_formateur: number; // Clé étrangère vers l'utilisateur (le formateur)

    @ManyToOne(() => User, (user) => user, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_formateur' })
    formateur: User;

    // ------------------------------------
    // 3. Métadonnées (Facultatif)
    // ------------------------------------

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date_affectation: Date;
}