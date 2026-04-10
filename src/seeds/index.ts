import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import { Cv } from '../cv/entities/cv.entity';
import {
  randEmail,
  randUserName,
  randPassword,
  randFirstName,
  randLastName,
  randNumber,
  randJobTitle,
  randFilePath,
} from '@ngneat/falso';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('Starting data seeding...');

    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const skillRepo = app.get<Repository<Skill>>(getRepositoryToken(Skill));
    const cvRepo = app.get<Repository<Cv>>(getRepositoryToken(Cv));

    await cvRepo.createQueryBuilder().delete().execute();
    await skillRepo.createQueryBuilder().delete().execute();
    await userRepo.createQueryBuilder().delete().execute();

    const adminPassword = 'Admin123!';
    const admin = await userRepo.save(
      userRepo.create({
        username: 'admin',
        email: 'admin@tpnest.local',
        password: await bcrypt.hash(adminPassword, 10),
        role: 'admin',
      }),
    );

    const skillsData = [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C#',
      'PHP',
      'React',
      'Angular',
      'Vue.js',
      'NestJS',
      'Express.js',
      'Spring Boot',
      'MySQL',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'Docker',
      'Git',
      'AWS',
      'Kubernetes',
      'Team Leadership',
      'Project Management',
      'Communication',
      'Problem Solving',
    ].map((designation) => ({ designation }));

    const savedSkills = await skillRepo.save(skillsData);
    console.log('Created  skills');

    const usersData: Partial<User>[] = await Promise.all(
      Array.from({ length: 10 }, async () => ({
        username: randUserName(),
        email: randEmail(),
        password: await bcrypt.hash(randPassword(), 10),
        role: 'user',
      })),
    );
    const savedUsers = await userRepo.save(usersData);
    console.log('Created  users');

    const cvsData: Partial<Cv>[] = [];
    for (const user of [admin, ...savedUsers]) {
      const count = randNumber({ min: 1, max: 3 });
      for (let i = 0; i < count; i++) {
        cvsData.push({
          name: randLastName(),
          firstname: randFirstName(),
          age: randNumber({ min: 18, max: 65 }),
          cin: randNumber({ min: 10000000, max: 99999999 }).toString(),
          job: randJobTitle(),
          path: randFilePath(),
          user,
        });
      }
    }
    const savedCvs = await cvRepo.save(cvsData);

    for (const cv of savedCvs) {
      const count = randNumber({ min: 2, max: 6 });
      cv.skills = [...savedSkills]
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
      await cvRepo.save(cv);
    }

    console.log('Summary: users, skills, CVs');
    console.log('Bootstrap admin credentials:');
    console.log(`username=admin password=${adminPassword}`);
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
