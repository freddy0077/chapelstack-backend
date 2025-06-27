import { Global, Module } from '@nestjs/common';
import { DateTimeScalar } from './graphql/DateTimeScalar';
import { EmailScalar } from './graphql/EmailScalar';
import { PhoneNumberScalar } from './graphql/PhoneNumberScalar';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

@Global()
@Module({
  providers: [
    DateTimeScalar,
    EmailScalar,
    PhoneNumberScalar,
    AllExceptionsFilter,
  ],
  exports: [
    DateTimeScalar,
    EmailScalar,
    PhoneNumberScalar,
    AllExceptionsFilter,
  ],
})
export class BaseModule {}
