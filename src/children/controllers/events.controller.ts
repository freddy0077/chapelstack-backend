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
import { EventsService } from '../services/events.service';
import { ChildrenEvent } from '../entities/children-event.entity';
import { CreateChildrenEventInput } from '../dto/create-children-event.input';
import { UpdateChildrenEventInput } from '../dto/update-children-event.input';
import { CreateVolunteerAssignmentInput } from '../dto/create-volunteer-assignment.input';
import { VolunteerEventAssignment } from '../entities/volunteer-event-assignment.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('children-events')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @RequirePermissions({ action: 'create', subject: 'ChildrenEvent' })
  create(
    @Body() createEventInput: CreateChildrenEventInput,
  ): Promise<ChildrenEvent> {
    return this.eventsService.create(createEventInput);
  }

  @Get()
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findAll(@Query('branchId') branchId?: string): Promise<ChildrenEvent[]> {
    return this.eventsService.findAll(branchId);
  }

  @Get('upcoming/:branchId')
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findUpcomingEvents(
    @Param('branchId') branchId: string,
  ): Promise<ChildrenEvent[]> {
    return this.eventsService.findUpcomingEvents(branchId);
  }

  @Get('past/:branchId')
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findPastEvents(
    @Param('branchId') branchId: string,
  ): Promise<ChildrenEvent[]> {
    return this.eventsService.findPastEvents(branchId);
  }

  @Get('current/:branchId')
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findCurrentEvents(
    @Param('branchId') branchId: string,
  ): Promise<ChildrenEvent[]> {
    return this.eventsService.findCurrentEvents(branchId);
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findOne(@Param('id') id: string): Promise<ChildrenEvent> {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions({ action: 'update', subject: 'ChildrenEvent' })
  update(
    @Param('id') id: string,
    @Body() updateEventInput: UpdateChildrenEventInput,
  ): Promise<ChildrenEvent> {
    return this.eventsService.update(id, updateEventInput);
  }

  @Delete(':id')
  @RequirePermissions({ action: 'delete', subject: 'ChildrenEvent' })
  remove(@Param('id') id: string): Promise<ChildrenEvent> {
    return this.eventsService.remove(id);
  }

  @Post('volunteer-assignment')
  @RequirePermissions({ action: 'create', subject: 'VolunteerEventAssignment' })
  assignVolunteerToEvent(
    @Body() input: CreateVolunteerAssignmentInput,
  ): Promise<VolunteerEventAssignment> {
    return this.eventsService.assignVolunteerToEvent(input);
  }

  @Delete('volunteer-assignment/:volunteerId/:eventId')
  @RequirePermissions({ action: 'delete', subject: 'VolunteerEventAssignment' })
  removeVolunteerFromEvent(
    @Param('volunteerId') volunteerId: string,
    @Param('eventId') eventId: string,
  ): Promise<boolean> {
    return this.eventsService.removeVolunteerFromEvent(volunteerId, eventId);
  }

  @Get(':id/attendance')
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  getEventAttendance(@Param('id') id: string): Promise<any> {
    return this.eventsService.getEventAttendance(id);
  }
}
