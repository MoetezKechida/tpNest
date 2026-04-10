import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, RolesGuard],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserService], // Export to use in seeds
})
export class UserModule {}
