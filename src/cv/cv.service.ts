import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Cv } from './entities/cv.entity';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const savedCv = await this.cvRepository.manager.transaction(
      async (manager) => {
        const cvRepo = manager.getRepository(Cv);
        const userRepo = manager.getRepository(User);
        const skillRepo = manager.getRepository(Skill);

        const cv = cvRepo.create({
          name: createCvDto.name,
          firstname: createCvDto.firstname,
          age: createCvDto.age,
          cin: createCvDto.cin,
          job: createCvDto.job,
          path: createCvDto.path,
        });

        if (createCvDto.userId) {
          const user = await userRepo.findOne({
            where: { id: createCvDto.userId },
          });
          if (!user) {
            throw new NotFoundException(
              `User with ID ${createCvDto.userId} not found`,
            );
          }
          cv.user = user;
        }

        if (createCvDto.skillIds && createCvDto.skillIds.length > 0) {
          const uniqueSkillIds = [...new Set(createCvDto.skillIds)];
          const skills = await skillRepo.findBy({ id: In(uniqueSkillIds) });

          if (skills.length !== uniqueSkillIds.length) {
            throw new NotFoundException('One or more skills not found');
          }

          cv.skills = skills;
        }

        return cvRepo.save(cv);
      },
    );

    return this.findOne(savedCv.id);
  }

  async findAll(): Promise<Cv[]> {
    return this.cvRepository.find({ relations: ['user', 'skills'] });
  }

  async findOne(id: number): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user', 'skills'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    return cv;
  }

  async update(id: number, updateCvDto: UpdateCvDto): Promise<Cv> {
    await this.cvRepository.manager.transaction(async (manager) => {
      const cvRepo = manager.getRepository(Cv);
      const userRepo = manager.getRepository(User);
      const skillRepo = manager.getRepository(Skill);

      const cv = await cvRepo.findOne({
        where: { id },
        relations: ['user', 'skills'],
      });

      if (!cv) {
        throw new NotFoundException(`CV with ID ${id} not found`);
      }

      cv.name = updateCvDto.name ?? cv.name;
      cv.firstname = updateCvDto.firstname ?? cv.firstname;
      cv.age = updateCvDto.age ?? cv.age;
      cv.cin = updateCvDto.cin ?? cv.cin;
      cv.job = updateCvDto.job ?? cv.job;
      cv.path = updateCvDto.path ?? cv.path;

      if (updateCvDto.userId !== undefined) {
        if (updateCvDto.userId === null) {
          cv.user = null;
        } else {
          const user = await userRepo.findOne({
            where: { id: updateCvDto.userId },
          });
          if (!user) {
            throw new NotFoundException(
              `User with ID ${updateCvDto.userId} not found`,
            );
          }
          cv.user = user;
        }
      }

      if (updateCvDto.skillIds !== undefined) {
        if (updateCvDto.skillIds.length === 0) {
          cv.skills = [];
        } else {
          const uniqueSkillIds = [...new Set(updateCvDto.skillIds)];
          const skills = await skillRepo.findBy({ id: In(uniqueSkillIds) });
          if (skills.length !== uniqueSkillIds.length) {
            throw new NotFoundException('One or more skills not found');
          }
          cv.skills = skills;
        }
      }

      await cvRepo.save(cv);
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const cv = await this.findOne(id);
    await this.cvRepository.remove(cv);
  }

  async findByUser(userId: number): Promise<Cv[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.cvRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'skills'],
    });
  }

  async findBySkill(skillId: number): Promise<Cv[]> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
    });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }

    return this.cvRepository.find({
      where: { skills: { id: skillId } },
      relations: ['user', 'skills'],
    });
  }

  async addSkillToCv(cvId: number, skillId: number): Promise<Cv> {
    const cv = await this.findOne(cvId);
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }

    const alreadyAdded = cv.skills.some((s) => s.id === skillId);
    if (alreadyAdded) {
      throw new ConflictException('Skill already added to this CV');
    }

    cv.skills.push(skill);
    await this.cvRepository.save(cv);
    return this.findOne(cvId);
  }

  async removeSkillFromCv(cvId: number, skillId: number): Promise<Cv> {
    const cv = await this.findOne(cvId);

    const exists = cv.skills.some((skill) => skill.id === skillId);
    if (!exists) {
      throw new NotFoundException('Skill is not associated with this CV');
    }

    cv.skills = cv.skills.filter((s) => s.id !== skillId);
    await this.cvRepository.save(cv);
    return this.findOne(cvId);
  }
}
