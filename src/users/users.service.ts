import { userRole } from 'utils/constants';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from './auth.provider';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { CoordonneesBancaires } from './entities/coordonnees-bancaires.entity';
import { Session } from 'src/session/entities/session.entity';
import { SessionService } from '../session/session.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthService,
    @InjectRepository(CoordonneesBancaires)
    private readonly bancaireRepository: Repository<CoordonneesBancaires>,

    @Inject(forwardRef(() => SessionService))
    private readonly sessionService: SessionService,
  ) {}
  async register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
  }

  async login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
  }

  async getCurrentUser(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      // 1. Correct the 'where' clause: id: id, or simply id
      where: { id },
      // 2. 'relations' must be a direct property of the options object
      relations: ['coordonneesBancaires'],
    });
  }

  async updateStatus(updateUserStatusDto: UpdateUserStatusDto) {
    const { userId, est_actif } = updateUserStatusDto;

    // 1. Trouver l'utilisateur
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé.');
    }

    // 2. Mettre à jour le statut
    user.est_actif = est_actif;

    const updatedUser = await this.userRepository.save(user);

    // Retourner l'utilisateur mis à jour (sans mot de passe)
    const { password, ...result } = updatedUser;

    return {
      message: `Statut de l'utilisateur ${userId} mis à jour.`,
      user: result,
    };
  }

  /**
   * Récupère tous les utilisateurs enregistrés dans la base de données.
   * @returns Promise<User[]> La liste complète des utilisateurs.
   */
  async getAllUsers(): Promise<User[]> {
    // 🚨 NOTE: Vous voudrez peut-être exclure les champs sensibles (comme le mot de passe)
    // soit ici avec .find({ select: [...] }), soit dans l'entité User avec @Exclude().
    return this.userRepository.find();
  }

  /**
   * Récupère un utilisateur par son ID.
   * @param id L'identifiant de l'utilisateur.
   * @returns Promise<User> L'utilisateur trouvé.
   */
  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    return user;
  }

  /**
   * Met à jour uniquement les champs autorisés (email, password, rib, banque)
   * pour l'utilisateur qui effectue la requête.
   * @param id L'identifiant de l'utilisateur (issu du JWT).
   * @param updateUserDto Les données à mettre à jour (simplifiées).
   * @returns Promise<User> L'utilisateur mis à jour.
   */
  async updateCurrentUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // 1. Chercher l'utilisateur avec ses coordonnées bancaires liées
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['coordonneesBancaires'], // Charger la relation
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    // --- Mise à jour de l'entité USER (email, password) ---
    // Utiliser Object.assign pour mettre à jour l'entité User uniquement avec les champs pertinents du DTO
    const userUpdateData = {
      email: updateUserDto.email,
      password: updateUserDto.password, // Le hachage doit se faire ici ou dans un Hook TypeORM!
    };
    this.userRepository.merge(user, userUpdateData);

    // --- Mise à jour des coordonnées bancaires (rib, banque) ---
    if (updateUserDto.rib || updateUserDto.banque) {
      let bancaire = user.coordonneesBancaires;

      if (!bancaire) {
        // Création si l'utilisateur n'en avait pas
        // bancaire = this.bancaireRepository.create({ user, n_cin: user.n_cin }); // CIN est requis par votre DTO d'enregistrement initial
        throw new BadRequestException(
          "Veuillez d'abord compléter vos coordonnées bancaires (y compris CIN) via le processus d'enregistrement initial.",
        );
      }

      // Appliquer les mises à jour bancaires
      bancaire.rib = updateUserDto.rib ?? bancaire.rib;
      bancaire.banque = updateUserDto.banque ?? bancaire.banque;

      try {
        await this.bancaireRepository.save(bancaire);
        user.coordonneesBancaires = bancaire;
      } catch (error) {
        if (error.code === '23505' && error.detail.includes('rib')) {
          throw new BadRequestException(
            'Ce RIB est déjà enregistré par un autre compte.',
          );
        }
        throw new BadRequestException(
          'Une erreur est survenue lors de la mise à jour des coordonnées bancaires.',
        );
      }
    }

    // Sauvegarder et retourner l'utilisateur mis à jour
    return await this.userRepository.save(user);
  }

  /**
   * Supprime un utilisateur et ses coordonnées bancaires associées.
   * @param id L'identifiant de l'utilisateur à supprimer.
   * @returns Promise<void>
   */
  async delete(id: number): Promise<void> {
    // 1. Trouver l'utilisateur, en chargeant la relation bancaire
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['coordonneesBancaires'], // 🚨 Charger l'entité liée
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    // 2. Suppression des coordonnées bancaires (si elles existent)
    if (user.coordonneesBancaires) {
      const bancaireId = user.coordonneesBancaires.id_bancaire;

      // Suppression explicite de la ligne dans la table coordonnees_bancaires
      await this.bancaireRepository.delete(bancaireId);
      // NOTE: Si vous utilisez l'entité Bancaire dans une transaction, utilisez .remove(user.coordonneesBancaires)
    }

    // 3. Suppression de l'utilisateur
    // Nous sommes certains qu'il existe grâce à l'étape 1
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      // Bien que nous ayons vérifié à l'étape 1, cela sert de vérification finale.
      throw new NotFoundException(
        `Erreur de suppression, utilisateur ${id} introuvable.`,
      );
    }
  }

  /**
   * Récupère la session actuelle pour le coordinateur spécifié.
   * La session courante est définie comme la session active (non terminée).
   * @param coordinateurId L'ID du coordinateur (issu du JWT).
   * @returns Promise<Session> La session trouvée ou une erreur.
   */
  async getCurrentSession(coordinateurId: number): Promise<Session> {
    // 🚨 NOTE: La logique de "courant" doit être implémentée dans SessionService

    // Pour l'instant, appelons une fonction qui trouve la session par coordinateur ID
    // Nous allons créer cette méthode findSessionByCoordinateur dans SessionService.
    const session =
      await this.sessionService.findSessionByCoordinateur(coordinateurId);

    if (!session) {
      throw new NotFoundException(
        `Aucune session active n'a été trouvée pour ce coordinateur.`,
      );
    }
    return session;
  }
}
