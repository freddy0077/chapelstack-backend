import { Test, TestingModule } from '@nestjs/testing';
import { FormsResolver } from './forms.resolver';
import { FormsService } from '../services/forms.service';
import { CreateFormInput } from '../dto/create-form.input';
import { UpdateFormInput } from '../dto/update-form.input';
import { FormFilterInput } from '../dto/form-filter.input';
import { FormStatus } from '../entities/form.entity';

describe('FormsResolver', () => {
  let resolver: FormsResolver;
  let formsService: FormsService;

  const mockFormsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    publishForm: jest.fn(),
    archiveForm: jest.fn(),
    getFormFields: jest.fn(),
    getFormSubmissions: jest.fn(),
  };

  const mockForm = {
    id: 'test-form-id',
    title: 'Test Form',
    description: 'Test Description',
    status: FormStatus.DRAFT,
    slug: 'test-form',
    isPublic: true,
    branchId: 'branch-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    notifyEmails: ['test@example.com'],
    submissionCount: 0,
  };

  const mockFields = [
    { id: 'field-1', formId: mockForm.id, label: 'Field 1' },
    { id: 'field-2', formId: mockForm.id, label: 'Field 2' },
  ];

  const mockSubmissions = [
    { id: 'submission-1', formId: mockForm.id },
    { id: 'submission-2', formId: mockForm.id },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsResolver,
        {
          provide: FormsService,
          useValue: mockFormsService,
        },
      ],
    }).compile();

    resolver = module.get<FormsResolver>(FormsResolver);
    formsService = module.get<FormsService>(FormsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createForm', () => {
    it('should create a form', async () => {
      const createFormInput: CreateFormInput = {
        title: 'New Form',
        description: 'Form Description',
        branchId: 'branch-id',
      };

      mockFormsService.create.mockResolvedValue({
        ...mockForm,
        title: createFormInput.title,
        description: createFormInput.description,
      });

      const result = await resolver.createForm(createFormInput);

      expect(mockFormsService.create).toHaveBeenCalledWith(createFormInput);
      expect(result.title).toBe(createFormInput.title);
      expect(result.description).toBe(createFormInput.description);
    });
  });

  describe('forms', () => {
    it('should return all forms when no filter is provided', async () => {
      mockFormsService.findAll.mockResolvedValue([mockForm]);

      const result = await resolver.forms();

      expect(mockFormsService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockForm]);
    });

    it('should return filtered forms when filter is provided', async () => {
      const filter: FormFilterInput = {
        search: 'test',
        status: FormStatus.PUBLISHED,
      };

      mockFormsService.findAll.mockResolvedValue([
        { ...mockForm, status: FormStatus.PUBLISHED },
      ]);

      const result = await resolver.forms(filter);

      expect(mockFormsService.findAll).toHaveBeenCalledWith(filter);
      expect(result[0].status).toBe(FormStatus.PUBLISHED);
    });
  });

  describe('form', () => {
    it('should return a form by id', async () => {
      mockFormsService.findOne.mockResolvedValue(mockForm);

      const result = await resolver.form(mockForm.id);

      expect(mockFormsService.findOne).toHaveBeenCalledWith(mockForm.id);
      expect(result).toEqual(mockForm);
    });
  });

  describe('publicForm', () => {
    it('should return a public published form by slug', async () => {
      mockFormsService.findBySlug.mockResolvedValue({
        ...mockForm,
        status: FormStatus.PUBLISHED,
        isPublic: true,
      });

      const result = await resolver.publicForm(mockForm.slug);

      expect(mockFormsService.findBySlug).toHaveBeenCalledWith(mockForm.slug);
      expect(result.status).toBe(FormStatus.PUBLISHED);
      expect(result.isPublic).toBe(true);
    });

    it('should throw error if form is not published', async () => {
      mockFormsService.findBySlug.mockResolvedValue({
        ...mockForm,
        status: FormStatus.DRAFT,
        isPublic: true,
      });

      await expect(resolver.publicForm(mockForm.slug)).rejects.toThrow(
        'Form not found or not available',
      );
    });

    it('should throw error if form is not public', async () => {
      mockFormsService.findBySlug.mockResolvedValue({
        ...mockForm,
        status: FormStatus.PUBLISHED,
        isPublic: false,
      });

      await expect(resolver.publicForm(mockForm.slug)).rejects.toThrow(
        'Form not found or not available',
      );
    });
  });

  describe('updateForm', () => {
    it('should update a form', async () => {
      const updateFormInput: UpdateFormInput = {
        id: mockForm.id,
        title: 'Updated Form Title',
      };

      mockFormsService.update.mockResolvedValue({
        ...mockForm,
        title: updateFormInput.title,
      });

      const result = await resolver.updateForm(updateFormInput);

      expect(mockFormsService.update).toHaveBeenCalledWith(
        updateFormInput.id,
        updateFormInput,
      );
      expect(result.title).toBe(updateFormInput.title);
    });
  });

  describe('removeForm', () => {
    it('should remove a form', async () => {
      mockFormsService.remove.mockResolvedValue(mockForm);

      const result = await resolver.removeForm(mockForm.id);

      expect(mockFormsService.remove).toHaveBeenCalledWith(mockForm.id);
      expect(result).toEqual(mockForm);
    });
  });

  describe('publishForm', () => {
    it('should publish a form', async () => {
      mockFormsService.publishForm.mockResolvedValue({
        ...mockForm,
        status: FormStatus.PUBLISHED,
      });

      const result = await resolver.publishForm(mockForm.id);

      expect(mockFormsService.publishForm).toHaveBeenCalledWith(mockForm.id);
      expect(result.status).toBe(FormStatus.PUBLISHED);
    });
  });

  describe('archiveForm', () => {
    it('should archive a form', async () => {
      mockFormsService.archiveForm.mockResolvedValue({
        ...mockForm,
        status: FormStatus.ARCHIVED,
      });

      const result = await resolver.archiveForm(mockForm.id);

      expect(mockFormsService.archiveForm).toHaveBeenCalledWith(mockForm.id);
      expect(result.status).toBe(FormStatus.ARCHIVED);
    });
  });

  describe('fields', () => {
    it('should return fields for a form', async () => {
      mockFormsService.getFormFields.mockResolvedValue(mockFields);

      const result = await resolver.fields(mockForm);

      expect(mockFormsService.getFormFields).toHaveBeenCalledWith(mockForm.id);
      expect(result).toEqual(mockFields);
      expect(result.length).toBe(2);
    });
  });

  describe('submissions', () => {
    it('should return submissions for a form', async () => {
      mockFormsService.getFormSubmissions.mockResolvedValue(mockSubmissions);

      const result = await resolver.submissions(mockForm);

      expect(mockFormsService.getFormSubmissions).toHaveBeenCalledWith(
        mockForm.id,
      );
      expect(result).toEqual(mockSubmissions);
      expect(result.length).toBe(2);
    });
  });
});
