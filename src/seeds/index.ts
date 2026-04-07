import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { SkillService } from '../skill/skill.service';
import { CvService } from '../cv/cv.service';

async function bootstrap() {
  // Create NestJS Standalone application
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    console.log('NestJS application context created');
    console.log('Starting data seeding...');

    // Get services from NestJS container
    const userService = app.get(UserService);
    const skillService = app.get(SkillService);
    const cvService = app.get(CvService);

    // Create new data in correct order (Skills and Users first, then CVs)
    const skills = await skillService.seedSkills();
    const users = await userService.seedUsers();
    const cvs = await cvService.seedCvs();

    console.log('Seeding completed successfully!');
    console.log(`Summary: ${users.length} users, ${skills.length} skills, ${cvs.length} CVs`);

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
    console.log('Application context closed');
  }
}

bootstrap();