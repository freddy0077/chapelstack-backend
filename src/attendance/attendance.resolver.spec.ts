import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceAlertsService } from './attendance-alerts.service';
import { AttendanceStatsService } from './attendance-stats.service';
import { CreateAttendanceSessionInput } from './dto/create-attendance-session.input';
import {
  RecordAttendanceInput,
  CheckInMethod,
} from './dto/record-attendance.input';
import { RecordBulkAttendanceInput } from './dto/record-bulk-attendance.input';
import { CheckOutInput } from './dto/check-out.input';
import { AttendanceFilterInput } from './dto/attendance-filter.input';
import {
  AttendanceStatsInput,
  AttendanceStatsPeriod,
  AttendanceStatsType,
} from './dto/attendance-stats.input';
import { AbsenceAlertConfigInput } from './dto/absence-alert-config.input';
import { CardScanInput } from './dto/card-scan.input';
import { GenerateQRTokenInput } from './dto/generate-qr-token.input';

describe('AttendanceResolver', () => {
  let resolver: AttendanceResolver;
  // These variables are used in the tests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: AttendanceService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let alertsService: AttendanceAlertsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let statsService: AttendanceStatsService;

  const mockAttendanceService = {
    createAttendanceSession: jest.fn(),
    findAllAttendanceSessions: jest.fn(),
    findAttendanceSessionById: jest.fn(),
    updateAttendanceSession: jest.fn(),
    deleteAttendanceSession: jest.fn(),
    recordAttendance: jest.fn(),
    recordBulkAttendance: jest.fn(),
    checkOut: jest.fn(),
    findAttendanceRecords: jest.fn(),
    findMemberAttendanceHistory: jest.fn(),
    generateQRToken: jest.fn(),
    validateQRToken: jest.fn(),
    processCardScan: jest.fn(),
  };

  const mockAttendanceAlertsService = {
    findAbsentMembers: jest.fn(),
    generateAbsenceAlerts: jest.fn(),
    scheduleAbsenceCheck: jest.fn(),
  };

  const mockAttendanceStatsService = {
    generateAttendanceStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceResolver,
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
        {
          provide: AttendanceAlertsService,
          useValue: mockAttendanceAlertsService,
        },
        {
          provide: AttendanceStatsService,
          useValue: mockAttendanceStatsService,
        },
      ],
    }).compile();

    resolver = module.get<AttendanceResolver>(AttendanceResolver);
    service = module.get<AttendanceService>(AttendanceService);
    alertsService = module.get<AttendanceAlertsService>(
      AttendanceAlertsService,
    );
    statsService = module.get<AttendanceStatsService>(AttendanceStatsService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
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

      mockAttendanceService.createAttendanceSession.mockResolvedValue(
        expectedSession,
      );

      const result = await resolver.createAttendanceSession(
        createAttendanceSessionInput,
      );

      expect(
        mockAttendanceService.createAttendanceSession,
      ).toHaveBeenCalledWith(createAttendanceSessionInput);
      expect(result).toEqual(expectedSession);
    });
  });

  describe('findAllAttendanceSessions', () => {
    it('should return all attendance sessions', async () => {
      const expectedSessions = [
        {
          id: 'session-id-1',
          name: 'Sunday Service',
          date: new Date(),
          startTime: new Date(),
          type: 'REGULAR_SERVICE',
          branchId: 'branch-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'session-id-2',
          name: 'Prayer Meeting',
          date: new Date(),
          startTime: new Date(),
          type: 'PRAYER_MEETING',
          branchId: 'branch-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAttendanceService.findAllAttendanceSessions.mockResolvedValue(
        expectedSessions,
      );

      const result = await resolver.findAllAttendanceSessions('branch-id');

      expect(
        mockAttendanceService.findAllAttendanceSessions,
      ).toHaveBeenCalledWith('branch-id');
      expect(result).toEqual(expectedSessions);
    });
  });

  describe('findAttendanceSessionById', () => {
    it('should return an attendance session by id', async () => {
      const expectedSession = {
        id: 'session-id',
        name: 'Sunday Service',
        date: new Date(),
        startTime: new Date(),
        type: 'REGULAR_SERVICE',
        branchId: 'branch-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAttendanceService.findAttendanceSessionById.mockResolvedValue(
        expectedSession,
      );

      const result = await resolver.findAttendanceSessionById('session-id');

      expect(
        mockAttendanceService.findAttendanceSessionById,
      ).toHaveBeenCalledWith('session-id');
      expect(result).toEqual(expectedSession);
    });
  });

  describe('recordAttendance', () => {
    it('should record attendance', async () => {
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

      mockAttendanceService.recordAttendance.mockResolvedValue(expectedRecord);

      const result = await resolver.recordAttendance(recordAttendanceInput);

      expect(mockAttendanceService.recordAttendance).toHaveBeenCalledWith(
        recordAttendanceInput,
      );
      expect(result).toEqual(expectedRecord);
    });
  });

  describe('recordBulkAttendance', () => {
    it('should record bulk attendance', async () => {
      const recordBulkAttendanceInput: RecordBulkAttendanceInput = {
        sessionId: 'session-id',
        headcount: 50,
      };

      mockAttendanceService.recordBulkAttendance.mockResolvedValue({
        success: true,
        count: 50,
      });

      const result = await resolver.recordBulkAttendance(
        recordBulkAttendanceInput,
      );

      expect(mockAttendanceService.recordBulkAttendance).toHaveBeenCalledWith(
        recordBulkAttendanceInput,
      );
      expect(result).toBe(true);
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

      mockAttendanceService.checkOut.mockResolvedValue(expectedRecord);

      const result = await resolver.checkOut(checkOutInput);

      expect(mockAttendanceService.checkOut).toHaveBeenCalledWith(
        checkOutInput,
      );
      expect(result).toEqual(expectedRecord);
    });
  });

  describe('findAttendanceRecords', () => {
    it('should return attendance records for a session', async () => {
      const filter: AttendanceFilterInput = {
        memberId: 'member-id',
      };

      const expectedRecords = [
        {
          id: 'record-id-1',
          sessionId: 'session-id',
          memberId: 'member-id',
          checkInTime: new Date(),
          checkInMethod: 'MANUAL',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAttendanceService.findAttendanceRecords.mockResolvedValue(
        expectedRecords,
      );

      const result = await resolver.findAttendanceRecords('session-id', filter);

      expect(mockAttendanceService.findAttendanceRecords).toHaveBeenCalledWith(
        'session-id',
        filter,
      );
      expect(result).toEqual(expectedRecords);
    });
  });

  describe('findMemberAttendanceHistory', () => {
    it('should return attendance history for a member', async () => {
      const expectedRecords = [
        {
          id: 'record-id-1',
          sessionId: 'session-id-1',
          memberId: 'member-id',
          checkInTime: new Date(),
          checkInMethod: 'MANUAL',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'record-id-2',
          sessionId: 'session-id-2',
          memberId: 'member-id',
          checkInTime: new Date(),
          checkInMethod: 'MANUAL',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAttendanceService.findMemberAttendanceHistory.mockResolvedValue(
        expectedRecords,
      );

      const result = await resolver.findMemberAttendanceHistory('member-id');

      expect(
        mockAttendanceService.findMemberAttendanceHistory,
      ).toHaveBeenCalledWith('member-id');
      expect(result).toEqual(expectedRecords);
    });
  });

  describe('getAttendanceStats', () => {
    it('should return attendance statistics', async () => {
      const statsInput: AttendanceStatsInput = {
        branchId: 'branch-id',
        statsTypes: [AttendanceStatsType.TOTAL_ATTENDANCE],
        period: AttendanceStatsPeriod.MONTHLY,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const expectedStats = {
        branchId: 'branch-id',
        statsTypes: [AttendanceStatsType.TOTAL_ATTENDANCE],
        period: AttendanceStatsPeriod.MONTHLY,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        data: [
          { period: '2023-01', value: 120 },
          { period: '2023-02', value: 150 },
        ],
      };

      mockAttendanceStatsService.generateAttendanceStats.mockResolvedValue(
        expectedStats,
      );

      const result = await resolver.getAttendanceStats(statsInput);

      expect(
        mockAttendanceStatsService.generateAttendanceStats,
      ).toHaveBeenCalledWith(statsInput);
      expect(result).toEqual(expectedStats);
    });
  });

  describe('findAbsentMembers', () => {
    it('should find absent members based on config', async () => {
      const alertConfig: AbsenceAlertConfigInput = {
        branchId: 'branch-id',
        absenceThresholdDays: 30,
        sendEmailAlerts: true,
        sendSmsAlerts: false,
      };

      const expectedResult = {
        branchId: 'branch-id',
        absentMembersCount: 5,
        absentMembers: [
          {
            id: 'member-1',
            name: 'John Doe',
            lastAttendance: new Date('2023-01-01'),
          },
          {
            id: 'member-2',
            name: 'Jane Smith',
            lastAttendance: new Date('2023-01-15'),
          },
        ],
        notificationsSent: false,
      };

      mockAttendanceAlertsService.findAbsentMembers.mockResolvedValue(
        expectedResult,
      );

      const result = await resolver.findAbsentMembers(alertConfig);

      expect(
        mockAttendanceAlertsService.findAbsentMembers,
      ).toHaveBeenCalledWith(alertConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('generateAbsenceAlerts', () => {
    it('should generate absence alerts based on config', async () => {
      const alertConfig: AbsenceAlertConfigInput = {
        branchId: 'branch-id',
        absenceThresholdDays: 30,
        sendEmailAlerts: true,
        sendSmsAlerts: false,
      };

      const expectedResult = {
        branchId: 'branch-id',
        absentMembersCount: 5,
        absentMembers: [
          {
            id: 'member-1',
            name: 'John Doe',
            lastAttendance: new Date('2023-01-01'),
          },
          {
            id: 'member-2',
            name: 'Jane Smith',
            lastAttendance: new Date('2023-01-15'),
          },
        ],
        notificationsSent: true,
      };

      mockAttendanceAlertsService.generateAbsenceAlerts.mockResolvedValue(
        expectedResult,
      );

      const result = await resolver.generateAbsenceAlerts(alertConfig);

      expect(
        mockAttendanceAlertsService.generateAbsenceAlerts,
      ).toHaveBeenCalledWith(alertConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('scheduleAbsenceCheck', () => {
    it('should schedule absence check based on config', async () => {
      const input: AbsenceAlertConfigInput = {
        branchId: 'branch-id',
        absenceThresholdDays: 30,
        sendEmailAlerts: true,
        sendSmsAlerts: false,
      };

      const result = { scheduled: true };

      mockAttendanceAlertsService.scheduleAbsenceCheck.mockResolvedValue(
        result,
      );

      expect(await resolver.scheduleAbsenceCheck(input)).toEqual(result);
      expect(
        mockAttendanceAlertsService.scheduleAbsenceCheck,
      ).toHaveBeenCalledWith(input);
      expect(result).toEqual(result);
    });
  });

  describe('processCardScan', () => {
    it('should process card scan and record attendance', async () => {
      const input: CardScanInput = {
        sessionId: 'session-id',
        cardId: 'rfid-123',
        scanMethod: CheckInMethod.RFID,
        scanTime: new Date(),
        branchId: 'branch-id',
      };

      const attendanceRecord = {
        id: 'record-id',
        checkInTime: input.scanTime,
        checkInMethod: input.scanMethod,
        sessionId: input.sessionId,
        memberId: 'member-id',
        member: {
          id: 'member-id',
          firstName: 'John',
          lastName: 'Doe',
        },
        session: {
          id: 'session-id',
          name: 'Sunday Service',
        },
      };

      mockAttendanceService.processCardScan.mockResolvedValue(attendanceRecord);

      expect(await resolver.processCardScan(input)).toEqual(attendanceRecord);
      expect(mockAttendanceService.processCardScan).toHaveBeenCalledWith(input);
    });
  });
});
