import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { Cv } from './entities/cv.entity';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [CvController],
  providers: [CvService, RolesGuard],
  imports: [TypeOrmModule.forFeature([Cv, User, Skill])],
  exports: [CvService],
})
export class CvModule {}
