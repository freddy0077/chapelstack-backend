import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceStatsService } from './attendance-stats.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AttendanceStatsPeriod,
  AttendanceStatsType,
} from './dto/attendance-stats.input';

describe('AttendanceStatsService', () => {
  let service: AttendanceStatsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceStatsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttendanceStatsService>(AttendanceStatsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAttendanceStats', () => {
    const mockStatsInput = {
      branchId: 'branch-123',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      period: AttendanceStatsPeriod.MONTHLY,
      statsTypes: [AttendanceStatsType.TOTAL_ATTENDANCE],
    };

    const mockTotalAttendanceResult = [
      { period: '2023-01', total: 120 },
      { period: '2023-02', total: 135 },
    ];

    it('should generate total attendance stats', async function (this: void) {
      mockPrismaService.$queryRaw.mockResolvedValueOnce(
        mockTotalAttendanceResult,
      );

      const result = await service.generateAttendanceStats(mockStatsInput);

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('TOTAL_ATTENDANCE');
      expect(result.TOTAL_ATTENDANCE).toEqual(mockTotalAttendanceResult);
      expect(result['branchId']).toEqual(mockStatsInput.branchId);
    });

    it('should generate multiple stat types when requested', async function (this: void) {
      const multipleStatsInput = {
        ...mockStatsInput,
        statsTypes: [
          AttendanceStatsType.TOTAL_ATTENDANCE,
          AttendanceStatsType.UNIQUE_MEMBERS,
        ],
      };

      const mockUniqueMembersResult = [
        { period: '2023-01', unique_members: 80 },
        { period: '2023-02', unique_members: 90 },
      ];

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce(mockTotalAttendanceResult)
        .mockResolvedValueOnce(mockUniqueMembersResult);

      const result = await service.generateAttendanceStats(multipleStatsInput);

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('TOTAL_ATTENDANCE');
      expect(result).toHaveProperty('UNIQUE_MEMBERS');
      expect(result.TOTAL_ATTENDANCE).toEqual(mockTotalAttendanceResult);
      expect(result['UNIQUE_MEMBERS']).toEqual(mockUniqueMembersResult);
    });

    it('should handle different period types', async function (this: void) {
      const weeklyStatsInput = {
        ...mockStatsInput,
        period: AttendanceStatsPeriod.WEEKLY,
      };

      const mockWeeklyResult = [
        { period: '2023-W01', total: 30 },
        { period: '2023-W02', total: 35 },
      ];

      mockPrismaService.$queryRaw.mockResolvedValueOnce(mockWeeklyResult);

      const result = await service.generateAttendanceStats(weeklyStatsInput);

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result['TOTAL_ATTENDANCE']).toEqual(mockWeeklyResult);
    });
  });
});
