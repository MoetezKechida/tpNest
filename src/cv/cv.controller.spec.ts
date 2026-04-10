import { Test, TestingModule } from '@nestjs/testing';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';

describe('CvController', () => {
  let controller: CvController;

  const mockCvService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findBySkill: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addSkillToCv: jest.fn(),
    removeSkillFromCv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvController],
      providers: [{ provide: CvService, useValue: mockCvService }],
    }).compile();

    controller = module.get<CvController>(CvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
