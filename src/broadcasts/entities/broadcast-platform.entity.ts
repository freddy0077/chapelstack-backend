import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum StreamPlatform {
  ZOOM = 'ZOOM',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  YOUTUBE = 'YOUTUBE',
}

export enum PlatformStatus {
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  ERROR = 'ERROR',
}

registerEnumType(StreamPlatform, {
  name: 'StreamPlatform',
});

registerEnumType(PlatformStatus, {
  name: 'PlatformStatus',
});

@ObjectType('BroadcastPlatform')
export class BroadcastPlatformEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  broadcastId: string;

  @Field(() => StreamPlatform)
  platform: StreamPlatform;

  @Field(() => String)
  platformId: string;

  @Field({ nullable: true })
  streamUrl?: string;

  @Field(() => PlatformStatus)
  status: PlatformStatus;

  @Field(() => Int)
  viewerCount: number;

  @Field({ nullable: true })
  error?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
