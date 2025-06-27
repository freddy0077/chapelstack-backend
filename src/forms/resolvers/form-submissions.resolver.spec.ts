import { Test, TestingModule } from '@nestjs/testing';
import { FormSubmissionsResolver } from './form-submissions.resolver';
import { FormSubmissionsService } from '../services/form-submissions.service';
import { SubmissionFilterInput } from '../dto/submission-filter.input';
import { SubmissionStatus } from '../enums/submission-status.enum';
import { PrismaService } from '../../prisma/prisma.service';

describe('FormSubmissionsResolver', () => {
  let resolver: FormSubmissionsResolver;
  // formSubmissionsService is used in the tests via mockFormSubmissionsService
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let formSubmissionsService: FormSubmissionsService;
  let module: TestingModule;

  const mockForm = {
    id: 'form-id',
    title: 'Test Form',
    status: 'ACTIVE',
    isPublic: true,
    slug: 'test-form',
    enableCaptcha: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user-id',
  };

  const mockSubmission = {
    id: 'submission-id',
    formId: 'form-id',
    submittedAt: new Date(),
    status: SubmissionStatus.PENDING,
    ipAddress: '127.0.0.1',
    userAgent: 'Test User Agent',
    branchId: 'branch-id',
    submittedById: 'user-id',
  };

  const mockFieldValues = [
    {
      id: 'field-value-1',
      fieldId: 'field-1',
      value: 'Test Value 1',
      submissionId: 'submission-id',
    },
    {
      id: 'field-value-2',
      fieldId: 'field-2',
      value: 'Test Value 2',
      submissionId: 'submission-id',
    },
  ];

  const mockFormSubmissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    exportSubmissions: jest.fn(),
    getFieldValues: jest.fn(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      form: {
        findUnique: jest.fn().mockResolvedValue(mockForm),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      branch: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      formFieldValue: {
        findMany: jest.fn().mockResolvedValue(mockFieldValues),
      },
    };

    module = await Test.createTestingModule({
      providers: [
        FormSubmissionsResolver,
        {
          provide: FormSubmissionsService,
          useValue: mockFormSubmissionsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<FormSubmissionsResolver>(FormSubmissionsResolver);
    formSubmissionsService = module.get<FormSubmissionsService>(
      FormSubmissionsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('submitForm', () => {
    it('should create a new form submission', async () => {
      const createSubmissionInput = {
        formId: 'form-id',
        fieldValues: [
          { fieldId: 'field-1', value: 'Test Value 1' },
          { fieldId: 'field-2', value: 'Test Value 2' },
        ],
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
        branchId: 'branch-id',
        submittedById: 'user-id',
      };

      mockFormSubmissionsService.create.mockResolvedValue(mockSubmission);

      const result = await resolver.submitForm(createSubmissionInput);

      expect(mockFormSubmissionsService.create).toHaveBeenCalledWith(
        createSubmissionInput,
      );
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('formSubmissions', () => {
    it('should return all submissions for a form', async () => {
      const filter: SubmissionFilterInput = {
        formId: mockForm.id,
      };

      const mockSubmissions = [
        { ...mockSubmission, id: 'submission-1' },
        { ...mockSubmission, id: 'submission-2' },
      ];

      mockFormSubmissionsService.findAll.mockResolvedValue(mockSubmissions);

      const result = await resolver.formSubmissions(filter);

      expect(mockFormSubmissionsService.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(mockSubmissions);
      expect(result.length).toBe(2);
    });
  });

  describe('formSubmission', () => {
    it('should return a single form submission', async () => {
      mockFormSubmissionsService.findOne.mockResolvedValue(mockSubmission);

      const result = await resolver.formSubmission(mockSubmission.id);

      expect(mockFormSubmissionsService.findOne).toHaveBeenCalledWith(
        mockSubmission.id,
      );
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('removeFormSubmission', () => {
    it('should remove a form submission', async () => {
      mockFormSubmissionsService.remove.mockResolvedValue(mockSubmission);

      const result = await resolver.removeFormSubmission(mockSubmission.id);

      expect(mockFormSubmissionsService.remove).toHaveBeenCalledWith(
        mockSubmission.id,
      );
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('exportFormSubmissions', () => {
    it('should export form submissions as JSON', async () => {
      const formId = 'form-id';
      const exportedData = [
        { field1: 'value1', field2: 'value2' },
        { field1: 'value3', field2: 'value4' },
      ];

      mockFormSubmissionsService.exportSubmissions.mockResolvedValue(
        exportedData,
      );

      const result = await resolver.exportFormSubmissions(formId);

      expect(mockFormSubmissionsService.exportSubmissions).toHaveBeenCalledWith(
        formId,
      );
      // Use type assertion to handle any type safely
      expect((result as any[]).length).toBe(2);
      expect(result).toEqual(exportedData);
    });
  });

  describe('fieldValues', () => {
    it('should return field values for a submission', async () => {
      mockFormSubmissionsService.getFieldValues.mockResolvedValue(
        mockFieldValues,
      );

      const result = await resolver.fieldValues(mockSubmission);

      expect(mockFormSubmissionsService.getFieldValues).toHaveBeenCalledWith(
        mockSubmission.id,
      );
      expect(result).toEqual(mockFieldValues);
      // Use type assertion to handle any type safely
      expect((result as any[]).length).toBe(2);
    });
  });

  describe('form', () => {
    it('should return the parent form for a submission', async () => {
      const result = await resolver.form(mockSubmission);
      expect(result).toEqual(mockForm);
    });
  });

  describe('submitter', () => {
    it('should return null if no submittedById is present', async () => {
      const submission = { ...mockSubmission, submittedById: undefined };
      const result = await resolver.submitter(submission);
      expect(result).toBeNull();
    });

    it('should return the submitter for a submission', async () => {
      const mockUser = { id: 'user-id', name: 'Test User' };
      const mockPrismaService = module.get(PrismaService);
      // Use type-safe mocking approach
      const userService = mockPrismaService.user;
      jest
        .spyOn(userService, 'findUnique')
        .mockImplementation(() => Promise.resolve(mockUser));

      const result = await resolver.submitter(mockSubmission);
      expect(result).toEqual(mockUser);
    });
  });

  describe('submissionBranch', () => {
    it('should return null if no branchId is present', async () => {
      const submission = { ...mockSubmission, branchId: undefined };
      const result = await resolver.submissionBranch(submission);
      expect(result).toBeNull();
    });

    it('should return the branch for a submission', async () => {
      const mockBranch = { id: 'branch-id', name: 'Test Branch' };
      const mockPrismaService = module.get(PrismaService);
      // Use type-safe mocking approach
      const branchService = mockPrismaService.branch;
      jest
        .spyOn(branchService, 'findUnique')
        .mockImplementation(() => Promise.resolve(mockBranch));

      const result = await resolver.submissionBranch(mockSubmission);
      expect(result).toEqual(mockBranch);
    });
  });
});
