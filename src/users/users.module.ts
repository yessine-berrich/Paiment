import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'TA_CLE_SECRETE', // change la clé
      signOptions: { expiresIn: '1h' }, // durée du token
    }),
  ],
  providers: [UsersService,AuthService],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UsersModule {}
