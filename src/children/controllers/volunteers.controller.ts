import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VolunteersService } from '../services/volunteers.service';
import { ChildrenMinistryVolunteer } from '../entities/children-ministry-volunteer.entity';
import { CreateVolunteerInput } from '../dto/create-volunteer.input';
import { UpdateVolunteerInput } from '../dto/update-volunteer.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('children-volunteers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post()
  @RequirePermissions({
    action: 'create',
    subject: 'ChildrenMinistryVolunteer',
  })
  create(
    @Body() createVolunteerInput: CreateVolunteerInput,
  ): Promise<ChildrenMinistryVolunteer> {
    return this.volunteersService.create(createVolunteerInput);
  }

  @Get()
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('trainingCompleted') trainingCompleted?: boolean,
  ): Promise<ChildrenMinistryVolunteer[]> {
    return this.volunteersService.findAll(
      branchId,
      trainingCompleted !== undefined ? trainingCompleted === true : undefined,
    );
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  findOne(@Param('id') id: string): Promise<ChildrenMinistryVolunteer> {
    return this.volunteersService.findOne(id);
  }

  @Get('by-member/:memberId')
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  findByMember(
    @Param('memberId') memberId: string,
  ): Promise<ChildrenMinistryVolunteer | null> {
    return this.volunteersService.findByMember(memberId);
  }

  @Get('by-event/:eventId')
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  findByEvent(
    @Param('eventId') eventId: string,
  ): Promise<ChildrenMinistryVolunteer[]> {
    return this.volunteersService.findByEvent(eventId);
  }

  @Patch(':id')
  @RequirePermissions({
    action: 'update',
    subject: 'ChildrenMinistryVolunteer',
  })
  update(
    @Param('id') id: string,
    @Body() updateVolunteerInput: UpdateVolunteerInput,
  ): Promise<ChildrenMinistryVolunteer> {
    return this.volunteersService.update(id, updateVolunteerInput);
  }

  @Delete(':id')
  @RequirePermissions({
    action: 'delete',
    subject: 'ChildrenMinistryVolunteer',
  })
  remove(@Param('id') id: string): Promise<ChildrenMinistryVolunteer> {
    return this.volunteersService.remove(id);
  }

  @Get(':id/schedule')
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  getVolunteerSchedule(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.volunteersService.getVolunteerSchedule(
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
