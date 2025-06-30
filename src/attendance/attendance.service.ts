import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateAttendanceSessionInput,
  SessionStatus,
} from './dto/create-attendance-session.input';
import { UpdateAttendanceSessionInput } from './dto/update-attendance-session.input';
import { RecordAttendanceInput } from './dto/record-attendance.input';
import { RecordBulkAttendanceInput } from './dto/record-bulk-attendance.input';
import { CheckOutInput } from './dto/check-out.input';
import { AttendanceFilterInput } from './dto/attendance-filter.input';
import { GenerateQRTokenInput } from './dto/generate-qr-token.input';
import { CardScanInput } from './dto/card-scan.input';
import { randomBytes } from 'crypto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async createAttendanceSession(data: CreateAttendanceSessionInput) {
    const { branchId, organisationId, ...restData } = data;

    // Validate Organisation, which is now mandatory
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });
    if (!organisation) {
      throw new NotFoundException(
        `Organisation with ID ${organisationId} not found`,
      );
    }

    const createData: Prisma.AttendanceSessionCreateInput = {
      ...restData,
      status: data.status || SessionStatus.PLANNED,
      organisation: { connect: { id: organisationId } },
    };

    // If branchId is provided, validate it and its association with the organisation
    if (branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found`);
      }
      if (branch.organisationId !== organisationId) {
        throw new BadRequestException(
          `Branch with ID ${branchId} does not belong to organisation with ID ${organisationId}`,
        );
      }
      createData.branch = { connect: { id: branchId } };
    }

    return this.prisma.attendanceSession.create({
      data: createData,
    });
  }

  async findAllAttendanceSessions(params: {
    branchId?: string;
    organisationId?: string;
  }) {
    const where: Prisma.AttendanceSessionWhereInput = {};

    if (params.branchId) {
      where.branchId = params.branchId;
    } else if (params.organisationId) {
      where.organisationId = params.organisationId;
    }

    return await this.prisma.attendanceSession.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findAttendanceSessionById(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        attendanceRecords: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Attendance session with ID ${id} not found`);
    }

    return session;
  }

  async updateAttendanceSession(data: UpdateAttendanceSessionInput) {
    // Check if session exists
    const existingSession = await this.prisma.attendanceSession.findUnique({
      where: { id: data.id },
    });

    if (!existingSession) {
      throw new NotFoundException(
        `Attendance session with ID ${data.id} not found`,
      );
    }

    // If branchId is provided, validate branch exists
    if (data.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: data.branchId },
      });

      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${data.branchId} not found`,
        );
      }
    }

    return this.prisma.attendanceSession.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        status: data.status,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        branchId: data.branchId,
      },
    });
  }

  async deleteAttendanceSession(id: string) {
    // Check if session exists
    const existingSession = await this.prisma.attendanceSession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      throw new NotFoundException(`Attendance session with ID ${id} not found`);
    }

    return this.prisma.attendanceSession.delete({
      where: { id },
    });
  }

  async recordAttendance(data: RecordAttendanceInput) {
    // Validate session exists
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Attendance session with ID ${data.sessionId} not found`,
      );
    }
    if (!session.organisationId) {
      throw new BadRequestException(
        `Attendance session with ID ${data.sessionId} does not have an associated organisationId`,
      );
    }

    // If memberId is provided, validate member exists
    if (data.memberId) {
      const member = await this.prisma.member.findUnique({
        where: { id: data.memberId },
      });

      if (!member) {
        throw new NotFoundException(
          `Member with ID ${data.memberId} not found`,
        );
      }
    } else if (!data.visitorName) {
      // Either memberId or visitorName must be provided
      throw new BadRequestException(
        'Either memberId or visitorName must be provided',
      );
    }

    return this.prisma.attendanceRecord.create({
      data: {
        checkInTime: data.checkInTime || new Date(),
        checkInMethod: data.checkInMethod,
        notes: data.notes,
        session: {
          connect: {
            id: data.sessionId,
          },
        },
        member: data.memberId
          ? {
              connect: {
                id: data.memberId,
              },
            }
          : undefined,
        visitorName: data.visitorName,
        visitorEmail: data.visitorEmail,
        visitorPhone: data.visitorPhone,
        branch:
          data.branchId || (session.branchId && session.branchId !== null)
            ? { connect: { id: data.branchId || (session.branchId as string) } }
            : undefined,
        recordedBy: data.recordedById
          ? { connect: { id: data.recordedById } }
          : undefined,
        organisation: { connect: { id: session.organisationId! } },
      },
      include: {
        member: true,
        session: true,
        recordedBy: true,
        branch: true,
      },
    });
  }

  async recordBulkAttendance(data: RecordBulkAttendanceInput) {
    // Validate session exists
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Attendance session with ID ${data.sessionId} not found`,
      );
    }
    if (!session.organisationId) {
      throw new BadRequestException(
        `Attendance session with ID ${data.sessionId} does not have an associated organisationId`,
      );
    }

    // Handle individual attendance records if provided
    if (data.attendanceRecords && data.attendanceRecords.length > 0) {
      const records = await Promise.all(
        data.attendanceRecords.map((record) =>
          this.recordAttendance({
            ...record,
            sessionId: data.sessionId,
            branchId: data.branchId || (session.branchId as string | undefined),
          }),
        ),
      );

      return {
        success: true,
        count: records.length,
        records,
      };
    }

    // Handle headcount if provided
    if (data.headcount !== undefined && data.headcount > 0) {
      // Create a single record with the headcount
      const headcountBranchId = data.branchId || session.branchId;
      const headcountRecordedById = data.recordedById; // Assuming recordedById might be on RecordBulkAttendanceInput

      const summaryRecord = await this.prisma.attendanceRecord.create({
        data: {
          checkInTime: new Date(),
          checkInMethod: 'MANUAL',
          notes: `Headcount: ${data.headcount} attendees`,
          session: {
            connect: {
              id: data.sessionId,
            },
          },
          branch: headcountBranchId
            ? { connect: { id: headcountBranchId } }
            : undefined,
          recordedBy: headcountRecordedById
            ? { connect: { id: headcountRecordedById } }
            : undefined,
          organisation: { connect: { id: session.organisationId! } },
        },
        include: {
          session: true,
          branch: true,
          recordedBy: true,
          // member will be null for headcount records, but including it for consistency
          member: true,
        },
      });

      return {
        success: true,
        count: data.headcount, // This count refers to the headcount number itself
        records: [summaryRecord], // Return the created summary record in an array
      };
    }

    throw new BadRequestException(
      'Either attendanceRecords or headcount must be provided',
    );
  }

  async checkOut(data: CheckOutInput) {
    // Validate attendance record exists
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: data.recordId },
    });

    if (!record) {
      throw new NotFoundException(
        `Attendance record with ID ${data.recordId} not found`,
      );
    }

    return this.prisma.attendanceRecord.update({
      where: { id: data.recordId },
      data: {
        checkOutTime: data.checkOutTime || new Date(),
      },
      include: {
        member: true,
        session: true,
        recordedBy: true,
        branch: true,
      },
    });
  }

  async findAttendanceRecords(
    sessionId: string,
    filter?: AttendanceFilterInput,
  ) {
    // Validate session exists
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Attendance session with ID ${sessionId} not found`,
      );
    }

    // Build filter conditions
    const where: any = {
      sessionId,
    };

    if (filter) {
      if (filter.memberId) {
        where.memberId = filter.memberId;
      }

      if (filter.checkInMethod) {
        where.checkInMethod = filter.checkInMethod;
      }

      if (filter.branchId) {
        where.branchId = filter.branchId;
      }

      if (filter.visitorNameContains) {
        where.visitorName = {
          contains: filter.visitorNameContains,
          mode: 'insensitive',
        };
      }

      if (filter.startDate || filter.endDate) {
        where.checkInTime = {};

        if (filter.startDate) {
          where.checkInTime.gte = filter.startDate;
        }

        if (filter.endDate) {
          where.checkInTime.lte = filter.endDate;
        }
      }
    }

    return this.prisma.attendanceRecord.findMany({
      where,
      include: {
        member: true,
        session: true,
        recordedBy: true,
        branch: true,
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });
  }

  async findMemberAttendanceHistory(memberId: string) {
    // Validate member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.prisma.attendanceRecord.findMany({
      where: {
        memberId,
      },
      include: {
        session: true,
        member: true,
        recordedBy: true,
        branch: true,
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });
  }

  async generateQRToken(data: GenerateQRTokenInput) {
    // Validate session exists
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Attendance session with ID ${data.sessionId} not found`,
      );
    }

    // Generate a random token
    const token = randomBytes(16).toString('hex');

    // Calculate expiry time
    const expiresInMinutes = data.expiresInMinutes || 60;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    return this.prisma.qRCodeToken.create({
      data: {
        token,
        session: {
          connect: {
            id: data.sessionId,
          },
        },
        expiresAt,
      },
    });
  }

  async validateQRToken(token: string) {
    const qrToken = await this.prisma.qRCodeToken.findUnique({
      where: { token },
      include: {
        session: true,
      },
    });

    if (!qrToken) {
      throw new NotFoundException('Invalid QR code token');
    }

    if (qrToken.expiresAt < new Date()) {
      throw new BadRequestException('QR code token has expired');
    }

    return qrToken.session;
  }

  async processCardScan(data: CardScanInput) {
    // Validate session exists
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Attendance session with ID ${data.sessionId} not found`,
      );
    }
    if (!session.organisationId) {
      throw new BadRequestException(
        `Attendance session with ID ${data.sessionId} does not have an associated organisationId`,
      );
    }

    // Find member by RFID/NFC card ID
    const member = await this.prisma.member.findFirst({
      where: { rfidCardId: data.cardId },
    });

    if (!member) {
      throw new NotFoundException(
        `No member found with card ID ${data.cardId}`,
      );
    }

    // Check if member is already checked in for this session
    const existingRecord = await this.prisma.attendanceRecord.findFirst({
      where: {
        sessionId: data.sessionId,
        memberId: member.id,
      },
    });

    if (existingRecord) {
      // If already checked in, update the check-out time instead
      if (!existingRecord.checkOutTime) {
        return this.prisma.attendanceRecord.update({
          where: { id: existingRecord.id },
          data: {
            checkOutTime: data.scanTime || new Date(),
            updatedAt: new Date(),
          },
          include: {
            member: true,
            session: true,
            recordedBy: true,
            branch: true,
          },
        });
      } else {
        throw new BadRequestException(
          `Member ${member.firstName} ${member.lastName} has already checked in and out for this session`,
        );
      }
    }

    // Create new attendance record
    return this.prisma.attendanceRecord.create({
      data: {
        checkInTime: data.scanTime || new Date(),
        checkInMethod: data.scanMethod,
        notes: data.notes,
        session: {
          connect: {
            id: data.sessionId,
          },
        },
        member: {
          connect: {
            id: member.id,
          },
        },
        branch: data.branchId
          ? { connect: { id: data.branchId } }
          : session.branchId
            ? { connect: { id: session.branchId } }
            : undefined,
        recordedBy: data.recordedById
          ? { connect: { id: data.recordedById } }
          : undefined,
        organisation: { connect: { id: session.organisationId! } },
      },
      include: {
        member: true,
        session: true,
        recordedBy: true,
        branch: true,
      },
    });
  }
}
