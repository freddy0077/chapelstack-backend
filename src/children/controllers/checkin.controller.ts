import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CheckinService } from '../services/checkin.service';
import { CheckInRecord } from '../entities/check-in-record.entity';
import { CheckInInput } from '../dto/check-in.input';
import { CheckOutInput } from '../dto/check-out.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('checkin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('check-in')
  @RequirePermissions({ action: 'create', subject: 'CheckInRecord' })
  checkIn(@Body() checkInInput: CheckInInput): Promise<CheckInRecord> {
    return this.checkinService.checkIn(checkInInput);
  }

  @Post('check-out')
  @RequirePermissions({ action: 'update', subject: 'CheckInRecord' })
  checkOut(@Body() checkOutInput: CheckOutInput): Promise<CheckInRecord> {
    return this.checkinService.checkOut(checkOutInput);
  }

  @Get('active')
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  findActiveCheckIns(
    @Query('branchId') branchId: string,
    @Query('eventId') eventId?: string,
  ): Promise<CheckInRecord[]> {
    return this.checkinService.findActiveCheckIns(branchId, eventId);
  }

  @Get('history')
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  findCheckInHistory(
    @Query('branchId') branchId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('childId') childId?: string,
    @Query('eventId') eventId?: string,
  ): Promise<CheckInRecord[]> {
    return this.checkinService.findCheckInHistory(
      branchId,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
      childId,
      eventId,
    );
  }

  @Get('stats/:branchId')
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  getCheckInStats(
    @Param('branchId') branchId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<any> {
    return this.checkinService.getCheckInStats(
      branchId,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }
}
