// src/session/session.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
// 🚨 NOUVEAU: Import du DTO pour l'affectation
import { AffecterFormateursDto } from './dto/affecter-formateurs.dto';

// 🚨 Adaptez les chemins d'accès si nécessaire
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { userRole } from 'utils/constants';

@Controller('api/sessions')
@UseGuards(AuthRolesGuard) // Appliquer le guard ici pour sécuriser toutes les routes
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }

  // -----------------------------------------------------------
  // CRUD STANDARD
  // -----------------------------------------------------------

  @Post()
  // 💡 Le coordinateur est souvent le créateur de session, ajustez si nécessaire
  @Roles(userRole.COMPTABLE, userRole.COORDINATEUR, userRole.ADMIN)
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  @Roles(userRole.COMPTABLE, userRole.COORDINATEUR, userRole.ADMIN)
  findAll() {
    return this.sessionService.findAll();
  }

  @Get(':id')
  @Roles(userRole.COMPTABLE, userRole.COORDINATEUR, userRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  @Roles(userRole.COMPTABLE, userRole.COORDINATEUR, userRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @Roles(userRole.COMPTABLE, userRole.ADMIN) // La suppression est souvent limitée aux admins/comptables
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sessionService.remove(id);
  }

  // -----------------------------------------------------------
  // NOUVELLE ROUTE D'AFFECTATION
  // -----------------------------------------------------------

  /**
   * Route POST pour affecter un ou plusieurs formateurs à une session.
   * POST /api/sessions/:id/affecter-formateurs
   */
  @Post(':id/affecter-formateurs')
  // Seuls les Coordinateurs et les Admins devraient pouvoir faire des affectations
  @Roles(userRole.COMPTABLE, )
  affecterFormateurs(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() affecterFormateursDto: AffecterFormateursDto,
  ) {
    return this.sessionService.affecterFormateurs(
      sessionId,
      affecterFormateursDto.formateurIds,
    );
  }
}