import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { Cv } from './entities/cv.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';


@Module({
  controllers: [CvController],
  providers: [CvService],
  imports: [TypeOrmModule.forFeature([Cv])]
})
export class CvModule {}
