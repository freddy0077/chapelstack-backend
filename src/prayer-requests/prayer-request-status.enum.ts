import { registerEnumType } from '@nestjs/graphql';

export enum PrayerRequestStatusEnum {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  ANSWERED = 'ANSWERED',
}

registerEnumType(PrayerRequestStatusEnum, {
  name: 'PrayerRequestStatusEnum',
});
