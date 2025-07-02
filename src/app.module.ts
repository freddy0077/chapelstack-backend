import { Module, Logger } from '@nestjs/common';
Logger.overrideLogger(['log', 'error', 'warn', 'debug', 'verbose']);
import { OnboardingModule } from './onboarding/onboarding.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './base/base.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule, GraphQLISODateTime } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { OrganisationModule } from './organisation/organisation.module';
import { SettingsModule } from './settings/settings.module';
import { Branch } from './branches/entities/branch.entity';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import GraphQLJSON from 'graphql-type-json';
import { AttendanceStatsPeriod } from './attendance/dto/attendance-stats.input';
import { EventsModule } from './events/events.module';
import { MembersModule } from './members/members.module';
import { MinistriesModule } from './ministries/ministries.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SacramentsModule } from './sacraments/sacraments.module';
import { ChildrenModule } from './children/children.module';
import { FormsModule } from './forms/forms.module';
import { ReportingModule } from './reporting/reporting.module';
import { ContentModule } from './content/content.module';
import { CommunicationsModule } from './communications/communications.module';
import { PrayerRequestsModule } from './prayer-requests/prayer-requests.module';
import { BudgetsModule } from './budgets/budgets.module';
import { PledgesModule } from './pledges/pledges.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FundsModule } from './funds/funds.module';
import { ContributionsModule } from './contributions/contributions.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { VendorsModule } from './vendors/vendors.module';
import { ContributionTypesModule } from './contribution-types/contribution-types.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { TransactionModule } from './finance/transaction.module';

import { registerEnumType } from '@nestjs/graphql';

registerEnumType(AttendanceStatsPeriod, {
  name: 'AttendanceStatsPeriod',
});

@Module({
  imports: [
    OnboardingModule,
    ConfigModule.forRoot({ isGlobal: true }),
    BaseModule,
    CommonModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      debug: true,
      playground: true,
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Custom scalars from BaseModule (imported in AppModule) should be automatically picked up.
      buildSchemaOptions: {
        orphanedTypes: [Branch],
        scalarsMap: [
          { type: Date, scalar: GraphQLISODateTime },
          { type: () => Object, scalar: GraphQLJSON },
        ],
      },
    }),
    AuthModule,
    BranchesModule,
    OrganisationModule,
    SystemSettingsModule,
    AdminModule,
    PrismaModule,
    SettingsModule,
    MembersModule,
    EventsModule,
    MinistriesModule,
    AttendanceModule,
    SacramentsModule,
    ChildrenModule,
    FormsModule,
    ReportingModule,
    ContentModule,
    CommunicationsModule,
    PrayerRequestsModule,
    BudgetsModule,
    PledgesModule,
    ExpensesModule,
    FundsModule,
    ContributionsModule,
    ExpenseCategoriesModule,
    VendorsModule,
    ContributionTypesModule,
    PaymentMethodsModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
