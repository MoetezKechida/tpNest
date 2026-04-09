import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  ForbiddenException,
<<<<<<< HEAD
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}
=======
  UseGuards,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../middlewares/auth.middleware';
>>>>>>> e724707d7a2add9af31c06481debb6d4e35225e2

@Controller('cv')
@UseGuards(AuthGuard('jwt'))
export class CvController {
  constructor(private readonly cvService: CvService) {}

<<<<<<< HEAD
  private getAuthenticatedUserId(req: AuthRequest): number {
    if (!req.user?.id) {
      throw new UnauthorizedException('Authenticated user not found in request');
    }
    return req.user.id;
=======
  private isAdmin(req: AuthRequest): boolean {
    return req.userRole?.trim().toLowerCase() === 'admin';
>>>>>>> e724707d7a2add9af31c06481debb6d4e35225e2
  }

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: AuthRequest) {
    createCvDto.userId = this.getAuthenticatedUserId(req);
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
<<<<<<< HEAD
    return this.cvService.findByUser(this.getAuthenticatedUserId(req));
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number, @Req() req: AuthRequest) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    if (connectedUserId !== userId) {
      throw new ForbiddenException('You can only view your own CVs');
    }
=======
    if (!req.userId) {
      throw new ForbiddenException('Authenticated user required');
    }

    if (!this.isAdmin(req)) {
      return this.cvService.findByUser(req.userId);
    }

    return this.cvService.findAll();
  }

  @Get('user/:userId')
  @Roles('admin')
  @UseGuards(RolesGuard)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
>>>>>>> e724707d7a2add9af31c06481debb6d4e35225e2
    return this.cvService.findByUser(userId);
  }

  @Get('skill/:skillId')
<<<<<<< HEAD
  async findBySkill(@Param('skillId', ParseIntPipe) skillId: number, @Req() req: AuthRequest) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    const cvs = await this.cvService.findBySkill(skillId);
    return cvs.filter((cv) => cv.user?.id === connectedUserId);
=======
  @Roles('admin')
  @UseGuards(RolesGuard)
  findBySkill(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.cvService.findBySkill(skillId);
>>>>>>> e724707d7a2add9af31c06481debb6d4e35225e2
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
<<<<<<< HEAD
    const connectedUserId = this.getAuthenticatedUserId(req);
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== connectedUserId) {
      throw new ForbiddenException('You can only view your own CVs');
    }

    return cv;
=======
    const cv = await this.cvService.findOne(id);

    if (this.isAdmin(req) || cv.user?.id === req.userId) {
      return cv;
    }

    throw new ForbiddenException('You can only view your own CVs');
>>>>>>> e724707d7a2add9af31c06481debb6d4e35225e2
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: AuthRequest,
  ) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== connectedUserId) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    // Prevent ownership transfer through update payload.
    delete updateCvDto.userId;

    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== connectedUserId) {
      throw new ForbiddenException('You can only delete your own CVs');
    }

    return this.cvService.remove(id);
  }

  @Post(':id/skills/:skillId')
  async addSkillToCv(
    @Param('id', ParseIntPipe) cvId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Req() req: AuthRequest,
  ) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    const cv = await this.cvService.findOne(cvId);

    if (cv.user?.id !== connectedUserId) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    return this.cvService.addSkillToCv(cvId, skillId);
  }

  @Delete(':id/skills/:skillId')
  async removeSkillFromCv(
    @Param('id', ParseIntPipe) cvId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Req() req: AuthRequest,
  ) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    const cv = await this.cvService.findOne(cvId);

    if (cv.user?.id !== connectedUserId) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    return this.cvService.removeSkillFromCv(cvId, skillId);
  }
}
