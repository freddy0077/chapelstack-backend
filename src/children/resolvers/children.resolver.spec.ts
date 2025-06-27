import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenResolver } from './children.resolver';
import { ChildrenService } from '../services/children.service';
import { GuardiansService } from '../services/guardians.service';
import { Child } from '../entities/child.entity';
import { Guardian } from '../entities/guardian.entity';
import { CreateChildInput } from '../dto/create-child.input';
import { UpdateChildInput } from '../dto/update-child.input';
import { ChildFilterInput } from '../dto/child-filter.input';
import { CheckInRecord } from '../entities/check-in-record.entity';

// Define gender constants to match the string values in the database
const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

// Mock data
const mockChild: Child = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: new Date('2020-01-01'),
  gender: GENDER.MALE,
  allergies: 'None',
  specialNeeds: null,
  emergencyContactName: '123-456-7890',
  emergencyContactPhone: '123-456-7890',
  photoConsent: true,
  notes: null,
  branchId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  age: undefined,
  fullName: undefined,
  guardianRelations: [],
  checkInRecords: [],
};

const mockChildren: Child[] = [
  mockChild,
  {
    ...mockChild,
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    gender: GENDER.FEMALE,
    branchId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: undefined,
    guardianRelations: [],
    checkInRecords: [],
  },
];

const mockGuardians: Guardian[] = [
  {
    id: '1',
    firstName: 'Parent',
    lastName: 'One',
    email: 'parent1@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    relationship: 'Parent',
    branchId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: undefined,
    childRelations: [],
    memberId: null,
    isPrimaryGuardian: true,
    canPickup: true,
    notes: null,
  },
];

const mockCheckInRecords: CheckInRecord[] = [
  {
    id: '1',
    childId: '1',
    eventId: '1',
    checkedInById: '1',
    checkedOutById: null,
    checkedInAt: new Date(),
    checkedOutAt: null,
    guardianIdAtCheckIn: '1',
    guardianIdAtCheckOut: null,
    notes: 'Test check-in',
    branchId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    event: undefined,
    checkedInBy: undefined,
    checkedOutBy: undefined,
    child: undefined,
  },
];

// Mock services
const mockChildrenService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getRecentCheckIns: jest.fn(),
};

const mockGuardiansService = {
  findByChild: jest.fn(),
};

describe('ChildrenResolver', () => {
  let resolver: ChildrenResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChildrenResolver,
        { provide: ChildrenService, useValue: mockChildrenService },
        { provide: GuardiansService, useValue: mockGuardiansService },
      ],
    }).compile();

    resolver = module.get<ChildrenResolver>(ChildrenResolver);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createChild', () => {
    it('should create a new child', async () => {
      const createChildInput: CreateChildInput = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2020-01-01'),
        gender: GENDER.MALE,
        allergies: 'None',
        specialNeeds: null,
        emergencyContactName: '123-456-7890',
        emergencyContactPhone: '123-456-7890',
        photoConsent: true,
        notes: null,
        branchId: '1',
      };

      mockChildrenService.create.mockResolvedValue(mockChild);

      const result = await resolver.createChild(createChildInput);

      expect(result).toEqual(mockChild);
      expect(mockChildrenService.create).toHaveBeenCalledWith(createChildInput);
    });

    it('should handle errors when creating a child', async () => {
      const createChildInput: CreateChildInput = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2020-01-01'),
        gender: GENDER.MALE,
        allergies: 'None',
        specialNeeds: null,
        emergencyContactName: '123-456-7890',
        emergencyContactPhone: '123-456-7890',
        photoConsent: true,
        notes: null,
        branchId: '1',
      };

      const error = new Error('Database error');
      mockChildrenService.create.mockRejectedValue(error);

      await expect(resolver.createChild(createChildInput)).rejects.toThrow(
        'Failed to create child: Database error',
      );
      expect(mockChildrenService.create).toHaveBeenCalledWith(createChildInput);
    });
  });

  describe('findAll', () => {
    it('should return all children when no filter is provided', async () => {
      mockChildrenService.findAll.mockResolvedValue(mockChildren);

      const result = await resolver.findAll();

      expect(result).toEqual(mockChildren);
      expect(mockChildrenService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter children when filter is provided', async () => {
      const filter: ChildFilterInput = { firstName: 'John' };
      mockChildrenService.findAll.mockResolvedValue([mockChild]);

      const result = await resolver.findAll(filter);

      expect(result).toEqual([mockChild]);
      expect(mockChildrenService.findAll).toHaveBeenCalledWith(filter);
    });

    it('should handle errors when finding children', async () => {
      const error = new Error('Database error');
      mockChildrenService.findAll.mockRejectedValue(error);

      await expect(resolver.findAll()).rejects.toThrow(
        'Failed to find children: Database error',
      );
      expect(mockChildrenService.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findOne', () => {
    it('should return a child if found', async () => {
      mockChildrenService.findOne.mockResolvedValue(mockChild);

      const result = await resolver.findOne('1');

      expect(result).toEqual(mockChild);
      expect(mockChildrenService.findOne).toHaveBeenCalledWith('1');
    });

    it('should handle errors when finding a child', async () => {
      const error = new Error('Child not found');
      mockChildrenService.findOne.mockRejectedValue(error);

      await expect(resolver.findOne('999')).rejects.toThrow(
        'Failed to find child: Child not found',
      );
      expect(mockChildrenService.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('updateChild', () => {
    it('should update a child if found', async () => {
      const updateChildInput: UpdateChildInput = {
        id: '1',
        firstName: 'Johnny',
      };

      const updatedChild = { ...mockChild, firstName: 'Johnny' };
      mockChildrenService.update.mockResolvedValue(updatedChild);

      const result = await resolver.updateChild(updateChildInput);

      expect(result).toEqual(updatedChild);
      expect(mockChildrenService.update).toHaveBeenCalledWith(
        '1',
        updateChildInput,
      );
    });

    it('should handle errors when updating a child', async () => {
      const updateChildInput: UpdateChildInput = {
        id: '999',
        firstName: 'Johnny',
      };

      const error = new Error('Child not found');
      mockChildrenService.update.mockRejectedValue(error);

      await expect(resolver.updateChild(updateChildInput)).rejects.toThrow(
        'Failed to update child: Child not found',
      );
      expect(mockChildrenService.update).toHaveBeenCalledWith(
        '999',
        updateChildInput,
      );
    });
  });

  describe('removeChild', () => {
    it('should remove a child if found', async () => {
      mockChildrenService.remove.mockResolvedValue(mockChild);

      const result = await resolver.removeChild('1');

      expect(result).toEqual(mockChild);
      expect(mockChildrenService.remove).toHaveBeenCalledWith('1');
    });

    it('should handle errors when removing a child', async () => {
      const error = new Error('Child not found');
      mockChildrenService.remove.mockRejectedValue(error);

      await expect(resolver.removeChild('999')).rejects.toThrow(
        'Failed to remove child: Child not found',
      );
      expect(mockChildrenService.remove).toHaveBeenCalledWith('999');
    });
  });

  describe('getGuardians', () => {
    it('should return guardians for a child', async () => {
      mockGuardiansService.findByChild.mockResolvedValue(mockGuardians);

      const result = await resolver.getGuardians(mockChild);

      expect(result).toEqual(mockGuardians);
      expect(mockGuardiansService.findByChild).toHaveBeenCalledWith(
        mockChild.id,
      );
    });
  });

  describe('recentCheckIns', () => {
    it('should return recent check-ins for a child', async () => {
      mockChildrenService.getRecentCheckIns.mockResolvedValue(
        mockCheckInRecords,
      );

      const result = await resolver.recentCheckIns(mockChild);

      expect(result).toEqual(mockCheckInRecords);
      expect(mockChildrenService.getRecentCheckIns).toHaveBeenCalledWith(
        mockChild.id,
      );
    });

    it('should handle errors when getting recent check-ins', async () => {
      const error = new Error('Database error');
      mockChildrenService.getRecentCheckIns.mockRejectedValue(error);

      await expect(resolver.recentCheckIns(mockChild)).rejects.toThrow(
        'Failed to get recent check-ins: Database error',
      );
      expect(mockChildrenService.getRecentCheckIns).toHaveBeenCalledWith(
        mockChild.id,
      );
    });
  });
});
