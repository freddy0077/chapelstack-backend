import { Test, TestingModule } from '@nestjs/testing';
import { SacramentsResolver } from '../sacraments.resolver';
import { SacramentsService } from '../sacraments.service';
import {
  SacramentType,
  CreateSacramentalRecordInput,
  UpdateSacramentalRecordInput,
  SacramentalRecordFilterInput,
  SacramentalRecord,
} from './mocks';
import { FileUpload } from 'graphql-upload';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

// Mock data
const mockSacramentalRecord: SacramentalRecord = {
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

// Mock service
const mockSacramentsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByMember: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  uploadCertificate: jest.fn(),
};

// Mock file system
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
  },
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn().mockImplementation(function (event, callback) {
      if (event === 'finish') {
        setTimeout(callback, 10); // Simulate async finish event
      }
      return this;
    }),
    end: jest.fn(),
  }),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mock/path/to/file.pdf'),
  dirname: jest.fn().mockReturnValue('/mock/path'),
}));

describe('SacramentsResolver', () => {
  let resolver: SacramentsResolver;
  let service: SacramentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SacramentsResolver,
        {
          provide: SacramentsService,
          useValue: mockSacramentsService,
        },
      ],
    }).compile();

    resolver = module.get<SacramentsResolver>(SacramentsResolver);
    service = module.get<SacramentsService>(SacramentsService);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createSacramentalRecord', () => {
    it('should create a sacramental record', async () => {
      const createInput: CreateSacramentalRecordInput = {
        memberId: 'member-id',
        sacramentType: SacramentType.BAPTISM,
        dateOfSacrament: new Date('2025-01-01'),
        locationOfSacrament: 'Test Church',
        officiantName: 'Test Priest',
        branchId: 'branch-id',
      };

      mockSacramentsService.create.mockResolvedValue(mockSacramentalRecord);

      const result = await resolver.createSacramentalRecord(createInput);

      expect(mockSacramentsService.create).toHaveBeenCalledWith(createInput);
      expect(result).toEqual(mockSacramentalRecord);
    });
  });

  describe('sacramentalRecord', () => {
    it('should return a sacramental record by id', async () => {
      mockSacramentsService.findOne.mockResolvedValue(mockSacramentalRecord);

      const result = await resolver.sacramentalRecord('test-id');

      expect(mockSacramentsService.findOne).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockSacramentalRecord);
    });
  });

  describe('sacramentalRecords', () => {
    it('should return all sacramental records when no filter is provided', async () => {
      mockSacramentsService.findAll.mockResolvedValue([mockSacramentalRecord]);

      const result = await resolver.sacramentalRecords();

      expect(mockSacramentsService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockSacramentalRecord]);
    });

    it('should apply filters when provided', async () => {
      const filter: SacramentalRecordFilterInput = {
        sacramentType: SacramentType.BAPTISM,
        fromDate: new Date('2025-01-01'),
        toDate: new Date('2025-12-31'),
      };

      mockSacramentsService.findAll.mockResolvedValue([mockSacramentalRecord]);

      const result = await resolver.sacramentalRecords(filter);

      expect(mockSacramentsService.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual([mockSacramentalRecord]);
    });
  });

  describe('sacramentsByMember', () => {
    it('should return all sacramental records for a member', async () => {
      mockSacramentsService.findByMember.mockResolvedValue([
        mockSacramentalRecord,
      ]);

      const result = await resolver.sacramentsByMember('member-id');

      expect(mockSacramentsService.findByMember).toHaveBeenCalledWith(
        'member-id',
      );
      expect(result).toEqual([mockSacramentalRecord]);
    });
  });

  describe('updateSacramentalRecord', () => {
    it('should update a sacramental record', async () => {
      const updateInput: UpdateSacramentalRecordInput = {
        id: 'test-id',
        officiantName: 'Updated Priest',
        notes: 'Updated notes',
      };

      mockSacramentsService.update.mockResolvedValue({
        ...mockSacramentalRecord,
        officiantName: 'Updated Priest',
        notes: 'Updated notes',
      });

      const result = await resolver.updateSacramentalRecord(
        'test-id',
        updateInput,
      );

      expect(mockSacramentsService.update).toHaveBeenCalledWith(
        'test-id',
        updateInput,
      );
      expect(result.officiantName).toEqual('Updated Priest');
      expect(result.notes).toEqual('Updated notes');
    });
  });

  describe('deleteSacramentalRecord', () => {
    it('should delete a sacramental record and return true', async () => {
      mockSacramentsService.remove.mockResolvedValue(true);

      const result = await resolver.deleteSacramentalRecord('test-id');

      expect(mockSacramentsService.remove).toHaveBeenCalledWith('test-id');
      expect(result).toBe(true);
    });
  });

  describe('uploadSacramentalCertificate', () => {
    it('should upload a certificate and update the record', async () => {
      // Mock file upload
      const fileUpload: FileUpload = {
        filename: 'test-certificate.pdf',
        mimetype: 'application/pdf',
        encoding: '7bit',
        createReadStream: () => {
          const readable = new Readable();
          readable._read = () => {}; // Required implementation
          readable.push('mock file content');
          readable.push(null); // End of stream
          return readable;
        },
      };

      // Mock service response
      mockSacramentsService.uploadCertificate.mockResolvedValue({
        ...mockSacramentalRecord,
        certificateUrl: '/uploads/certificates/test-id/test-certificate.pdf',
      });

      const result = await resolver.uploadSacramentalCertificate(
        'test-id',
        fileUpload,
      );

      // Verify service was called with correct path
      expect(mockSacramentsService.uploadCertificate).toHaveBeenCalledWith(
        'test-id',
        expect.stringContaining('test-id'),
      );

      // Verify result has updated certificate URL
      expect(result.certificateUrl).toContain('test-certificate.pdf');
    });

    it('should throw an error for invalid file type', async () => {
      // Mock file upload with invalid mimetype
      const fileUpload: FileUpload = {
        filename: 'test-file.exe',
        mimetype: 'application/exe',
        encoding: '7bit',
        createReadStream: () => {
          const readable = new Readable();
          readable._read = () => {};
          readable.push('mock file content');
          readable.push(null);
          return readable;
        },
      };

      await expect(
        resolver.uploadSacramentalCertificate('test-id', fileUpload),
      ).rejects.toThrow(
        'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.',
      );
    });
  });
});
