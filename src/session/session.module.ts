import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { Session } from './entities/session.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), forwardRef(() => UsersModule)],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService], // Exporter le service et le repository si besoin.
})
export class SessionModule {}
