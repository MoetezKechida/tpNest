import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@Module({
  controllers: [UserController],
  providers: [UserService, RolesGuard],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserService] // Export to use in seeds
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'user/:id/role', method: RequestMethod.PATCH });
  }
}
