import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { AttendanceService } from './attendance.service';
import { AttendanceAlertsService } from './attendance-alerts.service';
import { AttendanceStatsService } from './attendance-stats.service';
import { AttendanceSession } from './entities/attendance-session.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { QRCodeToken } from './entities/qr-code-token.entity';
import { AttendanceStats } from './entities/attendance-stats.entity';
import { AbsenceAlertResult } from './entities/absence-alert.entity';
import { CreateAttendanceSessionInput } from './dto/create-attendance-session.input';
import { UpdateAttendanceSessionInput } from './dto/update-attendance-session.input';
import { RecordAttendanceInput } from './dto/record-attendance.input';
import { RecordBulkAttendanceInput } from './dto/record-bulk-attendance.input';
import { CheckOutInput } from './dto/check-out.input';
import { AttendanceFilterInput } from './dto/attendance-filter.input';
import { GenerateQRTokenInput } from './dto/generate-qr-token.input';
import { AttendanceStatsInput } from './dto/attendance-stats.input';
import { AbsenceAlertConfigInput } from './dto/absence-alert-config.input';
import { CardScanInput } from './dto/card-scan.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

@Resolver(() => AttendanceSession)
export class AttendanceResolver {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceAlertsService: AttendanceAlertsService,
    private readonly attendanceStatsService: AttendanceStatsService,
  ) {}

  @Mutation(() => AttendanceSession)
  async createAttendanceSession(
    @Args('input') createAttendanceSessionInput: CreateAttendanceSessionInput,
  ) {
    return this.attendanceService.createAttendanceSession(
      createAttendanceSessionInput,
    );
  }

  @Query(() => [AttendanceSession], { name: 'attendanceSessions' })
  async findAllAttendanceSessions(
    @Args('organisationId', { type: () => ID, nullable: true }) organisationId?: string,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ) {
    return this.attendanceService.findAllAttendanceSessions({
      branchId,
      organisationId,
    });
  }

  @Query(() => AttendanceSession, { name: 'attendanceSession' })
  async findAttendanceSessionById(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ) {
    return this.attendanceService.findAttendanceSessionById(id);
  }

  @Mutation(() => AttendanceSession)
  async updateAttendanceSession(
    @Args('input') updateAttendanceSessionInput: UpdateAttendanceSessionInput,
  ) {
    return this.attendanceService.updateAttendanceSession(
      updateAttendanceSessionInput,
    );
  }

  @Mutation(() => AttendanceSession)
  async deleteAttendanceSession(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ) {
    return this.attendanceService.deleteAttendanceSession(id);
  }

  @Mutation(() => AttendanceRecord)
  async recordAttendance(
    @Args('input') recordAttendanceInput: RecordAttendanceInput,
  ) {
    return this.attendanceService.recordAttendance(recordAttendanceInput);
  }

  @Mutation(() => Boolean)
  async recordBulkAttendance(
    @Args('input') recordBulkAttendanceInput: RecordBulkAttendanceInput,
  ) {
    const result = await this.attendanceService.recordBulkAttendance(
      recordBulkAttendanceInput,
    );
    return result.success;
  }

  @Mutation(() => AttendanceRecord)
  async checkOut(@Args('input') checkOutInput: CheckOutInput) {
    return this.attendanceService.checkOut(checkOutInput);
  }

  @Query(() => [AttendanceRecord], { name: 'attendanceRecords' })
  async findAttendanceRecords(
    @Args('sessionId', { type: () => ID }, ParseUUIDPipe) sessionId: string,
    @Args('filter', { nullable: true }) filter?: AttendanceFilterInput,
  ) {
    return this.attendanceService.findAttendanceRecords(sessionId, filter);
  }

  @Query(() => [AttendanceRecord], { name: 'memberAttendanceHistory' })
  async findMemberAttendanceHistory(
    @Args('memberId', { type: () => ID }, ParseUUIDPipe) memberId: string,
  ) {
    return this.attendanceService.findMemberAttendanceHistory(memberId);
  }

  @Mutation(() => QRCodeToken)
  async generateQRToken(
    @Args('input') generateQRTokenInput: GenerateQRTokenInput,
  ) {
    return this.attendanceService.generateQRToken(generateQRTokenInput);
  }

  @Mutation(() => AttendanceRecord)
  async processCardScan(@Args('input') input: CardScanInput) {
    const result = await this.attendanceService.processCardScan(input);
    return result;
  }

  @Query(() => AttendanceSession, { name: 'validateQRToken' })
  async validateQRToken(@Args('token') token: string) {
    return this.attendanceService.validateQRToken(token);
  }

  @Query(() => AttendanceStats, { name: 'attendanceStats' })
  async getAttendanceStats(@Args('input') input: AttendanceStatsInput) {
    if (!input.startDate || !input.endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    return this.attendanceStatsService.generateAttendanceStats(input);
  }

  @Query(() => AbsenceAlertResult, { name: 'findAbsentMembers' })
  async findAbsentMembers(@Args('input') input: AbsenceAlertConfigInput) {
    return this.attendanceAlertsService.findAbsentMembers(input);
  }

  @Mutation(() => AbsenceAlertResult)
  async generateAbsenceAlerts(@Args('input') input: AbsenceAlertConfigInput) {
    return this.attendanceAlertsService.generateAbsenceAlerts(input);
  }

  @Mutation(() => AbsenceAlertResult)
  async scheduleAbsenceCheck(@Args('input') input: AbsenceAlertConfigInput) {
    return this.attendanceAlertsService.scheduleAbsenceCheck(input);
  }
}
