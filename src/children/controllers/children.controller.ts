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
import { ChildrenService } from '../services/children.service';
import { Child } from '../entities/child.entity';
import { CreateChildInput } from '../dto/create-child.input';
import { UpdateChildInput } from '../dto/update-child.input';
import { ChildFilterInput } from '../dto/child-filter.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('children')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @RequirePermissions({ action: 'create', subject: 'Child' })
  create(@Body() createChildInput: CreateChildInput): Promise<Child> {
    return this.childrenService.create(createChildInput);
  }

  @Get()
  @RequirePermissions({ action: 'read', subject: 'Child' })
  findAll(@Query() filter?: ChildFilterInput): Promise<Child[]> {
    return this.childrenService.findAll(filter);
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'Child' })
  findOne(@Param('id') id: string): Promise<Child> {
    return this.childrenService.findOne(id);
  }

  @Get('by-guardian/:guardianId')
  @RequirePermissions({ action: 'read', subject: 'Child' })
  findByGuardian(@Param('guardianId') guardianId: string): Promise<Child[]> {
    return this.childrenService.findByGuardian(guardianId);
  }

  @Patch(':id')
  @RequirePermissions({ action: 'update', subject: 'Child' })
  update(
    @Param('id') id: string,
    @Body() updateChildInput: UpdateChildInput,
  ): Promise<Child> {
    return this.childrenService.update(id, updateChildInput);
  }

  @Delete(':id')
  @RequirePermissions({ action: 'delete', subject: 'Child' })
  remove(@Param('id') id: string): Promise<Child> {
    return this.childrenService.remove(id);
  }

  @Get(':id/recent-check-ins')
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  getRecentCheckIns(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return this.childrenService.getRecentCheckIns(id, limit);
  }
}
