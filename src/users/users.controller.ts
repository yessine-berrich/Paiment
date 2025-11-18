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
import { CurrentUser } from './decorators/current-user.decarator';
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
  @UseGuards(AuthGuard)
  // @UseInterceptors(ClassSerializerInterceptor)
  getCurrentUser(@CurrentUser() payload: JwtPayloadType) {
    // console.log('Get current user route handler called');
    return this.authService.getCurrentUser(payload.id);
  }

  @Put('status') // Utilisation de PUT pour la mise à jour
  @UseGuards(AuthRolesGuard) // 🚨 Assurez-vous d'avoir JwtAuthGuard
  @Roles(userRole.ADMIN)
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
    userRole.CORDINATEUR,
  )
  // Si AuthRolesGuard est utilisé pour l'auth, pas besoin de @Roles()
  async updateCurrentUser(
    @CurrentUser() payload: JwtPayloadType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateCurrentUser(payload.id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(userRole.ADMIN)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.delete(id);
  }
}
