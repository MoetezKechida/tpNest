import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { randEmail, randUserName, randPassword } from '@ngneat/falso';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['cvs'] });
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['cvs']
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // Seed method for standalone application
  async seedUsers(): Promise<User[]> {
    // Delete all existing users using query builder
    await this.userRepository.createQueryBuilder().delete().execute();
    
    const users: Partial<User>[] = [];
    
    for (let i = 0; i < 10; i++) {
      users.push({
        username: randUserName(),
        email: randEmail(),
        password: randPassword() // In real app, should be hashed
      });
    }
    
    const savedUsers = await this.userRepository.save(users);
    console.log(`✅ Created ${savedUsers.length} users`);
    
    return savedUsers;
  }
}
