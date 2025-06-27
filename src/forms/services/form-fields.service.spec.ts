import { Test, TestingModule } from '@nestjs/testing';
import { FormFieldsService } from './form-fields.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormFieldInput } from '../dto/create-form-field.input';
import { UpdateFormFieldInput } from '../dto/update-form-field.input';
import { FormFieldType } from '../entities/form-field.entity';
import { NotFoundException } from '@nestjs/common';

describe('FormFieldsService', () => {
  let service: FormFieldsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    form: {
      findUnique: jest.fn(),
    },
    formField: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((operations) => Promise.all(operations)),
  };

  const mockForm = {
    id: 'test-form-id',
    title: 'Test Form',
  };

  const mockFormField = {
    id: 'test-field-id',
    formId: mockForm.id,
    type: FormFieldType.TEXT,
    label: 'Test Field',
    placeholder: 'Enter text',
    helpText: 'This is a test field',
    required: true,
    order: 0,
    options: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormFieldsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FormFieldsService>(FormFieldsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a form field', async () => {
      const createFormFieldInput: CreateFormFieldInput = {
        formId: mockForm.id,
        type: FormFieldType.TEXT,
        label: 'New Field',
        required: true,
        order: 1,
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.formField.create.mockResolvedValue({
        ...mockFormField,
        label: createFormFieldInput.label,
        order: createFormFieldInput.order,
      });

      const result = await service.create(createFormFieldInput);

      expect(mockPrismaService.form.findUnique).toHaveBeenCalledWith({
        where: { id: createFormFieldInput.formId },
      });
      expect(mockPrismaService.formField.create).toHaveBeenCalledWith({
        data: createFormFieldInput,
      });
      expect(result.label).toBe(createFormFieldInput.label);
      expect(result.order).toBe(createFormFieldInput.order);
    });

    it('should throw NotFoundException if form not found', async () => {
      const createFormFieldInput: CreateFormFieldInput = {
        formId: 'non-existent-form-id',
        type: FormFieldType.TEXT,
        label: 'New Field',
        required: true,
        order: 1,
      };

      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(service.create(createFormFieldInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createMany', () => {
    it('should create multiple form fields', async () => {
      const createFormFieldInputs: CreateFormFieldInput[] = [
        {
          formId: mockForm.id,
          type: FormFieldType.TEXT,
          label: 'Field 1',
          required: true,
          order: 0,
        },
        {
          formId: mockForm.id,
          type: FormFieldType.EMAIL,
          label: 'Field 2',
          required: true,
          order: 1,
        },
      ];

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.formField.create.mockImplementation((args) =>
        Promise.resolve({
          ...mockFormField,
          ...args.data,
        }),
      );

      const result = await service.createMany(createFormFieldInputs);

      expect(mockPrismaService.form.findUnique).toHaveBeenCalledWith({
        where: { id: mockForm.id },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].label).toBe('Field 1');
      expect(result[1].label).toBe('Field 2');
    });

    it('should return empty array if input array is empty', async () => {
      const result = await service.createMany([]);
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if form not found', async () => {
      const createFormFieldInputs: CreateFormFieldInput[] = [
        {
          formId: 'non-existent-form-id',
          type: FormFieldType.TEXT,
          label: 'Field 1',
          required: true,
          order: 0,
        },
      ];

      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(service.createMany(createFormFieldInputs)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all fields for a form', async () => {
      const mockFields = [
        { ...mockFormField, id: 'field-1', label: 'Field 1' },
        { ...mockFormField, id: 'field-2', label: 'Field 2' },
      ];

      mockPrismaService.formField.findMany.mockResolvedValue(mockFields);

      const result = await service.findAll(mockForm.id);

      expect(mockPrismaService.formField.findMany).toHaveBeenCalledWith({
        where: { formId: mockForm.id },
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockFields);
      expect(result.length).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a field by id', async () => {
      mockPrismaService.formField.findUnique.mockResolvedValue(mockFormField);

      const result = await service.findOne(mockFormField.id);

      expect(mockPrismaService.formField.findUnique).toHaveBeenCalledWith({
        where: { id: mockFormField.id },
      });
      expect(result).toEqual(mockFormField);
    });

    it('should throw NotFoundException if field not found', async () => {
      mockPrismaService.formField.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a form field', async () => {
      const updateFormFieldInput: UpdateFormFieldInput = {
        id: mockFormField.id,
        label: 'Updated Field Label',
        required: false,
      };

      mockPrismaService.formField.findUnique.mockResolvedValue(mockFormField);
      mockPrismaService.formField.update.mockResolvedValue({
        ...mockFormField,
        label: updateFormFieldInput.label,
        required: updateFormFieldInput.required,
      });

      const result = await service.update(
        mockFormField.id,
        updateFormFieldInput,
      );

      expect(mockPrismaService.formField.update).toHaveBeenCalledWith({
        where: { id: mockFormField.id },
        data: updateFormFieldInput,
      });
      expect(result.label).toBe(updateFormFieldInput.label);
      expect(result.required).toBe(updateFormFieldInput.required);
    });

    it('should throw NotFoundException if field to update not found', async () => {
      const updateFormFieldInput: UpdateFormFieldInput = {
        id: 'non-existent-id',
        label: 'Updated Field Label',
      };

      mockPrismaService.formField.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateFormFieldInput),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a form field', async () => {
      mockPrismaService.formField.findUnique.mockResolvedValue(mockFormField);
      mockPrismaService.formField.delete.mockResolvedValue(mockFormField);

      const result = await service.remove(mockFormField.id);

      expect(mockPrismaService.formField.delete).toHaveBeenCalledWith({
        where: { id: mockFormField.id },
      });
      expect(result).toEqual(mockFormField);
    });

    it('should throw NotFoundException if field to delete not found', async () => {
      mockPrismaService.formField.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reorderFields', () => {
    it('should reorder form fields', async () => {
      const formId = mockForm.id;
      const fieldIds = ['field-1', 'field-2', 'field-3'];

      const existingFields = [
        { id: 'field-1', formId, order: 2 },
        { id: 'field-2', formId, order: 0 },
        { id: 'field-3', formId, order: 1 },
      ];

      const updatedFields = [
        { id: 'field-1', formId, order: 0 },
        { id: 'field-2', formId, order: 1 },
        { id: 'field-3', formId, order: 2 },
      ];

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.formField.findMany.mockResolvedValue(existingFields);
      mockPrismaService.formField.update.mockImplementation((args) => {
        const fieldId = args.where.id;
        const order = args.data.order;
        return Promise.resolve({ id: fieldId, formId, order });
      });

      const result = await service.reorderFields(formId, fieldIds);

      expect(mockPrismaService.form.findUnique).toHaveBeenCalledWith({
        where: { id: formId },
      });
      expect(mockPrismaService.formField.findMany).toHaveBeenCalledWith({
        where: { formId },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Check that each field was updated with the correct order
      expect(result[0].id).toBe('field-1');
      expect(result[0].order).toBe(0);
      expect(result[1].id).toBe('field-2');
      expect(result[1].order).toBe(1);
      expect(result[2].id).toBe('field-3');
      expect(result[2].order).toBe(2);
    });

    it('should throw NotFoundException if form not found', async () => {
      const formId = 'non-existent-form-id';
      const fieldIds = ['field-1', 'field-2'];

      mockPrismaService.form.findUnique.mockResolvedValue(null);

      await expect(service.reorderFields(formId, fieldIds)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw Error if any field ID is invalid', async () => {
      const formId = mockForm.id;
      const fieldIds = ['field-1', 'invalid-field-id'];

      const existingFields = [{ id: 'field-1', formId }];

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.formField.findMany.mockResolvedValue(existingFields);

      await expect(service.reorderFields(formId, fieldIds)).rejects.toThrow(
        'One or more field IDs are invalid or do not belong to this form',
      );
    });
  });
});
