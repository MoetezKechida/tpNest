import { DataSource } from 'typeorm';
import { Cv } from '../cv/entities/cv.entity';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import { randFirstName, randLastName, randNumber, randJobTitle, randFilePath } from '@ngneat/falso';

export async function seedCvs(dataSource: DataSource, users: User[], skills: Skill[]): Promise<Cv[]> {
  const cvRepository = dataSource.getRepository(Cv);
  
  // Clear existing CVs
  await cvRepository.clear();
  
  const cvs: Partial<Cv>[] = [];
  
  // Generate 2-3 CVs per user
  for (const user of users) {
    const numberOfCvs = randNumber({ min: 1, max: 3 });
    
    for (let i = 0; i < numberOfCvs; i++) {
      const firstname = randFirstName();
      const lastname = randLastName();
      
      // Generate random CIN (8 digits)
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
  
  // Save CVs first
  const savedCvs = await cvRepository.save(cvs);
  
  // Assign random skills to each CV
  for (const cv of savedCvs) {
    const numberOfSkills = randNumber({ min: 2, max: 6 });
    const randomSkills = skills
      .sort(() => 0.5 - Math.random()) // Shuffle skills
      .slice(0, numberOfSkills); // Take random number of skills
    
    cv.skills = randomSkills;
    await cvRepository.save(cv);
  }
  
  console.log(`Created ${savedCvs.length} CVs with random skills`);
  
  return savedCvs;
}