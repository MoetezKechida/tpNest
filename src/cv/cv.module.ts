import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { Cv } from './entities/cv.entity';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@Module({
  controllers: [CvController],
  providers: [CvService],
  imports: [TypeOrmModule.forFeature([Cv, User, Skill])],
  exports: [CvService] 
})
export class CvModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'cv', method: RequestMethod.POST },      
        { path: 'cv/:id', method: RequestMethod.PATCH }, 
        { path: 'cv/:id', method: RequestMethod.DELETE } 
      );
  }
}
