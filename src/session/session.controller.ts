import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard'; // 🚨 Si vous voulez protéger les routes
import { Roles } from 'src/users/decorators/user-role.decorator';
import { userRole } from 'utils/constants';

@Controller('api/sessions')
@UseGuards(AuthRolesGuard) // Appliquer le guard ici pour sécuriser toutes les routes
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @Roles(userRole.COMPTABLE) // Rôle requis pour la création
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  // @Get()
  // @Roles(userRole.COMPTABLE) // Rôles autorisés à voir
  // findAll() {
  //   return this.sessionService.findAll();
  // }

  // @Get(':id')
  // @Roles(userRole.COMPTABLE)
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.sessionService.findOne(id);
  // }

  // @Patch(':id')
  // @Roles(userRole.COMPTABLE)
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateSessionDto: UpdateSessionDto,
  // ) {
  //   return this.sessionService.update(id, updateSessionDto);
  // }

  // @Delete(':id')
  // @Roles(userRole.COMPTABLE)
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.sessionService.remove(id);
  // }
}
