import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// 🚨 CORRECTION: Ajout de 'In' pour la recherche multi-ID
import { LessThanOrEqual, MoreThanOrEqual, Repository, In } from 'typeorm'; 
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UsersService } from '../users/users.service';
import { userRole } from 'utils/constants'; 
import { SessionFormateur } from '../session/entities/session-formateur.entity'; 

// 💡 DÉCLARATION D'UN TYPE POUR LES DONNÉES D'AFFECTATION (Résout TS2345/TS2339)
type SessionFormateurData = {
    id_session: number;
    id_formateur: number;
};

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    
    @InjectRepository(SessionFormateur)
    private sessionFormateurRepository: Repository<SessionFormateur>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  // -----------------------------------------------------------
  // CRUD STANDARD
  // -----------------------------------------------------------

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const { id_coordinateur } = createSessionDto;

    const coordinateur = await this.usersService.getUserById(id_coordinateur);

    if (!coordinateur) {
      throw new NotFoundException(
        `L'utilisateur avec l'ID ${id_coordinateur} n'existe pas.`,
      );
    }

    if (coordinateur.role !== userRole.COORDINATEUR) {
      throw new BadRequestException(
        `L'utilisateur ID ${id_coordinateur} n'est pas un Coordinateur (rôle actuel: ${coordinateur.role}).`,
      );
    }

    const newSession = this.sessionRepository.create(createSessionDto);
    return this.sessionRepository.save(newSession);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find({ 
        relations: ['coordinateur', 'sessionFormateurs', 'sessionFormateurs.formateur'] 
    }); 
  }

  async findOne(id: number): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id: id },
      relations: ['coordinateur', 'sessionFormateurs', 'sessionFormateurs.formateur'],
    });
    if (!session) {
      throw new NotFoundException(`Session avec l'ID ${id} non trouvée.`);
    }
    return session;
  }

  async update(
    id: number,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const session = await this.sessionRepository.preload({
      id: id,
      ...updateSessionDto,
    });
    if (!session) {
      throw new NotFoundException(`Session avec l'ID ${id} non trouvée.`);
    }
    return this.sessionRepository.save(session);
  }

  async remove(id: number): Promise<void> {
    const result = await this.sessionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Session avec l'ID ${id} non trouvée.`);
    }
  }

  // -----------------------------------------------------------
  // MÉTHODES SPÉCIFIQUES
  // -----------------------------------------------------------

  async findSessionByCoordinateur(
    coordinateurId: number,
  ): Promise<Session | null> {
    const today = new Date();

    const session = await this.sessionRepository.findOne({
      where: {
        id_coordinateur: coordinateurId,
        date_debut: LessThanOrEqual(today),
        date_fin: MoreThanOrEqual(today),
      },
      order: {
        date_debut: 'DESC', 
      },
    });

    return session;
  }

  /**
   * Affecte un ou plusieurs formateurs à une session.
   */
  async affecterFormateurs(
    sessionId: number,
    formateurIds: number[],
  ): Promise<SessionFormateur[]> {
    if (!formateurIds || formateurIds.length === 0) {
      throw new BadRequestException('La liste des IDs de formateurs ne peut pas être vide.');
    }

    const session = await this.sessionRepository.findOneBy({ id: sessionId });
    if (!session) {
      throw new NotFoundException(`Session ID ${sessionId} non trouvée.`);
    }

    // 🚨 CORRECTION TS2345 : Typage explicite des tableaux
    const errors: string[] = []; 
    const affectationsToCreate: SessionFormateurData[] = []; 

    // 2. Vérifier chaque Formateur et son rôle
    await Promise.all(
      formateurIds.map(async (id_formateur) => {
        try {
            const user = await this.usersService.getUserById(id_formateur);

            if (!user) {
              // Ligne 161 corrigée
              errors.push(`Formateur ID ${id_formateur} non trouvé.`); 
            } else if (user.role !== userRole.FORMATEUR) {
              // Ligne 164 corrigée
              errors.push(
                `L'utilisateur ID ${id_formateur} n'est pas un Formateur (rôle actuel: ${user.role}).`,
              );
            } else {
              // Ligne 168 corrigée
              affectationsToCreate.push({ id_session: sessionId, id_formateur });
            }
        } catch (e) {
             // Ligne 171 corrigée
             errors.push(`Erreur lors de la vérification du Formateur ID ${id_formateur}.`);
        }
      }),
    );
    
    if (errors.length > 0) {
        throw new BadRequestException(errors.join(' | '));
    }

    // 3. Filtrer les affectations existantes
    const existingAffectations = await this.sessionFormateurRepository.findBy({
      id_session: sessionId,
      // 🚨 CORRECTION TS2322 : Utilisation de l'opérateur 'In' pour rechercher plusieurs IDs
      id_formateur: In(formateurIds), 
    });

    const existingFormateurIds = existingAffectations.map(a => a.id_formateur);
    
    // 🚨 CORRECTION TS2339 : 'data' est correctement typé
    const newAffectationsData = affectationsToCreate.filter(
      (data) => !existingFormateurIds.includes(data.id_formateur)
    );
    
    if (newAffectationsData.length === 0) {
      throw new BadRequestException('Tous les formateurs listés sont déjà affectés à cette session.');
    }
    
    // 4. Créer et Sauvegarder les nouvelles affectations
    const newAffectations = this.sessionFormateurRepository.create(newAffectationsData);
    
    return this.sessionFormateurRepository.save(newAffectations);
  }
}