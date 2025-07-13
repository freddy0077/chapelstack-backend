import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class BranchEventsService {
  constructor(private prisma: PrismaService) {}

  async getBranchUpcomingEvents(branchId: string, limit?: number): Promise<Event[]> {
    const now = new Date();
    
    // Get upcoming events for the branch
    const events = await this.prisma.event.findMany({
      where: {
        branchId,
        startDate: {
          gte: now, // Only get events that haven't started yet
        },
      },
      orderBy: {
        startDate: 'asc', // Order by closest upcoming events first
      },
      take: limit || 5,
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

    // Transform to match our GraphQL schema
    return events.map(event => {
      // Convert null values to undefined to match GraphQL schema
      const description = event.description === null ? undefined : event.description;
      const endDate = event.endDate === null ? undefined : event.endDate;
      const location = event.location === null ? undefined : event.location;
      const category = event.category === null ? undefined : event.category;
      const branchId = event.branchId === null ? undefined : event.branchId;
      const organisationId = event.organisationId === null ? undefined : event.organisationId;
      
      // Create a proper User object from creator data
      let creator: User | undefined = undefined;
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
        
        creator = partialUser;
      }
      
      // Create a new Event object
      const eventObj = new Event();
      eventObj.id = event.id;
      eventObj.title = event.title;
      eventObj.description = description;
      eventObj.startDate = event.startDate;
      eventObj.endDate = endDate;
      eventObj.location = location;
      eventObj.category = category;
      eventObj.branchId = branchId;
      eventObj.organisationId = organisationId;
      eventObj.createdBy = event.createdBy === null ? undefined : event.createdBy;
      eventObj.updatedBy = event.updatedBy === null ? undefined : event.updatedBy;
      eventObj.createdAt = event.createdAt;
      eventObj.updatedAt = event.updatedAt;
      eventObj.creator = creator;
      eventObj.attendees = []; // Empty array for attendees
      
      return eventObj;
    });
  }
}
