import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { BroadcastPlatformEntity } from './broadcast-platform.entity';

export enum BroadcastStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
}

registerEnumType(BroadcastStatus, {
  name: 'BroadcastStatus',
});

@ObjectType('Broadcast')
export class BroadcastEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  scheduledStartTime: Date;

  @Field({ nullable: true })
  scheduledEndTime?: Date;

  @Field({ nullable: true })
  actualStartTime?: Date;

  @Field({ nullable: true })
  actualEndTime?: Date;

  @Field(() => BroadcastStatus)
  status: BroadcastStatus;

  @Field({ nullable: true })
  zoomMeetingId?: string;

  @Field({ nullable: true })
  zoomJoinUrl?: string;

  @Field({ nullable: true })
  zoomStartUrl?: string;

  @Field({ nullable: true })
  facebookLiveId?: string;

  @Field({ nullable: true })
  instagramLiveId?: string;

  @Field(() => Boolean)
  isRecorded: boolean;

  @Field(() => Boolean)
  isPublic: boolean;

  @Field(() => Int, { nullable: true })
  maxAttendees?: number;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  recordingUrl?: string;

  @Field(() => Int)
  viewerCount: number;

  @Field(() => Int)
  peakViewerCount: number;

  @Field(() => ID)
  organisationId: string;

  @Field(() => ID, { nullable: true })
  branchId?: string;

  @Field(() => ID)
  createdById: string;

  @Field(() => [BroadcastPlatformEntity], { nullable: true })
  platforms?: BroadcastPlatformEntity[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
