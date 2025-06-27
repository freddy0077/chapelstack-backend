import { Module } from '@nestjs/common';
import { FormsService } from './services/forms.service';
import { FormFieldsService } from './services/form-fields.service';
import { FormSubmissionsService } from './services/form-submissions.service';
import { FormsResolver } from './resolvers/forms.resolver';
import { FormFieldsResolver } from './resolvers/form-fields.resolver';
import { FormSubmissionsResolver } from './resolvers/form-submissions.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    FormsService,
    FormFieldsService,
    FormSubmissionsService,
    FormsResolver,
    FormFieldsResolver,
    FormSubmissionsResolver,
  ],
  exports: [FormsService, FormFieldsService, FormSubmissionsService],
})
export class FormsModule {}
