import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateZoneInput, UpdateZoneInput } from './dto/zone.dto';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async createZone(input: CreateZoneInput) {
    console.log('CreateZone input received:', JSON.stringify(input, null, 2));
    
    return this.prisma.zone.create({
      data: {
        name: input.name,
        description: input.description || null,
        location: input.location || null,
        leaderName: input.leaderName || null,
        leaderPhone: input.leaderPhone || null,
        leaderEmail: input.leaderEmail || null,
        branchId: input.branchId || null,
        organisationId: input.organisationId,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async getZones(organisationId: string, branchId?: string) {
    return this.prisma.zone.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getZoneById(id: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    return zone;
  }

  async updateZone(id: string, input: UpdateZoneInput) {
    console.log('UpdateZone service received:', { id, input: JSON.stringify(input, null, 2) });
    
    const zone = await this.prisma.zone.findUnique({ where: { id } });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    // Build update data, filtering out undefined values
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.leaderName !== undefined) updateData.leaderName = input.leaderName;
    if (input.leaderPhone !== undefined) updateData.leaderPhone = input.leaderPhone;
    if (input.leaderEmail !== undefined) updateData.leaderEmail = input.leaderEmail;
    if (input.status !== undefined) updateData.status = input.status;

    console.log('Prisma update data:', JSON.stringify(updateData, null, 2));

    const result = await this.prisma.zone.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    console.log('Update result:', JSON.stringify(result, null, 2));
    return result;
  }

  async deleteZone(id: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    // Check if zone has members
    if (zone._count.members > 0) {
      throw new Error(
        `Cannot delete zone with ${zone._count.members} members. Please reassign members first.`,
      );
    }

    return this.prisma.zone.delete({ where: { id } });
  }

  async getZoneStats(organisationId: string, branchId?: string) {
    const zones = await this.prisma.zone.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return {
      totalZones: zones.length,
      activeZones: zones.filter((z) => z.status === 'ACTIVE').length,
      totalMembers: zones.reduce((sum, z) => sum + z._count.members, 0),
      zones: zones.map((z) => ({
        id: z.id,
        name: z.name,
        memberCount: z._count.members,
        status: z.status,
      })),
    };
  }
}
