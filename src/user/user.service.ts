import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private static readonly allowedRoles = new Set(['user', 'admin']);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private sanitizeUser(user: User): Partial<User> {
    const safeUser: Partial<User> = { ...user };
    delete safeUser.password;
    return safeUser;
  }

  private async findOneEntity(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['cvs'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser?.username === createUserDto.username) {
      throw new ConflictException('Username already exists');
    }

    if (existingUser?.email === createUserDto.email) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: 'user',
    });

    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find({ relations: ['cvs'] });
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: number): Promise<Partial<User>> {
    const user = await this.findOneEntity(id);
    return this.sanitizeUser(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.findOneEntity(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const usernameTaken = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (usernameTaken) {
        throw new ConflictException('Username already exists');
      }
      user.username = updateUserDto.username;
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailTaken = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailTaken) {
        throw new ConflictException('Email already exists');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const savedUser = await this.userRepository.save(user);
    return this.sanitizeUser(savedUser);
  }

  async updateRole(id: number, role: string): Promise<Partial<User>> {
    const normalizedRole = role?.trim().toLowerCase();

    if (!normalizedRole) {
      throw new BadRequestException('Role is required');
    }

    if (!UserService.allowedRoles.has(normalizedRole)) {
      throw new BadRequestException('Role must be either user or admin');
    }

    const user = await this.findOneEntity(id);
    user.role = normalizedRole;

    const savedUser = await this.userRepository.save(user);
    return this.sanitizeUser(savedUser);
  }

  async remove(id: number): Promise<void> {
    await this.findOneEntity(id);
    await this.userRepository.delete(id);
  }
}
