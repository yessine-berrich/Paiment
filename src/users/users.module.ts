import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.provider';
import { CoordonneesBancaires } from './entities/coordonnees-bancaires.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    // 🚨 CORRECTION : AJOUTER CoordonneesBancaires
    TypeOrmModule.forFeature([User, CoordonneesBancaires]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Assurez-vous que ConfigModule est accessible
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // 👈 Le secret est lu ici
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UsersService, AuthService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
