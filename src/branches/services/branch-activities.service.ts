import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BranchActivity,
  ActivityMetadata,
} from '../entities/branch-activity.entity';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class BranchActivitiesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async getBranchActivities(
    branchId: string,
    limit?: number,
    skip?: number,
  ): Promise<BranchActivity[]> {
    // Get recent events from the database as activities
    const events = await this.prisma.event.findMany({
      where: {
        branchId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit || 10,
      skip: skip || 0,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Transform events to activities format
    return events.map((event) => {
      // Ensure branchId is not null
      const branchId = event.branchId || '';

      // Create a proper User object from creator data
      let user: User | undefined = undefined;
      if (event.creator) {
        // Create a partial user object with required fields
        const partialUser = new User();
        partialUser.id = event.creator.id;
        partialUser.firstName = event.creator.firstName;
        partialUser.lastName = event.creator.lastName;
        partialUser.email = 'user@example.com'; // Placeholder
        partialUser.phoneNumber = null;
        partialUser.createdAt = new Date();
        partialUser.updatedAt = new Date();
        partialUser.isActive = true;

        user = partialUser;
      }

      // Create metadata object
      const metadata: ActivityMetadata = {
        entityId: event.id,
        entityType: 'EVENT',
        details: `${event.location || 'No location'} - ${event.startDate ? new Date(event.startDate).toLocaleDateString() : 'No date'}`,
      };

      return {
        id: event.id,
        type: event.category || 'event_created',
        description: `${event.title} - ${event.description || 'No description'}`,
        timestamp: event.createdAt,
        branchId,
        user,
        metadata,
      };
    });
  }
}
