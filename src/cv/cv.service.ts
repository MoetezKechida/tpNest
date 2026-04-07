import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Cv } from './entities/cv.entity';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import { randFirstName, randLastName, randNumber, randJobTitle, randFilePath } from '@ngneat/falso';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const cv = this.cvRepository.create({
      name: createCvDto.name,
      firstname: createCvDto.firstname,
      age: createCvDto.age,
      cin: createCvDto.cin,
      job: createCvDto.job,
      path: createCvDto.path,
    });

    
    if (createCvDto.userId) {
      const user = await this.userRepository.findOne({ 
        where: { id: createCvDto.userId } 
      });
      if (!user) {
        throw new Error(`User with ID ${createCvDto.userId} not found`);
      }
      cv.user = user;
    }

    
    const savedCv = await this.cvRepository.save(cv);

    
    if (createCvDto.skillIds && createCvDto.skillIds.length > 0) {
      const skills = await this.skillRepository.findByIds(createCvDto.skillIds);
      if (skills.length !== createCvDto.skillIds.length) {
        throw new Error('Some skills not found');
      }
      savedCv.skills = skills;
      await this.cvRepository.save(savedCv);
    }

    return this.findOne(savedCv.id);
  }

  async findAll(): Promise<Cv[]> {
    return await this.cvRepository.find({ 
      relations: ['user', 'skills'] 
    });
  }

  async findOne(id: number): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user', 'skills']
    });

    if (!cv) {
      throw new Error(`CV with ID ${id} not found`);
    }

    return cv;
  }

  async update(id: number, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.findOne(id); 

    
    await this.cvRepository.update(id, {
      name: updateCvDto.name ?? cv.name,
      firstname: updateCvDto.firstname ?? cv.firstname,
      age: updateCvDto.age ?? cv.age,
      cin: updateCvDto.cin ?? cv.cin,
      job: updateCvDto.job ?? cv.job,
      path: updateCvDto.path ?? cv.path,
    });

    
    if (updateCvDto.userId !== undefined) {
      if (updateCvDto.userId === null) {
        cv.user = null;
      } else {
        const user = await this.userRepository.findOne({ 
          where: { id: updateCvDto.userId } 
        });
        if (!user) {
          throw new Error(`User with ID ${updateCvDto.userId} not found`);
        }
        cv.user = user;
      }
    }

    
    if (updateCvDto.skillIds !== undefined) {
      if (updateCvDto.skillIds.length === 0) {
        cv.skills = [];
      } else {
        const skills = await this.skillRepository.findByIds(updateCvDto.skillIds);
        if (skills.length !== updateCvDto.skillIds.length) {
          throw new Error('Some skills not found');
        }
        cv.skills = skills;
      }
    }

    await this.cvRepository.save(cv);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const cv = await this.findOne(id); 
    await this.cvRepository.remove(cv);
  }

  
  async findByUser(userId: number): Promise<Cv[]> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId } 
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return await this.cvRepository.find({ 
      where: { user: { id: userId } },
      relations: ['user', 'skills'] 
    });
  }

  async findBySkill(skillId: number): Promise<Cv[]> {
    const skill = await this.skillRepository.findOne({ 
      where: { id: skillId } 
    });
    if (!skill) {
      throw new Error(`Skill with ID ${skillId} not found`);
    }

    return await this.cvRepository.find({ 
      where: { skills: { id: skillId } },
      relations: ['user', 'skills'] 
    });
  }

  async addSkillToCv(cvId: number, skillId: number): Promise<Cv> {
    const cv = await this.findOne(cvId);
    const skill = await this.skillRepository.findOne({ 
      where: { id: skillId } 
    });
    
    if (!skill) {
      throw new Error(`Skill with ID ${skillId} not found`);
    }

    
    const hasSkill = cv.skills.some(s => s.id === skillId);
    if (hasSkill) {
      throw new Error('Skill already added to this CV');
    }

    cv.skills.push(skill);
    await this.cvRepository.save(cv);
    return this.findOne(cvId);
  }

  async removeSkillFromCv(cvId: number, skillId: number): Promise<Cv> {
    const cv = await this.findOne(cvId);
    
    cv.skills = cv.skills.filter(s => s.id !== skillId);
    await this.cvRepository.save(cv);
    return this.findOne(cvId);
  }

  
  async seedCvs(): Promise<Cv[]> {
    // Delete all existing CVs using query builder
    await this.cvRepository.createQueryBuilder().delete().execute();
    
    const users = await this.userRepository.find();
    const skills = await this.skillRepository.find();
    
    if (users.length === 0 || skills.length === 0) {
      throw new Error('Users and skills must be seeded first');
    }
    
    const cvs: Partial<Cv>[] = [];
    
    
    for (const user of users) {
      const numberOfCvs = randNumber({ min: 1, max: 3 });
      
      for (let i = 0; i < numberOfCvs; i++) {
        const firstname = randFirstName();
        const lastname = randLastName();
        const cin = randNumber({ min: 10000000, max: 99999999 }).toString();
        
        cvs.push({
          name: lastname,
          firstname: firstname,
          age: randNumber({ min: 18, max: 65 }),
          cin: cin,
          job: randJobTitle(),
          path: randFilePath(),
          user: user
        });
      }
    }
    
    
    const savedCvs = await this.cvRepository.save(cvs);
    
    
    for (const cv of savedCvs) {
      const numberOfSkills = randNumber({ min: 2, max: 6 });
      const randomSkills = skills
        .sort(() => 0.5 - Math.random())
        .slice(0, numberOfSkills);
      
      cv.skills = randomSkills;
      await this.cvRepository.save(cv);
    }
    
    console.log(`Created ${savedCvs.length} CVs with random skills`);
    
    return savedCvs;
  }
}
