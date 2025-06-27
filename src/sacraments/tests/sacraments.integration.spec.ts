import { Test, TestingModule } from '@nestjs/testing';
import { SacramentsModule } from '../sacraments.module';
import { SacramentsService } from '../sacraments.service';
import { SacramentsResolver } from '../sacraments.resolver';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SacramentType,
  SacramentalRecord,
  CreateSacramentalRecordInput,
  UpdateSacramentalRecordInput,
  SacramentalRecordFilterInput,
} from './mocks';
import { NotFoundException } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { join } from 'path';

// Mock PrismaService for integration tests
class MockPrismaService {
  private sacramentalRecords = [];

  sacramentalRecord = {
    create: jest.fn(({ data }) => {
      const record = {
        id: `test-id-${this.sacramentalRecords.length + 1}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.sacramentalRecords.push(record);
      return Promise.resolve(record);
    }),

    findUnique: jest.fn(({ where }) => {
      const record = this.sacramentalRecords.find((r) => r.id === where.id);
      return Promise.resolve(record || null);
    }),

    findMany: jest.fn(({ where = {} }) => {
      let records = [...this.sacramentalRecords];

      if (where.memberId) {
        records = records.filter((r) => r.memberId === where.memberId);
      }

      if (where.sacramentType) {
        records = records.filter(
          (r) => r.sacramentType === where.sacramentType,
        );
      }

      if (where.dateOfSacrament?.gte) {
        records = records.filter(
          (r) =>
            new Date(r.dateOfSacrament) >= new Date(where.dateOfSacrament.gte),
        );
      }

      if (where.dateOfSacrament?.lte) {
        records = records.filter(
          (r) =>
            new Date(r.dateOfSacrament) <= new Date(where.dateOfSacrament.lte),
        );
      }

      return Promise.resolve(records);
    }),

    update: jest.fn(({ where, data }) => {
      const index = this.sacramentalRecords.findIndex((r) => r.id === where.id);
      if (index === -1) return Promise.resolve(null);

      const updatedRecord = {
        ...this.sacramentalRecords[index],
        ...data,
        updatedAt: new Date(),
      };

      this.sacramentalRecords[index] = updatedRecord;
      return Promise.resolve(updatedRecord);
    }),

    delete: jest.fn(({ where }) => {
      const index = this.sacramentalRecords.findIndex((r) => r.id === where.id);
      if (index === -1) return Promise.resolve(null);

      const deletedRecord = this.sacramentalRecords[index];
      this.sacramentalRecords.splice(index, 1);
      return Promise.resolve(deletedRecord);
    }),
  };

  // Helper to reset the mock data
  resetMockData() {
    this.sacramentalRecords = [];
    Object.values(this.sacramentalRecord).forEach((method) => {
      if (typeof method.mockClear === 'function') {
        method.mockClear();
      }
    });
  }
}

describe('Sacraments Module (Integration)', () => {
  let moduleRef: TestingModule;
  let resolver: SacramentsResolver;
  let service: SacramentsService;
  let prismaService: MockPrismaService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        // Import GraphQLModule to test scalar handling
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          buildSchemaOptions: {
            // Register Date scalar to avoid schema generation errors
            scalarsMap: [{ type: Date, scalar: GraphQLISODateTime }],
          },
        }),
      ],
      providers: [
        SacramentsService,
        SacramentsResolver,
        {
          provide: PrismaService,
          useClass: MockPrismaService,
        },
      ],
    }).compile();

    resolver = moduleRef.get<SacramentsResolver>(SacramentsResolver);
    service = moduleRef.get<SacramentsService>(SacramentsService);
    prismaService = moduleRef.get<PrismaService>(
      PrismaService,
    ) as unknown as MockPrismaService;
  });

  beforeEach(() => {
    // Reset mock data before each test
    prismaService.resetMockData();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('End-to-end CRUD operations', () => {
    it('should create, read, update, and delete a sacramental record', async () => {
      // 1. Create a record
      const createInput: CreateSacramentalRecordInput = {
        memberId: 'member-123',
        sacramentType: SacramentType.BAPTISM,
        dateOfSacrament: new Date('2025-02-15'),
        locationOfSacrament: 'St. Joseph Church',
        officiantName: 'Fr. Michael Brown',
        branchId: 'branch-456',
        godparent1Name: 'Jane Smith',
        godparent2Name: 'John Smith',
        notes: 'Special baptism ceremony',
      };

      const createdRecord = await resolver.createSacramentalRecord(createInput);
      expect(createdRecord).toBeDefined();
      expect(createdRecord.id).toBeDefined();
      expect(createdRecord.memberId).toBe(createInput.memberId);
      expect(createdRecord.sacramentType).toBe(createInput.sacramentType);

      const recordId = createdRecord.id;

      // 2. Read the record
      const retrievedRecord = await resolver.sacramentalRecord(recordId);
      expect(retrievedRecord).toBeDefined();
      expect(retrievedRecord.id).toBe(recordId);
      expect(retrievedRecord.notes).toBe('Special baptism ceremony');

      // 3. Update the record
      const updateInput: UpdateSacramentalRecordInput = {
        id: recordId,
        officiantName: 'Fr. James Wilson',
        notes: 'Updated ceremony notes',
      };

      const updatedRecord = await resolver.updateSacramentalRecord(
        recordId,
        updateInput,
      );
      expect(updatedRecord).toBeDefined();
      expect(updatedRecord.officiantName).toBe('Fr. James Wilson');
      expect(updatedRecord.notes).toBe('Updated ceremony notes');
      // Original data should remain unchanged
      expect(updatedRecord.memberId).toBe(createInput.memberId);
      expect(updatedRecord.sacramentType).toBe(createInput.sacramentType);

      // 4. Delete the record
      const deleteResult = await resolver.deleteSacramentalRecord(recordId);
      expect(deleteResult).toBe(true);

      // 5. Verify record is deleted
      await expect(resolver.sacramentalRecord(recordId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Filtering and member-specific queries', () => {
    beforeEach(async () => {
      // Create test records for different members and sacrament types
      const member1Records = [
        {
          memberId: 'member-1',
          sacramentType: SacramentType.BAPTISM,
          dateOfSacrament: new Date('2025-01-10'),
          locationOfSacrament: 'Church A',
          officiantName: 'Priest A',
          branchId: 'branch-1',
        },
        {
          memberId: 'member-1',
          sacramentType: SacramentType.CONFIRMATION,
          dateOfSacrament: new Date('2025-03-15'),
          locationOfSacrament: 'Church B',
          officiantName: 'Bishop A',
          branchId: 'branch-1',
        },
      ];

      const member2Records = [
        {
          memberId: 'member-2',
          sacramentType: SacramentType.MATRIMONY,
          dateOfSacrament: new Date('2025-06-20'),
          locationOfSacrament: 'Church C',
          officiantName: 'Priest B',
          branchId: 'branch-2',
        },
      ];

      // Create all test records
      for (const record of [...member1Records, ...member2Records]) {
        await resolver.createSacramentalRecord(record);
      }
    });

    it('should filter records by sacrament type', async () => {
      const filter: SacramentalRecordFilterInput = {
        sacramentType: SacramentType.BAPTISM,
      };

      const records = await resolver.sacramentalRecords(filter);
      expect(records).toHaveLength(1);
      expect(records[0].sacramentType).toBe(SacramentType.BAPTISM);
    });

    it('should filter records by date range', async () => {
      const filter: SacramentalRecordFilterInput = {
        fromDate: new Date('2025-03-01'),
        toDate: new Date('2025-07-01'),
      };

      const records = await resolver.sacramentalRecords(filter);
      expect(records).toHaveLength(2);
      // Should include CONFIRMATION and MATRIMONY but not BAPTISM
      expect(
        records.some((r) => r.sacramentType === SacramentType.CONFIRMATION),
      ).toBe(true);
      expect(
        records.some((r) => r.sacramentType === SacramentType.MATRIMONY),
      ).toBe(true);
      expect(
        records.some((r) => r.sacramentType === SacramentType.BAPTISM),
      ).toBe(false);
    });

    it('should get all records for a specific member', async () => {
      const memberRecords = await resolver.sacramentsByMember('member-1');
      expect(memberRecords).toHaveLength(2);
      expect(memberRecords.every((r) => r.memberId === 'member-1')).toBe(true);
    });

    it('should return an empty array for a member with no records', async () => {
      const memberRecords = await resolver.sacramentsByMember(
        'non-existent-member',
      );
      expect(memberRecords).toHaveLength(0);
    });
  });

  describe('Certificate handling', () => {
    it('should update certificate URL for a record', async () => {
      // 1. Create a record first
      const createInput: CreateSacramentalRecordInput = {
        memberId: 'member-cert',
        sacramentType: SacramentType.BAPTISM,
        dateOfSacrament: new Date('2025-02-15'),
        locationOfSacrament: 'St. Joseph Church',
        officiantName: 'Fr. Michael Brown',
        branchId: 'branch-456',
      };

      const createdRecord = await resolver.createSacramentalRecord(createInput);
      const recordId = createdRecord.id;

      // 2. Update certificate URL using service directly (since we can't easily mock file upload)
      const certificateUrl = '/uploads/certificates/test-cert.pdf';
      const updatedRecord = await service.uploadCertificate(
        recordId,
        certificateUrl,
      );

      expect(updatedRecord).toBeDefined();
      expect(updatedRecord.certificateUrl).toBe(certificateUrl);

      // 3. Verify the record was updated
      const retrievedRecord = await resolver.sacramentalRecord(recordId);
      expect(retrievedRecord.certificateUrl).toBe(certificateUrl);
    });
  });
});
