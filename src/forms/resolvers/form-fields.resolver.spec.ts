import { Test, TestingModule } from '@nestjs/testing';
import { FormFieldsResolver } from './form-fields.resolver';
import { FormFieldsService } from '../services/form-fields.service';
import { CreateFormFieldInput } from '../dto/create-form-field.input';
import { UpdateFormFieldInput } from '../dto/update-form-field.input';
import { FormFieldType } from '../entities/form-field.entity';
import { PrismaService } from '../../prisma/prisma.service';

describe('FormFieldsResolver', () => {
  let resolver: FormFieldsResolver;

  const mockFormFieldsService = {
    create: jest.fn(),
    createMany: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reorderFields: jest.fn(),
  };

  const mockFormField = {
    id: 'test-field-id',
    formId: 'test-form-id',
    type: FormFieldType.TEXT,
    label: 'Test Field',
    placeholder: 'Enter text',
    helpText: 'This is a test field',
    isRequired: true,
    isUnique: false,
    width: 100,
    order: 0,
    options: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockForm = {
    id: 'test-form-id',
    title: 'Test Form',
    status: 'ACTIVE',
    isPublic: true,
    slug: 'test-form',
    enableCaptcha: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user-id',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      form: {
        findUnique: jest.fn().mockResolvedValue(mockForm),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormFieldsResolver,
        {
          provide: FormFieldsService,
          useValue: mockFormFieldsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<FormFieldsResolver>(FormFieldsResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createFormField', () => {
    it('should create a form field', async () => {
      const createFormFieldInput: CreateFormFieldInput = {
        formId: 'test-form-id',
        type: FormFieldType.TEXT,
        label: 'New Field',
        isRequired: true,
        order: 1,
      };

      mockFormFieldsService.create.mockResolvedValue({
        ...mockFormField,
        label: createFormFieldInput.label,
        order: createFormFieldInput.order,
      });

      const result = await resolver.createFormField(createFormFieldInput);

      expect(mockFormFieldsService.create).toHaveBeenCalledWith(
        createFormFieldInput,
      );
      expect(result.label).toBe(createFormFieldInput.label);
      expect(result.order).toBe(createFormFieldInput.order);
    });
  });

  describe('createFormFields', () => {
    it('should create multiple form fields', async () => {
      const createFormFieldInputs: CreateFormFieldInput[] = [
        {
          formId: 'test-form-id',
          type: FormFieldType.TEXT,
          label: 'Field 1',
          isRequired: true,
          order: 0,
        },
        {
          formId: 'test-form-id',
          type: FormFieldType.EMAIL,
          label: 'Field 2',
          isRequired: true,
          order: 1,
        },
      ];

      const mockFields = [
        {
          ...mockFormField,
          label: 'Field 1',
          order: 0,
        },
        {
          ...mockFormField,
          label: 'Field 2',
          order: 1,
          type: FormFieldType.EMAIL,
        },
      ];

      mockFormFieldsService.createMany.mockResolvedValue(mockFields);

      const result = await resolver.createFormFields(createFormFieldInputs);

      expect(mockFormFieldsService.createMany).toHaveBeenCalledWith(
        createFormFieldInputs,
      );
      expect(result.length).toBe(2);
      expect(result[0].label).toBe('Field 1');
      expect(result[1].label).toBe('Field 2');
    });
  });

  describe('formFields', () => {
    it('should return all fields for a form', async () => {
      const formId = 'test-form-id';
      const mockFields = [
        { ...mockFormField, id: 'field-1', label: 'Field 1' },
        { ...mockFormField, id: 'field-2', label: 'Field 2' },
      ];

      mockFormFieldsService.findAll.mockResolvedValue(mockFields);

      const result = await resolver.formFields(formId);

      expect(mockFormFieldsService.findAll).toHaveBeenCalledWith(formId);
      expect(result).toEqual(mockFields);
      expect(result.length).toBe(2);
    });
  });

  describe('formField', () => {
    it('should return a field by id', async () => {
      mockFormFieldsService.findOne.mockResolvedValue(mockFormField);

      const result = await resolver.formField(mockFormField.id);

      expect(mockFormFieldsService.findOne).toHaveBeenCalledWith(
        mockFormField.id,
      );
      expect(result).toEqual(mockFormField);
    });
  });

  describe('updateFormField', () => {
    it('should update a form field', async () => {
      const updateFormFieldInput: UpdateFormFieldInput = {
        id: mockFormField.id,
        label: 'Updated Field Label',
        isRequired: false,
      };

      mockFormFieldsService.update.mockResolvedValue({
        ...mockFormField,
        label: updateFormFieldInput.label,
        isRequired: updateFormFieldInput.isRequired,
      });

      const result = await resolver.updateFormField(updateFormFieldInput);

      expect(mockFormFieldsService.update).toHaveBeenCalledWith(
        updateFormFieldInput.id,
        updateFormFieldInput,
      );
      expect(result.label).toBe(updateFormFieldInput.label);
      expect(result.isRequired).toBe(updateFormFieldInput.isRequired);
    });
  });

  describe('removeFormField', () => {
    it('should remove a form field', async () => {
      mockFormFieldsService.remove.mockResolvedValue(mockFormField);

      const result = await resolver.removeFormField(mockFormField.id);

      expect(mockFormFieldsService.remove).toHaveBeenCalledWith(
        mockFormField.id,
      );
      expect(result).toEqual(mockFormField);
    });
  });

  describe('reorderFormFields', () => {
    it('should reorder form fields', async () => {
      const formId = 'test-form-id';
      const fieldIds = ['field-1', 'field-2', 'field-3'];
      const reorderedFields = [
        { id: 'field-1', formId, order: 0 },
        { id: 'field-2', formId, order: 1 },
        { id: 'field-3', formId, order: 2 },
      ];

      mockFormFieldsService.reorderFields.mockResolvedValue(reorderedFields);

      const result = await resolver.reorderFormFields(formId, fieldIds);

      expect(mockFormFieldsService.reorderFields).toHaveBeenCalledWith(
        formId,
        fieldIds,
      );
      expect(result).toEqual(reorderedFields);
      expect(result.length).toBe(3);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(result[2].order).toBe(2);
    });
  });

  describe('form', () => {
    it('should return the parent form for a field', async () => {
      const mockField = {
        ...mockFormField,
      };

      const result = await resolver.form(mockField);

      expect(result).toEqual(mockForm);
    });
  });
});
