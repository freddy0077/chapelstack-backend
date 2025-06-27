import { Test, TestingModule } from '@nestjs/testing';
import { FormsService } from './forms.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormInput } from '../dto/create-form.input';
import { UpdateFormInput } from '../dto/update-form.input';
import { FormStatus } from '../entities/form.entity';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Mock Prisma Error class for testing
class MockPrismaError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

describe('FormsService', () => {
  let service: FormsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    form: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    formField: {
      findMany: jest.fn(),
    },
    formSubmission: {
      findMany: jest.fn(),
    },
  };

  const mockForm = {
    id: 'test-form-id',
    title: 'Test Form',
    description: 'Test Description',
    status: 'DRAFT' as FormStatus,
    slug: 'test-form',
    isPublic: true,
    branchId: 'branch-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    notifyEmails: ['test@example.com'],
    submissionCount: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FormsService>(FormsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a form', async () => {
      const createFormInput: CreateFormInput = {
        title: 'New Form',
        description: 'Form Description',
        branchId: 'branch-id',
      };

      mockPrismaService.form.create.mockResolvedValue({
        ...mockForm,
        title: createFormInput.title,
        description: createFormInput.description,
      });

      const result = await service.create(createFormInput);

      expect(mockPrismaService.form.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createFormInput.title,
          description: createFormInput.description,
          branchId: createFormInput.branchId,
        }),
      });
      expect(result.title).toBe(createFormInput.title);
    });

    it('should generate a slug if not provided', async () => {
      const createFormInput: CreateFormInput = {
        title: 'New Form',
        branchId: 'branch-id',
      };

      mockPrismaService.form.create.mockResolvedValue({
        ...mockForm,
        title: createFormInput.title,
        slug: 'new-form',
      });

      await service.create(createFormInput);

      expect(mockPrismaService.form.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createFormInput.title,
          slug: 'new-form',
        }),
      });
    });

    it('should throw an error if form with slug already exists', async () => {
      const createFormInput: CreateFormInput = {
        title: 'New Form',
        slug: 'existing-slug',
        branchId: 'branch-id',
      };

      // Create a mock that will pass the instanceof check
      class MockPrismaError extends Error {
        code: string;
        constructor(message: string, code: string) {
          super(message);
          this.code = code;
        }
      }

      // Mock the Prisma namespace to make instanceof checks work
      (Prisma as any).PrismaClientKnownRequestError = MockPrismaError;

      const prismaError = new MockPrismaError(
        'Unique constraint failed',
        'P2002',
      );
      mockPrismaService.form.create.mockRejectedValue(prismaError);

      await expect(service.create(createFormInput)).rejects.toThrow(
        `A form with slug "${createFormInput.slug}" already exists.`,
      );
    });
  });

  describe('findAll', () => {
    it('should return all forms when no filter is provided', async () => {
      mockPrismaService.form.findMany.mockResolvedValue([mockForm]);

      const result = await service.findAll();

      expect(mockPrismaService.form.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockForm]);
    });

    it('should filter forms by search term', async () => {
      const filter = { search: 'test' };
      mockPrismaService.form.findMany.mockResolvedValue([mockForm]);

      const result = await service.findAll(filter);

      expect(mockPrismaService.form.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockForm]);
    });

    it('should filter forms by status', async () => {
      const filter = { status: FormStatus.PUBLISHED };
      mockPrismaService.form.findMany.mockResolvedValue([mockForm]);

      const result = await service.findAll(filter);

      expect(mockPrismaService.form.findMany).toHaveBeenCalledWith({
        where: { status: filter.status },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockForm]);
    });

    it('should filter forms by branchId', async () => {
      const filter = { branchId: 'branch-id' };
      mockPrismaService.form.findMany.mockResolvedValue([mockForm]);

      const result = await service.findAll(filter);

      expect(mockPrismaService.form.findMany).toHaveBeenCalledWith({
        where: { branchId: filter.branchId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockForm]);
    });
  });

  describe('findOne', () => {
    it('should return a form by id', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);

      const result = await service.findOne(mockForm.id);

      expect(mockPrismaService.form.findUnique).toHaveBeenCalledWith({
        where: { id: mockForm.id },
      });
      expect(result).toEqual(mockForm);
    });

    it('should throw NotFoundException if form not found', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a form by slug', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);

      const result = await service.findBySlug(mockForm.slug);

      expect(mockPrismaService.form.findUnique).toHaveBeenCalledWith({
        where: { slug: mockForm.slug },
      });
      expect(result).toEqual(mockForm);
    });

    it('should throw NotFoundException if form not found by slug', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a form', async () => {
      const updateFormInput: UpdateFormInput = {
        id: mockForm.id,
        title: 'Updated Form Title',
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.form.update.mockResolvedValue({
        ...mockForm,
        title: updateFormInput.title,
      });

      const result = await service.update(mockForm.id, updateFormInput);

      expect(mockPrismaService.form.update).toHaveBeenCalledWith({
        where: { id: mockForm.id },
        data: updateFormInput,
      });
      expect(result.title).toBe(updateFormInput.title);
    });

    it('should throw NotFoundException if form to update not found', async () => {
      const updateFormInput: UpdateFormInput = {
        id: 'non-existent-id',
        title: 'Updated Form Title',
      };

      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateFormInput),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if updated slug already exists', async () => {
      const updateFormInput: UpdateFormInput = {
        id: mockForm.id,
        slug: 'existing-slug',
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);

      // Set up Prisma namespace for instanceof check
      (Prisma as any).PrismaClientKnownRequestError = MockPrismaError;

      // Create a Prisma error for unique constraint violation
      const prismaError = new MockPrismaError(
        'Unique constraint failed',
        'P2002',
      );
      mockPrismaService.form.update.mockRejectedValue(prismaError);

      await expect(
        service.update(mockForm.id, updateFormInput),
      ).rejects.toThrow(
        `A form with slug "${updateFormInput.slug}" already exists.`,
      );
    });
  });

  describe('remove', () => {
    it('should delete a form', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.form.delete.mockResolvedValue(mockForm);

      const result = await service.remove(mockForm.id);

      expect(mockPrismaService.form.delete).toHaveBeenCalledWith({
        where: { id: mockForm.id },
      });
      expect(result).toEqual(mockForm);
    });

    it('should throw NotFoundException if form to delete not found', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFormFields', () => {
    it('should return fields for a form', async () => {
      const mockFields = [
        { id: 'field-1', formId: mockForm.id, label: 'Field 1' },
        { id: 'field-2', formId: mockForm.id, label: 'Field 2' },
      ];

      mockPrismaService.formField.findMany.mockResolvedValue(mockFields);

      const result = await service.getFormFields(mockForm.id);

      expect(mockPrismaService.formField.findMany).toHaveBeenCalledWith({
        where: { formId: mockForm.id },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockFields);
    });
  });

  describe('getFormSubmissions', () => {
    it('should return submissions for a form', async () => {
      const mockSubmissions = [
        { id: 'submission-1', formId: mockForm.id },
        { id: 'submission-2', formId: mockForm.id },
      ];

      mockPrismaService.formSubmission.findMany.mockResolvedValue(
        mockSubmissions,
      );

      const result = await service.getFormSubmissions(mockForm.id);

      expect(mockPrismaService.formSubmission.findMany).toHaveBeenCalledWith({
        where: { formId: mockForm.id },
        orderBy: { submittedAt: 'desc' },
      });
      expect(result).toEqual(mockSubmissions);
    });
  });

  describe('incrementSubmissionCount', () => {
    it('should increment the submission count for a form', async () => {
      mockPrismaService.form.update.mockResolvedValue({
        ...mockForm,
        submissionCount: mockForm.submissionCount + 1,
      });

      await service.incrementSubmissionCount(mockForm.id);

      expect(mockPrismaService.form.update).toHaveBeenCalledWith({
        where: { id: mockForm.id },
        data: { submissionCount: { increment: 1 } },
      });
    });
  });

  describe('publishForm', () => {
    it('should update form status to PUBLISHED', async () => {
      mockPrismaService.form.update.mockResolvedValue({
        ...mockForm,
        status: FormStatus.PUBLISHED,
      });

      const result = await service.publishForm(mockForm.id);

      expect(mockPrismaService.form.update).toHaveBeenCalledWith({
        where: { id: mockForm.id },
        data: { status: 'PUBLISHED' },
      });
      expect(result.status).toBe(FormStatus.PUBLISHED);
    });
  });

  describe('archiveForm', () => {
    it('should update form status to ARCHIVED', async () => {
      mockPrismaService.form.update.mockResolvedValue({
        ...mockForm,
        status: FormStatus.ARCHIVED,
      });

      const result = await service.archiveForm(mockForm.id);

      expect(mockPrismaService.form.update).toHaveBeenCalledWith({
        where: { id: mockForm.id },
        data: { status: 'ARCHIVED' },
      });
      expect(result.status).toBe(FormStatus.ARCHIVED);
    });
  });
});
