import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Put,
  Delete,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentPayload } from './decorators/current-payload.decorator';
import type { JwtPayloadType } from 'utils/types';
import { Roles } from './decorators/user-role.decorator';
import { userRole } from 'utils/constants';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { UpdateUserStatusDto } from './dto/update-status.dto';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly authService: UsersService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/auth/register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/auth/login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('/current-user')
  // Si vous utilisez AuthRolesGuard sans rôle, assurez-vous qu'il gère les rôles vides correctement
  @Roles(
    userRole.ADMIN,
    userRole.COMPTABLE,
    userRole.FORMATEUR,
    userRole.COORDINATEUR,
  )
  @UseGuards(AuthGuard) // Utilisez le AuthGuard standard de Passport pour l'authentification simple
  getCurrentUser(@CurrentPayload() payload: JwtPayloadType) {
    // 🚨 Utilisation du nouveau décorateur
    // Le service est appelé pour récupérer l'entité complète à partir de l'ID
    return this.authService.getCurrentUser(payload.sub);
  }

  @Put('status')
  @Roles(userRole.ADMIN)
  @UseGuards(AuthRolesGuard)
  async updateStatus(@Body() updateUserStatusDto: UpdateUserStatusDto) {
    return this.authService.updateStatus(updateUserStatusDto);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(userRole.ADMIN, userRole.COMPTABLE)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  /**
   * Récupère un utilisateur par ID.
   * Protection: Seuls ADMIN et COMPTABLE sont autorisés.
   */
  @Get(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(userRole.ADMIN, userRole.COMPTABLE)
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.authService.getUserById(id);
  }

  /**
   * Met à jour le COMPTE DE L'UTILISATEUR CONNECTÉ (champs limités).
   */
  @Put('me')
  @UseGuards(AuthRolesGuard)
  @Roles(
    userRole.ADMIN,
    userRole.COMPTABLE,
    userRole.FORMATEUR,
    userRole.COORDINATEUR,
  )
  // Si AuthRolesGuard est utilisé pour l'auth, pas besoin de @Roles()
  async updateCurrentUser(
    @CurrentPayload() payload: JwtPayloadType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateCurrentUser(payload.sub, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(userRole.ADMIN)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.delete(id);
  }

  @Get('current-session')
  @UseGuards(AuthRolesGuard)
  @Roles(userRole.COORDINATEUR) // 🚨 Rôle de sécurité
  async getCurrentSession(@CurrentPayload() payload: JwtPayloadType) {
    // L'ID est extrait du token
    return this.usersService.getCurrentSession(payload.sub);
  }
}
