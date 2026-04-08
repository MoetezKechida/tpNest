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
  UseGuards,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../middlewares/auth.middleware';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  private isAdmin(req: AuthRequest): boolean {
    return req.userRole?.trim().toLowerCase() === 'admin';
  }

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: AuthRequest) {
    createCvDto.userId = req.userId;
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
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
    return this.cvService.findByUser(userId);
  }

  @Get('skill/:skillId')
  @Roles('admin')
  @UseGuards(RolesGuard)
  findBySkill(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.cvService.findBySkill(skillId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    const cv = await this.cvService.findOne(id);

    if (this.isAdmin(req) || cv.user?.id === req.userId) {
      return cv;
    }

    throw new ForbiddenException('You can only view your own CVs');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: AuthRequest,
  ) {
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== req.userId) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== req.userId) {
      throw new ForbiddenException('You can only delete your own CVs');
    }

    return this.cvService.remove(id);
  }

  @Post(':id/skills/:skillId')
  addSkillToCv(
    @Param('id', ParseIntPipe) cvId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    return this.cvService.addSkillToCv(cvId, skillId);
  }

  @Delete(':id/skills/:skillId')
  removeSkillFromCv(
    @Param('id', ParseIntPipe) cvId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    return this.cvService.removeSkillFromCv(cvId, skillId);
  }
}
