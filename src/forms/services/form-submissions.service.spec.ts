import { Test, TestingModule } from '@nestjs/testing';
import { FormSubmissionsService } from './form-submissions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FormsService } from './forms.service';
import { CreateFormSubmissionInput } from '../dto/create-form-submission.input';
import { SubmissionFilterInput } from '../dto/submission-filter.input';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Create a mock class for PrismaClientKnownRequestError
class MockPrismaError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'PrismaClientKnownRequestError';
  }
}

describe('FormSubmissionsService', () => {
  let service: FormSubmissionsService;
  let prismaService: PrismaService;
  let formsService: FormsService;

  const mockPrismaService = {
    form: {
      findUnique: jest.fn(),
    },
    formSubmission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    formFieldValue: {
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockFormsService = {
    incrementSubmissionCount: jest.fn(),
  };

  const mockForm = {
    id: 'test-form-id',
    title: 'Test Form',
    status: 'PUBLISHED',
    expiresAt: null,
  };

  const mockSubmission = {
    id: 'test-submission-id',
    formId: mockForm.id,
    submittedAt: new Date(),
    status: 'COMPLETED',
    ipAddress: '127.0.0.1',
    userAgent: 'Test User Agent',
    branchId: 'branch-id',
    submittedById: 'user-id',
  };

  const mockFieldValues = [
    {
      submissionId: mockSubmission.id,
      fieldId: 'field-1',
      value: 'Test Value 1',
    },
    {
      submissionId: mockSubmission.id,
      fieldId: 'field-2',
      value: 'Test Value 2',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormSubmissionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FormsService,
          useValue: mockFormsService,
        },
      ],
    }).compile();

    service = module.get<FormSubmissionsService>(FormSubmissionsService);
    prismaService = module.get<PrismaService>(PrismaService);
    formsService = module.get<FormsService>(FormsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a form submission with field values', async () => {
      const createSubmissionInput: CreateFormSubmissionInput = {
        formId: mockForm.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
        branchId: 'branch-id',
        submittedById: 'user-id',
        fieldValues: [
          {
            fieldId: 'field-1',
            value: 'Test Value 1',
          },
          {
            fieldId: 'field-2',
            value: 'Test Value 2',
          },
        ],
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.formSubmission.create.mockResolvedValue(mockSubmission);
      mockPrismaService.formFieldValue.createMany.mockResolvedValue({
        count: 2,
      });

      const result = await service.create(createSubmissionInput);

      expect(mockPrismaService.form.findUnique).toHaveBeenCalledWith({
        where: { id: createSubmissionInput.formId },
      });
      expect(mockPrismaService.formSubmission.create).toHaveBeenCalledWith({
        data: {
          formId: createSubmissionInput.formId,
          ipAddress: createSubmissionInput.ipAddress,
          userAgent: createSubmissionInput.userAgent,
          branchId: createSubmissionInput.branchId,
          submittedById: createSubmissionInput.submittedById,
          status: 'COMPLETED',
        },
      });
      expect(mockPrismaService.formFieldValue.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            submissionId: mockSubmission.id,
            fieldId: 'field-1',
            value: 'Test Value 1',
          }),
          expect.objectContaining({
            submissionId: mockSubmission.id,
            fieldId: 'field-2',
            value: 'Test Value 2',
          }),
        ]),
      });
      expect(mockFormsService.incrementSubmissionCount).toHaveBeenCalledWith(
        mockForm.id,
      );
      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException if form not found', async () => {
      const createSubmissionInput: CreateFormSubmissionInput = {
        formId: 'non-existent-form-id',
        fieldValues: [],
      };

      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(service.create(createSubmissionInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw Error if form is not published', async () => {
      const createSubmissionInput: CreateFormSubmissionInput = {
        formId: mockForm.id,
        fieldValues: [],
      };

      mockPrismaService.form.findUnique.mockResolvedValue({
        ...mockForm,
        status: 'DRAFT',
      });

      await expect(service.create(createSubmissionInput)).rejects.toThrow(
        'Cannot submit to a form that is not published',
      );
    });

    it('should throw Error if form has expired', async () => {
      const createSubmissionInput: CreateFormSubmissionInput = {
        formId: mockForm.id,
        fieldValues: [],
      };

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockPrismaService.form.findUnique.mockResolvedValue({
        ...mockForm,
        expiresAt: pastDate,
      });

      await expect(service.create(createSubmissionInput)).rejects.toThrow(
        'This form has expired and is no longer accepting submissions',
      );
    });

    it('should throw Error if field IDs are invalid', async () => {
      const createSubmissionInput: CreateFormSubmissionInput = {
        formId: mockForm.id,
        fieldValues: [
          {
            fieldId: 'invalid-field-id',
            value: 'Test Value',
          },
        ],
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);

      // Set up Prisma namespace for instanceof check
      (Prisma as any).PrismaClientKnownRequestError = MockPrismaError;

      // Create a transaction mock that throws a Prisma error
      mockPrismaService.formSubmission.create.mockImplementation(() => {
        throw new MockPrismaError('Foreign key constraint failed', 'P2003');
      });

      // Use $transaction to simulate the transaction
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockPrismaService);
        } catch (error) {
          throw error;
        }
      });

      await expect(service.create(createSubmissionInput)).rejects.toThrow(
        'One or more field IDs are invalid',
      );
    });
  });

  describe('findAll', () => {
    it('should return all submissions for a form', async () => {
      const filter: SubmissionFilterInput = {
        formId: mockForm.id,
      };

      const mockSubmissions = [
        { ...mockSubmission, id: 'submission-1' },
        { ...mockSubmission, id: 'submission-2' },
      ];

      mockPrismaService.formSubmission.findMany.mockResolvedValue(
        mockSubmissions,
      );

      const result = await service.findAll(filter);

      expect(mockPrismaService.formSubmission.findMany).toHaveBeenCalledWith({
        where: { formId: filter.formId },
        orderBy: { submittedAt: 'desc' },
      });
      expect(result).toEqual(mockSubmissions);
      expect(result.length).toBe(2);
    });

    it('should filter submissions by branch', async () => {
      const filter: SubmissionFilterInput = {
        formId: mockForm.id,
        branchId: 'branch-id',
      };

      mockPrismaService.formSubmission.findMany.mockResolvedValue([
        mockSubmission,
      ]);

      const result = await service.findAll(filter);

      expect(mockPrismaService.formSubmission.findMany).toHaveBeenCalledWith({
        where: {
          formId: filter.formId,
          branchId: filter.branchId,
        },
        orderBy: { submittedAt: 'desc' },
      });
      expect(result).toEqual([mockSubmission]);
    });

    it('should filter submissions by status', async () => {
      const filter: SubmissionFilterInput = {
        formId: mockForm.id,
        status: 'COMPLETED',
      };

      mockPrismaService.formSubmission.findMany.mockResolvedValue([
        mockSubmission,
      ]);

      const result = await service.findAll(filter);

      expect(mockPrismaService.formSubmission.findMany).toHaveBeenCalledWith({
        where: {
          formId: filter.formId,
          status: filter.status,
        },
        orderBy: { submittedAt: 'desc' },
      });
      expect(result).toEqual([mockSubmission]);
    });

    it('should filter submissions by date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const filter: SubmissionFilterInput = {
        formId: mockForm.id,
        startDate,
        endDate,
      };

      mockPrismaService.formSubmission.findMany.mockResolvedValue([
        mockSubmission,
      ]);

      const result = await service.findAll(filter);

      expect(mockPrismaService.formSubmission.findMany).toHaveBeenCalledWith({
        where: {
          formId: filter.formId,
          submittedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { submittedAt: 'desc' },
      });
      expect(result).toEqual([mockSubmission]);
    });
  });

  describe('findOne', () => {
    it('should return a submission by id', async () => {
      mockPrismaService.formSubmission.findUnique.mockResolvedValue(
        mockSubmission,
      );

      const result = await service.findOne(mockSubmission.id);

      expect(mockPrismaService.formSubmission.findUnique).toHaveBeenCalledWith({
        where: { id: mockSubmission.id },
      });
      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException if submission not found', async () => {
      mockPrismaService.formSubmission.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a submission', async () => {
      mockPrismaService.formSubmission.findUnique.mockResolvedValue(
        mockSubmission,
      );
      mockPrismaService.formSubmission.delete.mockResolvedValue(mockSubmission);

      const result = await service.remove(mockSubmission.id);

      expect(mockPrismaService.formSubmission.delete).toHaveBeenCalledWith({
        where: { id: mockSubmission.id },
      });
      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException if submission to delete not found', async () => {
      mockPrismaService.formSubmission.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFieldValues', () => {
    it('should return field values for a submission', async () => {
      const mockFieldValuesWithField = mockFieldValues.map((value) => ({
        ...value,
        field: { id: value.fieldId, label: `Field ${value.fieldId}` },
      }));

      mockPrismaService.formFieldValue.findMany.mockResolvedValue(
        mockFieldValuesWithField,
      );

      const result = await service.getFieldValues(mockSubmission.id);

      expect(mockPrismaService.formFieldValue.findMany).toHaveBeenCalledWith({
        where: { submissionId: mockSubmission.id },
        include: { field: true },
      });
      expect(result).toEqual(mockFieldValuesWithField);
      expect(result.length).toBe(2);
    });
  });

  describe('exportSubmissions', () => {
    it('should export submissions in a formatted structure', async () => {
      const formId = mockForm.id;

      const mockFormWithFields = {
        ...mockForm,
        fields: [
          { id: 'field-1', label: 'Field 1', order: 0 },
          { id: 'field-2', label: 'Field 2', order: 1 },
        ],
      };

      const mockSubmissionsWithValues = [
        {
          ...mockSubmission,
          id: 'submission-1',
          fieldValues: [
            {
              fieldId: 'field-1',
              value: 'Value 1-1',
              field: { id: 'field-1', label: 'Field 1' },
            },
            {
              fieldId: 'field-2',
              value: 'Value 1-2',
              field: { id: 'field-2', label: 'Field 2' },
            },
          ],
        },
        {
          ...mockSubmission,
          id: 'submission-2',
          fieldValues: [
            {
              fieldId: 'field-1',
              value: 'Value 2-1',
              field: { id: 'field-1', label: 'Field 1' },
            },
            {
              fieldId: 'field-2',
              value: 'Value 2-2',
              field: { id: 'field-2', label: 'Field 2' },
            },
          ],
        },
      ];

      mockPrismaService.form.findUnique.mockResolvedValue(mockFormWithFields);
      mockPrismaService.formSubmission.findMany.mockResolvedValue(
        mockSubmissionsWithValues,
      );

      const result = await service.exportSubmissions(formId);

      expect(mockPrismaService.form.findUnique).toHaveBeenCalledWith({
        where: { id: formId },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
      expect(mockPrismaService.formSubmission.findMany).toHaveBeenCalledWith({
        where: { formId },
        orderBy: { submittedAt: 'desc' },
        include: {
          fieldValues: {
            include: {
              field: true,
            },
          },
        },
      });

      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('submissionId', 'submission-1');
      expect(result[0]).toHaveProperty('Field 1', 'Value 1-1');
      expect(result[0]).toHaveProperty('Field 2', 'Value 1-2');
      expect(result[1]).toHaveProperty('submissionId', 'submission-2');
      expect(result[1]).toHaveProperty('Field 1', 'Value 2-1');
      expect(result[1]).toHaveProperty('Field 2', 'Value 2-2');
    });

    it('should throw NotFoundException if form not found', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(
        service.exportSubmissions('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
