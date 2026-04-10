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
        where: { id: createCvDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createCvDto.userId} not found`,
        );
      }
      cv.user = user;
    }

    const savedCv = await this.cvRepository.save(cv);

    if (createCvDto.skillIds && createCvDto.skillIds.length > 0) {
      const skills = await this.skillRepository.findBy({
        id: In(createCvDto.skillIds),
      });
      if (skills.length !== createCvDto.skillIds.length) {
        throw new NotFoundException('One or more skills not found');
      }
      savedCv.skills = skills;
      await this.cvRepository.save(savedCv);
    }

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
        const skills = await this.skillRepository.findBy({
          id: In(updateCvDto.skillIds),
        });
        if (skills.length !== updateCvDto.skillIds.length) {
          throw new NotFoundException('One or more skills not found');
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
    cv.skills = cv.skills.filter((s) => s.id !== skillId);
    await this.cvRepository.save(cv);
    return this.findOne(cvId);
  }
}
