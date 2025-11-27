// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/users.entity';
import { CoordonneesBancaires } from './users/entities/coordonnees-bancaires.entity';
import { SessionModule } from './session/session.module';
import { Session } from './session/entities/session.entity';
// 🚨 IMPORTEZ LA NOUVELLE ENTITÉ DE JOINTURE
import { SessionFormateur } from './session/entities/session-formateur.entity'; // Assurez-vous que le chemin est correct

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true, // pour qu’il soit accessible partout
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        User,
        CoordonneesBancaires,
        Session,
        // 🚨 AJOUT DE LA NOUVELLE ENTITÉ ICI
        SessionFormateur,
        // ... autres entités
      ],
      // autoLoadEntities: true, // Si vous utilisez autoLoadEntities, vous n'avez pas besoin de la liste complète 'entities',
      // mais il est plus sûr de la lister explicitement si vous n'êtes pas certain de la configuration de votre projet.
      synchronize: true,
    }),
    SessionModule,
  ],
})
export class AppModule {}