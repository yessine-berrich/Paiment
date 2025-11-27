// src/session/session.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { Session } from './entities/session.entity';
import { UsersModule } from '../users/users.module';
// 🚨 IMPORTEZ LA NOUVELLE ENTITÉ DE JOINTURE
import { SessionFormateur } from '../session/entities/session-formateur.entity'; 

@Module({
  imports: [
    // 🚨 CORRECTION : AJOUT DE L'ENTITÉ SessionFormateur
    // Les deux repositories (Session et SessionFormateur) seront maintenant disponibles pour injection.
    TypeOrmModule.forFeature([Session, SessionFormateur]), 
    forwardRef(() => UsersModule)
],
  controllers: [SessionController],
  providers: [SessionService],
  // Exportez SessionService pour qu'il puisse être utilisé par d'autres modules (ex: UsersModule)
  exports: [SessionService], 
})
export class SessionModule {}