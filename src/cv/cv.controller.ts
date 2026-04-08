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

@Controller('cv')
@UseGuards(AuthGuard('jwt'))
export class CvController {
  constructor(private readonly cvService: CvService) {}

  private getAuthenticatedUserId(req: AuthRequest): number {
    if (!req.user?.id) {
      throw new UnauthorizedException('Authenticated user not found in request');
    }
    return req.user.id;
  }

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: AuthRequest) {
    createCvDto.userId = this.getAuthenticatedUserId(req);
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.cvService.findByUser(this.getAuthenticatedUserId(req));
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number, @Req() req: AuthRequest) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    if (connectedUserId !== userId) {
      throw new ForbiddenException('You can only view your own CVs');
    }
    return this.cvService.findByUser(userId);
  }

  @Get('skill/:skillId')
  async findBySkill(@Param('skillId', ParseIntPipe) skillId: number, @Req() req: AuthRequest) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    const cvs = await this.cvService.findBySkill(skillId);
    return cvs.filter((cv) => cv.user?.id === connectedUserId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    const connectedUserId = this.getAuthenticatedUserId(req);
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== connectedUserId) {
      throw new ForbiddenException('You can only view your own CVs');
    }

    return cv;
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
