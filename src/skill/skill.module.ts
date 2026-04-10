import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { Skill } from './entities/skill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [SkillController],
  providers: [SkillService, RolesGuard],
  imports: [TypeOrmModule.forFeature([Skill])],
  exports: [SkillService], // Export to use in seeds
})
export class SkillModule {}
