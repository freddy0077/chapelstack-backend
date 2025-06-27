import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAttendanceSessionInput } from './dto/create-attendance-session.input';
import { RecordAttendanceInput } from './dto/record-attendance.input';
import { CheckOutInput } from './dto/check-out.input';
import { CardScanInput } from './dto/card-scan.input';
import { CheckInMethod } from './dto/record-attendance.input';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    branch: {
      findUnique: jest.fn(),
    },
    attendanceSession: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    attendanceRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    qRCodeToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAttendanceSession', () => {
    it('should create an attendance session', async () => {
      const createAttendanceSessionInput: CreateAttendanceSessionInput = {
        name: 'Sunday Service',
        date: new Date(),
        startTime: new Date(),
        type: 'REGULAR_SERVICE',
        branchId: 'branch-id',
      };

      const expectedSession = {
        id: 'session-id',
        ...createAttendanceSessionInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.branch.findUnique.mockResolvedValue({
        id: 'branch-id',
        name: 'Main Branch',
      });
      mockPrismaService.attendanceSession.create.mockResolvedValue(
        expectedSession,
      );

      const result = await service.createAttendanceSession(
        createAttendanceSessionInput,
      );

      expect(mockPrismaService.branch.findUnique).toHaveBeenCalledWith({
        where: { id: createAttendanceSessionInput.branchId },
      });
      expect(mockPrismaService.attendanceSession.create).toHaveBeenCalled();
      expect(result).toEqual(expectedSession);
    });

    it('should throw NotFoundException if branch not found', async () => {
      const createAttendanceSessionInput: CreateAttendanceSessionInput = {
        name: 'Sunday Service',
        date: new Date(),
        startTime: new Date(),
        type: 'REGULAR_SERVICE',
        branchId: 'non-existent-branch-id',
      };

      mockPrismaService.branch.findUnique.mockResolvedValue(null);

      await expect(
        service.createAttendanceSession(createAttendanceSessionInput),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordAttendance', () => {
    it('should record attendance for a member', async () => {
      const recordAttendanceInput: RecordAttendanceInput = {
        sessionId: 'session-id',
        memberId: 'member-id',
        checkInMethod: 'MANUAL',
      };

      const expectedRecord = {
        id: 'record-id',
        ...recordAttendanceInput,
        checkInTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.attendanceSession.findUnique.mockResolvedValue({
        id: 'session-id',
        name: 'Sunday Service',
        branchId: 'branch-id',
      });
      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 'member-id',
        firstName: 'John',
        lastName: 'Doe',
      });
      mockPrismaService.attendanceRecord.create.mockResolvedValue(
        expectedRecord,
      );

      const result = await service.recordAttendance(recordAttendanceInput);

      expect(
        mockPrismaService.attendanceSession.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: recordAttendanceInput.sessionId },
      });
      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id: recordAttendanceInput.memberId },
      });
      expect(mockPrismaService.attendanceRecord.create).toHaveBeenCalled();
      expect(result).toEqual(expectedRecord);
    });

    it('should record attendance for a visitor', async () => {
      const recordAttendanceInput: RecordAttendanceInput = {
        sessionId: 'session-id',
        visitorName: 'Jane Smith',
        visitorEmail: 'jane@example.com',
        checkInMethod: 'MANUAL',
      };

      const expectedRecord = {
        id: 'record-id',
        ...recordAttendanceInput,
        checkInTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.attendanceSession.findUnique.mockResolvedValue({
        id: 'session-id',
        name: 'Sunday Service',
        branchId: 'branch-id',
      });
      mockPrismaService.attendanceRecord.create.mockResolvedValue(
        expectedRecord,
      );

      const result = await service.recordAttendance(recordAttendanceInput);

      expect(
        mockPrismaService.attendanceSession.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: recordAttendanceInput.sessionId },
      });
      expect(mockPrismaService.attendanceRecord.create).toHaveBeenCalled();
      expect(result).toEqual(expectedRecord);
    });

    it('should throw BadRequestException if neither memberId nor visitorName is provided', async () => {
      const recordAttendanceInput: RecordAttendanceInput = {
        sessionId: 'session-id',
        checkInMethod: 'MANUAL',
      };

      mockPrismaService.attendanceSession.findUnique.mockResolvedValue({
        id: 'session-id',
        name: 'Sunday Service',
      });

      await expect(
        service.recordAttendance(recordAttendanceInput),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkOut', () => {
    it('should check out an attendee', async () => {
      const checkOutInput: CheckOutInput = {
        recordId: 'record-id',
        checkOutTime: new Date(),
      };

      const expectedRecord = {
        id: 'record-id',
        checkInTime: new Date(),
        checkOutTime: checkOutInput.checkOutTime,
        updatedAt: new Date(),
      };

      mockPrismaService.attendanceRecord.findUnique.mockResolvedValue({
        id: 'record-id',
        checkInTime: new Date(),
      });
      mockPrismaService.attendanceRecord.update.mockResolvedValue(
        expectedRecord,
      );

      const result = await service.checkOut(checkOutInput);

      expect(
        mockPrismaService.attendanceRecord.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: checkOutInput.recordId },
      });
      expect(mockPrismaService.attendanceRecord.update).toHaveBeenCalledWith({
        where: { id: checkOutInput.recordId },
        data: { checkOutTime: checkOutInput.checkOutTime },
      });
      expect(result).toEqual(expectedRecord);
    });

    it('should throw NotFoundException if attendance record not found', async () => {
      const checkOutInput: CheckOutInput = {
        recordId: 'non-existent-record-id',
      };

      mockPrismaService.attendanceRecord.findUnique.mockResolvedValue(null);

      await expect(service.checkOut(checkOutInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('processCardScan', () => {
    it('should check in a member using RFID card', async () => {
      const cardScanInput: CardScanInput = {
        sessionId: 'session-id',
        cardId: 'rfid-123',
        scanMethod: CheckInMethod.RFID,
        scanTime: new Date(),
      };

      const member = {
        id: 'member-id',
        firstName: 'John',
        lastName: 'Doe',
        rfidCardId: 'rfid-123',
      };

      const session = {
        id: 'session-id',
        name: 'Sunday Service',
        branchId: 'branch-id',
      };

      const expectedRecord = {
        id: 'record-id',
        checkInTime: cardScanInput.scanTime,
        checkInMethod: CheckInMethod.RFID,
        memberId: member.id,
        sessionId: session.id,
        branchId: session.branchId,
        member,
        session,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.attendanceSession.findUnique.mockResolvedValue(session);
      mockPrismaService.member.findFirst.mockResolvedValue(member);
      mockPrismaService.attendanceRecord.findFirst.mockResolvedValue(null);
      mockPrismaService.attendanceRecord.create.mockResolvedValue(
        expectedRecord,
      );

      const result = await service.processCardScan(cardScanInput);

      expect(
        mockPrismaService.attendanceSession.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: cardScanInput.sessionId },
      });
      expect(mockPrismaService.member.findFirst).toHaveBeenCalledWith({
        where: { rfidCardId: cardScanInput.cardId },
      });
      expect(mockPrismaService.attendanceRecord.findFirst).toHaveBeenCalledWith(
        {
          where: {
            sessionId: cardScanInput.sessionId,
            memberId: member.id,
          },
        },
      );
      expect(mockPrismaService.attendanceRecord.create).toHaveBeenCalled();
      expect(result).toEqual(expectedRecord);
    });

    it('should check out a member when scanning card a second time', async () => {
      const cardScanInput: CardScanInput = {
        sessionId: 'session-id',
        cardId: 'rfid-123',
        scanMethod: CheckInMethod.RFID,
        scanTime: new Date(),
      };

      const member = {
        id: 'member-id',
        firstName: 'John',
        lastName: 'Doe',
        rfidCardId: 'rfid-123',
      };

      const session = {
        id: 'session-id',
        name: 'Sunday Service',
        branchId: 'branch-id',
      };

      const existingRecord = {
        id: 'record-id',
        checkInTime: new Date(Date.now() - 3600000), // 1 hour ago
        checkInMethod: CheckInMethod.RFID,
        memberId: member.id,
        sessionId: session.id,
        branchId: session.branchId,
      };

      const updatedRecord = {
        ...existingRecord,
        checkOutTime: cardScanInput.scanTime,
        updatedAt: new Date(),
        member,
        session,
      };

      mockPrismaService.attendanceSession.findUnique.mockResolvedValue(session);
      mockPrismaService.member.findFirst.mockResolvedValue(member);
      mockPrismaService.attendanceRecord.findFirst.mockResolvedValue(
        existingRecord,
      );
      mockPrismaService.attendanceRecord.update.mockResolvedValue(
        updatedRecord,
      );

      const result = await service.processCardScan(cardScanInput);

      expect(
        mockPrismaService.attendanceSession.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: cardScanInput.sessionId },
      });
      expect(mockPrismaService.member.findFirst).toHaveBeenCalledWith({
        where: { rfidCardId: cardScanInput.cardId },
      });
      expect(mockPrismaService.attendanceRecord.findFirst).toHaveBeenCalledWith(
        {
          where: {
            sessionId: cardScanInput.sessionId,
            memberId: member.id,
          },
        },
      );
      expect(mockPrismaService.attendanceRecord.update).toHaveBeenCalledWith({
        where: { id: existingRecord.id },
        data: {
          checkOutTime: cardScanInput.scanTime,
          updatedAt: expect.any(Date),
        },
        include: {
          member: true,
          session: true,
        },
      });
      expect(result).toEqual(updatedRecord);
    });

    it('should throw BadRequestException when member already checked in and out', async () => {
      const cardScanInput: CardScanInput = {
        sessionId: 'session-id',
        cardId: 'rfid-123',
        scanMethod: CheckInMethod.RFID,
      };

      const member = {
        id: 'member-id',
        firstName: 'John',
        lastName: 'Doe',
        rfidCardId: 'rfid-123',
      };

      const existingRecord = {
        id: 'record-id',
        checkInTime: new Date(Date.now() - 7200000), // 2 hours ago
        checkOutTime: new Date(Date.now() - 3600000), // 1 hour ago
        memberId: member.id,
        sessionId: cardScanInput.sessionId,
      };

      mockPrismaService.attendanceSession.findUnique.mockResolvedValue({
        id: 'session-id',
        name: 'Sunday Service',
      });
      mockPrismaService.member.findFirst.mockResolvedValue(member);
      mockPrismaService.attendanceRecord.findFirst.mockResolvedValue(
        existingRecord,
      );

      await expect(service.processCardScan(cardScanInput)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      const cardScanInput: CardScanInput = {
        sessionId: 'non-existent-session-id',
        cardId: 'rfid-123',
        scanMethod: CheckInMethod.RFID,
      };

      mockPrismaService.attendanceSession.findUnique.mockResolvedValue(null);

      await expect(service.processCardScan(cardScanInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when member not found by card ID', async () => {
      const cardScanInput: CardScanInput = {
        sessionId: 'session-id',
        cardId: 'non-existent-card-id',
        scanMethod: CheckInMethod.RFID,
      };

      mockPrismaService.attendanceSession.findUnique.mockResolvedValue({
        id: 'session-id',
        name: 'Sunday Service',
      });
      mockPrismaService.member.findFirst.mockResolvedValue(null);

      await expect(service.processCardScan(cardScanInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
