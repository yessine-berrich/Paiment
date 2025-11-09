import { BadRequestException, Injectable, RequestTimeoutException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { AccessTokenType, JwtPayloadType } from "utils/types";
import { LoginDto } from "./dto/login.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/users.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "node:crypto"
import { ConfigService } from "@nestjs/config";


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { username, email, password } = registerDto;

        // Vérifier si username ou email existe déjà
        const existingUser = await this.userRepository.findOne({
            where: [{ email }],
        });

        if (existingUser) {
            throw new BadRequestException('Nom d’utilisateur ou e-mail déjà utilisé');
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(user);

        // Génération du token JWT
        const payload = { sub: savedUser.id, username: savedUser.username, email: savedUser.email };
        const token = this.jwtService.sign(payload);

        // Supprimer le mot de passe avant de renvoyer
        const { password: _pwd, ...userWithoutPassword } = savedUser;

        return {
            token, // 🔥 renvoyer le token directement
        };
    }



    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Recherche de l'utilisateur par email
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return { success: false, message: 'Email ou mot de passe incorrect' };
        }

        // Vérification du mot de passe
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { success: false, message: 'Email ou mot de passe incorrect' };
        }

        // Génération du token JWT
        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        // Supprimer le mot de passe avant de renvoyer l'utilisateur
        const { password: _pwd, ...userWithoutPassword } = user;

        return {
            token,
        };
    }


    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    private generateJWT(payload: JwtPayloadType): Promise<string> {
        return this.jwtService.signAsync(payload);
    }

}