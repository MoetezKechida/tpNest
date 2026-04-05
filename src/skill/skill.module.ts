import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { Skill } from './entities/skill.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  controllers: [SkillController],
  providers: [SkillService],
  imports: [TypeOrmModule.forFeature([Skill])]
})
export class SkillModule {}
