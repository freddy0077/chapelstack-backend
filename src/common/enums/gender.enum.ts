import { registerEnumType } from '@nestjs/graphql';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(Gender, {
  name: 'Gender',
  description: 'Gender options for members and registries',
});
