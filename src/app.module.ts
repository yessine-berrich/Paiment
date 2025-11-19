import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/users.entity';
import { CoordonneesBancaires } from './users/entities/coordonnees-bancaires.entity';
import { SessionModule } from './session/session.module';
import { Session } from './session/entities/session.entity';

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
        // ... SessionFormation, HeuresFormation, PaiementCoordination, MemoireReglement
      ],
      autoLoadEntities: true,
      synchronize: true,
    }),
    SessionModule,
  ],
})
export class AppModule {}
