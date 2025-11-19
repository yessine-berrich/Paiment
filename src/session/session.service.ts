import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UsersService } from '../users/users.service';
import { userRole } from 'utils/constants';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const { id_coordinateur } = createSessionDto;

    // 1. Récupérer l'utilisateur pour vérifier son rôle
    const coordinateur = await this.usersService.getUserById(id_coordinateur);
    // NOTE: Si vous n'avez pas de findUserById, utilisez findOneById, ou créez cette méthode.

    if (!coordinateur) {
      throw new NotFoundException(
        `L'utilisateur avec l'ID ${id_coordinateur} n'existe pas.`,
      );
    }

    // 2. Vérifier si l'utilisateur a le rôle COORDINATEUR
    // (Utilisez l'énumération corrigée COORDINATEUR)
    if (coordinateur.role !== userRole.COORDINATEUR) {
      throw new BadRequestException(
        `L'utilisateur ID ${id_coordinateur} n'est pas un Coordinateur (rôle actuel: ${coordinateur.role}).`,
      );
    }

    // 3. Sauvegarder la session si le rôle est valide
    const newSession = this.sessionRepository.create(createSessionDto);
    return this.sessionRepository.save(newSession);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find({ relations: ['coordinateur'] }); // Récupérer le coordinateur
  }

  async findOne(id: number): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id_session: id },
      relations: ['coordinateur'],
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
      id_session: id,
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

  /**
   * Trouve la session courante basée sur l'ID du coordinateur et la période de temps.
   * Une session est considérée comme 'courante' si la date d'aujourd'hui
   * est entre date_debut et date_fin.
   */
  // ... (dans SessionService)

  async findSessionByCoordinateur(
    coordinateurId: number,
  ): Promise<Session | null> {
    // Il est préférable d'utiliser new Date() directement. TypeORM gère la conversion SQL.
    const today = new Date();

    const session = await this.sessionRepository.findOne({
      where: {
        id_coordinateur: coordinateurId,
        date_debut: LessThanOrEqual(today),
        date_fin: MoreThanOrEqual(today),
      },
      // 💡 Suggestion : Ajoutez une limite (LIMIT 1) si vous ne voulez qu'une session.
      // Et un tri si vous avez plusieurs sessions courantes (par exemple, la plus récente).
      order: {
        date_debut: 'DESC', // Chercher la session courante la plus récemment commencée
      },
    });

    return session;
  }
}
