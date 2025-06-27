import { registerEnumType } from '@nestjs/graphql';

export enum ReportFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

registerEnumType(ReportFrequency, {
  name: 'ReportFrequency',
  description: 'Frequency at which a report is scheduled to run',
});
