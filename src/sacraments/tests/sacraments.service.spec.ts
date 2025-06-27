import { Test, TestingModule } from '@nestjs/testing';
import { SacramentsService } from '../sacraments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
// Import mock types instead of actual types
import {
  SacramentType,
  CreateSacramentalRecordInput,
  UpdateSacramentalRecordInput,
  SacramentalRecordFilterInput,
  SacramentalRecord,
} from './mocks';

// Mock data
const mockPrismaSacramentalRecord = {
  id: 'test-id',
  memberId: 'member-id',
  sacramentType: SacramentType.BAPTISM,
  dateOfSacrament: new Date('2025-01-01'),
  locationOfSacrament: 'Test Church',
  officiantName: 'Test Priest',
  officiantId: 'officiant-id',
  godparent1Name: 'Godparent 1',
  godparent2Name: 'Godparent 2',
  sponsorName: 'Sponsor',
  witness1Name: 'Witness 1',
  witness2Name: 'Witness 2',
  certificateNumber: 'CERT-123',
  certificateUrl: 'https://example.com/cert.pdf',
  notes: 'Test notes',
  branchId: 'branch-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock Prisma service
let mockPrismaService: any = {};

describe('SacramentsService', () => {
  let service: SacramentsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    mockPrismaService = {
      sacramentalRecord: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      member: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'member-id', name: 'Test Member' }),
      },
      branch: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'branch-id', name: 'Test Branch' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SacramentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SacramentsService>(SacramentsService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new sacramental record', async () => {
      const createInput: CreateSacramentalRecordInput = {
        memberId: 'member-id',
        sacramentType: SacramentType.BAPTISM,
        dateOfSacrament: new Date('2025-01-01'),
        locationOfSacrament: 'Test Church',
        officiantName: 'Test Priest',
        branchId: 'branch-id',
      };

      mockPrismaService.sacramentalRecord.create.mockResolvedValue(
        mockPrismaSacramentalRecord,
      );

      const result = await service.create(createInput);

      expect(mockPrismaService.sacramentalRecord.create).toHaveBeenCalledWith({
        data: createInput,
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: mockPrismaSacramentalRecord.id,
          memberId: mockPrismaSacramentalRecord.memberId,
          sacramentType: mockPrismaSacramentalRecord.sacramentType,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all sacramental records when no filter is provided', async () => {
      mockPrismaService.sacramentalRecord.findMany.mockResolvedValue([
        mockPrismaSacramentalRecord,
      ]);

      const result = await service.findAll();

      expect(mockPrismaService.sacramentalRecord.findMany).toHaveBeenCalledWith(
        {
          where: {},
          orderBy: { dateOfSacrament: 'desc' },
        },
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: mockPrismaSacramentalRecord.id,
        }),
      );
    });

    it('should apply filters when provided', async () => {
      mockPrismaService.sacramentalRecord.findMany.mockResolvedValue([
        mockPrismaSacramentalRecord,
      ]);

      const filter: SacramentalRecordFilterInput = {
        sacramentType: SacramentType.BAPTISM,
        dateFrom: new Date('2025-01-01'),
        dateTo: new Date('2025-12-31'),
      };

      const result = await service.findAll(filter);

      expect(mockPrismaService.sacramentalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sacramentType: filter.sacramentType,
            dateOfSacrament: {
              gte: filter.dateFrom,
              lte: filter.dateTo,
            },
          }),
          orderBy: { dateOfSacrament: 'desc' },
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(mockPrismaSacramentalRecord.id);
    });
  });

  describe('findOne', () => {
    it('should return a sacramental record by id', async () => {
      mockPrismaService.sacramentalRecord.findUnique.mockResolvedValue(
        mockPrismaSacramentalRecord,
      );

      const result = await service.findOne('test-id');

      expect(
        mockPrismaService.sacramentalRecord.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: mockPrismaSacramentalRecord.id,
        }),
      );
    });

    it('should throw NotFoundException when record is not found', async () => {
      mockPrismaService.sacramentalRecord.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByMember', () => {
    it('should return all sacramental records for a member', async () => {
      mockPrismaService.sacramentalRecord.findMany.mockResolvedValue([
        mockPrismaSacramentalRecord,
      ]);

      const result = await service.findByMember('member-id');

      expect(mockPrismaService.sacramentalRecord.findMany).toHaveBeenCalledWith(
        {
          where: { memberId: 'member-id' },
          orderBy: { dateOfSacrament: 'desc' },
        },
      );
      expect(result).toHaveLength(1);
      expect(result[0].memberId).toEqual('member-id');
    });
  });

  describe('update', () => {
    it('should update a sacramental record', async () => {
      const updateInput: UpdateSacramentalRecordInput = {
        id: 'test-id',
        officiantName: 'Updated Priest',
        notes: 'Updated notes',
      };

      mockPrismaService.sacramentalRecord.findUnique.mockResolvedValue(
        mockPrismaSacramentalRecord,
      );
      mockPrismaService.sacramentalRecord.update.mockResolvedValue({
        ...mockPrismaSacramentalRecord,
        officiantName: 'Updated Priest',
        notes: 'Updated notes',
      });

      const result = await service.update('test-id', updateInput);

      expect(mockPrismaService.sacramentalRecord.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: expect.objectContaining({
          officiantName: 'Updated Priest',
          notes: 'Updated notes',
        }),
      });
      expect(result.officiantName).toEqual('Updated Priest');
      expect(result.notes).toEqual('Updated notes');
    });

    it('should throw NotFoundException when updating non-existent record', async () => {
      mockPrismaService.sacramentalRecord.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { id: 'non-existent-id' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a sacramental record and return true', async () => {
      mockPrismaService.sacramentalRecord.findUnique.mockResolvedValue(
        mockPrismaSacramentalRecord,
      );
      mockPrismaService.sacramentalRecord.delete.mockResolvedValue(
        mockPrismaSacramentalRecord,
      );

      const result = await service.remove('test-id');

      expect(mockPrismaService.sacramentalRecord.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when deleting non-existent record', async () => {
      mockPrismaService.sacramentalRecord.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadCertificate', () => {
    it('should update a record with certificate URL', async () => {
      mockPrismaService.sacramentalRecord.findUnique.mockResolvedValue(
        mockPrismaSacramentalRecord,
      );
      mockPrismaService.sacramentalRecord.update.mockResolvedValue({
        ...mockPrismaSacramentalRecord,
        certificateUrl: '/uploads/certificates/new-cert.pdf',
      });

      const result = await service.uploadCertificate(
        'test-id',
        '/uploads/certificates/new-cert.pdf',
      );

      expect(mockPrismaService.sacramentalRecord.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { certificateUrl: '/uploads/certificates/new-cert.pdf' },
      });
      expect(result.certificateUrl).toEqual(
        '/uploads/certificates/new-cert.pdf',
      );
    });

    it('should throw NotFoundException when record does not exist', async () => {
      mockPrismaService.sacramentalRecord.findUnique.mockResolvedValue(null);

      await expect(
        service.uploadCertificate(
          'non-existent-id',
          '/uploads/certificates/new-cert.pdf',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('mapPrismaRecordToEntity', () => {
    it('should correctly map Prisma record to GraphQL entity', async () => {
      // Use private method through any cast to test it
      const result = (service as any).mapPrismaRecordToEntity(
        mockPrismaSacramentalRecord,
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: mockPrismaSacramentalRecord.id,
          memberId: mockPrismaSacramentalRecord.memberId,
          sacramentType: mockPrismaSacramentalRecord.sacramentType,
          dateOfSacrament: mockPrismaSacramentalRecord.dateOfSacrament,
          locationOfSacrament: mockPrismaSacramentalRecord.locationOfSacrament,
          officiantName: mockPrismaSacramentalRecord.officiantName,
          officiantId: mockPrismaSacramentalRecord.officiantId,
          godparent1Name: mockPrismaSacramentalRecord.godparent1Name,
          godparent2Name: mockPrismaSacramentalRecord.godparent2Name,
          sponsorName: mockPrismaSacramentalRecord.sponsorName,
          witness1Name: mockPrismaSacramentalRecord.witness1Name,
          witness2Name: mockPrismaSacramentalRecord.witness2Name,
          certificateNumber: mockPrismaSacramentalRecord.certificateNumber,
          certificateUrl: mockPrismaSacramentalRecord.certificateUrl,
          notes: mockPrismaSacramentalRecord.notes,
          branchId: mockPrismaSacramentalRecord.branchId,
        }),
      );
    });

    it('should throw error when record is invalid', async () => {
      // Test the type guard by passing an invalid record
      expect(() => (service as any).mapPrismaRecordToEntity(null)).toThrow(
        'Invalid sacramental record data',
      );
      expect(() => (service as any).mapPrismaRecordToEntity({})).toThrow(
        'Invalid sacramental record data',
      );
      expect(() =>
        (service as any).mapPrismaRecordToEntity({ notARecord: true }),
      ).toThrow('Invalid sacramental record data');
    });
  });
});
