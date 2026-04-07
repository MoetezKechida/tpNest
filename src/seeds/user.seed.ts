import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { randEmail, randUserName, randPassword } from '@ngneat/falso';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
  const userRepository = dataSource.getRepository(User);
  
  // Clear existing users
  await userRepository.clear();
  
  const users: Partial<User>[] = [];
  
  // Generate 10 fake users
  for (let i = 0; i < 10; i++) {
    users.push({
      username: randUserName(),
      email: randEmail(),
      password: randPassword() // In real app, should be hashed
    });
  }
  
  const savedUsers = await userRepository.save(users);
  console.log(`Created ${savedUsers.length} users`);
  
  return savedUsers;
}