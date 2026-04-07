import { DataSource } from 'typeorm';
import { Skill } from '../skill/entities/skill.entity';

export async function seedSkills(dataSource: DataSource): Promise<Skill[]> {
  const skillRepository = dataSource.getRepository(Skill);
  
  // Clear existing skills
  await skillRepository.clear();
  
  const skillsData = [
    // Programming Languages
    { designation: 'JavaScript' },
    { designation: 'TypeScript' },
    { designation: 'Python' },
    { designation: 'Java' },
    { designation: 'C#' },
    { designation: 'PHP' },
    
    // Frameworks & Libraries
    { designation: 'React' },
    { designation: 'Angular' },
    { designation: 'Vue.js' },
    { designation: 'NestJS' },
    { designation: 'Express.js' },
    { designation: 'Spring Boot' },
    
    // Databases
    { designation: 'MySQL' },
    { designation: 'PostgreSQL' },
    { designation: 'MongoDB' },
    { designation: 'Redis' },
    
    // Tools & Technologies
    { designation: 'Docker' },
    { designation: 'Git' },
    { designation: 'AWS' },
    { designation: 'Kubernetes' },
    
    // Soft Skills
    { designation: 'Team Leadership' },
    { designation: 'Project Management' },
    { designation: 'Communication' },
    { designation: 'Problem Solving' }
  ];
  
  const savedSkills = await skillRepository.save(skillsData);
  console.log(`Created ${savedSkills.length} skills`);
  
  return savedSkills;
}