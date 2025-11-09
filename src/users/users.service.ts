import { userRole } from 'utils/constants';
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/users.entity";
import { Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtPayloadType  } from 'utils/types';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from './auth.provider';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthService, // ajout
  ) {}
async register(registerDto: RegisterDto) {
        return this.authProvider.register(registerDto);
    }


    async login(loginDto: LoginDto) {
        return this.authProvider.login(loginDto);
    }

    async getCurrentUser(id: number): Promise<User> {

        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async update(updateUserDto: UpdateUserDto): Promise<User> {
        const { userId, username, password, role } = updateUserDto;
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.username = username || user.username;
        if (password) {
            user.password = await this.authProvider.hashPassword(password);
        }
        user.role = (role as userRole);

        return this.userRepository.save(user);
    }

    async delete(id: number, payload: JwtPayloadType) {
        const user = await this.getCurrentUser(id);
        if (user.id === payload?.id || payload.userRole === userRole.ADMIN) {
            await this.userRepository.remove(user);
            return { messag: 'User deleted successfully' };
        }
        throw new ForbiddenException('You are not allowed to delete this user');

    }
  
}
