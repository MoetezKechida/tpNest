import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillRepository.create(createSkillDto);
    return await this.skillRepository.save(skill);
  }

  async findAll(): Promise<Skill[]> {
    return await this.skillRepository.find({ relations: ['cvs'] });
  }

  async findOne(id: number): Promise<Skill> {
    return await this.skillRepository.findOne({
      where: { id },
      relations: ['cvs']
    });
  }

  async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    await this.skillRepository.update(id, updateSkillDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.skillRepository.delete(id);
  }

  // Seed method for standalone application
  async seedSkills(): Promise<Skill[]> {
    // Delete all existing skills using query builder
    await this.skillRepository.createQueryBuilder().delete().execute();
    
    const skillsData = [
      { designation: 'JavaScript' },
      { designation: 'TypeScript' },
      { designation: 'Python' },
      { designation: 'Java' },
      { designation: 'C#' },
      { designation: 'PHP' },
      { designation: 'React' },
      { designation: 'Angular' },
      { designation: 'Vue.js' },
      { designation: 'NestJS' },
      { designation: 'Express.js' },
      { designation: 'Spring Boot' },
      { designation: 'MySQL' },
      { designation: 'PostgreSQL' },
      { designation: 'MongoDB' },
      { designation: 'Redis' },
      { designation: 'Docker' },
      { designation: 'Git' },
      { designation: 'AWS' },
      { designation: 'Kubernetes' },
      { designation: 'Team Leadership' },
      { designation: 'Project Management' },
      { designation: 'Communication' },
      { designation: 'Problem Solving' }
    ];
    
    const savedSkills = await this.skillRepository.save(skillsData);
    console.log(`✅ Created ${savedSkills.length} skills`);
    
    return savedSkills;
  }
}
