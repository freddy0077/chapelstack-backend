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
import { GuardiansService } from '../services/guardians.service';
import { Guardian } from '../entities/guardian.entity';
import { CreateGuardianInput } from '../dto/create-guardian.input';
import { UpdateGuardianInput } from '../dto/update-guardian.input';
import { CreateChildGuardianRelationInput } from '../dto/create-child-guardian-relation.input';
import { ChildGuardianRelation } from '../entities/child-guardian-relation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('guardians')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  @RequirePermissions({ action: 'create', subject: 'Guardian' })
  create(@Body() createGuardianInput: CreateGuardianInput): Promise<Guardian> {
    return this.guardiansService.create(createGuardianInput);
  }

  @Get()
  @RequirePermissions({ action: 'read', subject: 'Guardian' })
  findAll(@Query('branchId') branchId?: string): Promise<Guardian[]> {
    return this.guardiansService.findAll(branchId);
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'Guardian' })
  findOne(@Param('id') id: string): Promise<Guardian> {
    return this.guardiansService.findOne(id);
  }

  @Get('by-child/:childId')
  @RequirePermissions({ action: 'read', subject: 'Guardian' })
  findByChild(@Param('childId') childId: string): Promise<Guardian[]> {
    return this.guardiansService.findByChild(childId);
  }

  @Get('by-member/:memberId')
  @RequirePermissions({ action: 'read', subject: 'Guardian' })
  findByMember(@Param('memberId') memberId: string): Promise<Guardian[]> {
    return this.guardiansService.findByMember(memberId);
  }

  @Patch(':id')
  @RequirePermissions({ action: 'update', subject: 'Guardian' })
  update(
    @Param('id') id: string,
    @Body() updateGuardianInput: UpdateGuardianInput,
  ): Promise<Guardian> {
    return this.guardiansService.update(id, updateGuardianInput);
  }

  @Delete(':id')
  @RequirePermissions({ action: 'delete', subject: 'Guardian' })
  remove(@Param('id') id: string): Promise<Guardian> {
    return this.guardiansService.remove(id);
  }

  @Post('relation')
  @RequirePermissions({ action: 'create', subject: 'ChildGuardianRelation' })
  createChildGuardianRelation(
    @Body() input: CreateChildGuardianRelationInput,
  ): Promise<ChildGuardianRelation> {
    return this.guardiansService.createChildGuardianRelation(input);
  }

  @Delete('relation/:childId/:guardianId')
  @RequirePermissions({ action: 'delete', subject: 'ChildGuardianRelation' })
  removeChildGuardianRelation(
    @Param('childId') childId: string,
    @Param('guardianId') guardianId: string,
  ): Promise<boolean> {
    return this.guardiansService.removeChildGuardianRelation(
      childId,
      guardianId,
    );
  }
}
