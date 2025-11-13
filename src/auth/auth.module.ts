import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { PermissionResolver } from './resolvers/permission.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { ModuleResolver } from './resolvers/module.resolver';
import { RoleRegistryService } from './services/role-registry.service';
import { CommunicationsModule } from '../communications/communications.module';
import { EmailModule } from '../email/email.module';
import { AuditModule } from '../audit/audit.module';
import { MembersModule } from '../members/members.module';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [AuthController],
  imports: [
    EmailModule,
    ConfigModule, // Ensure ConfigModule is imported if not already globally available
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    CommunicationsModule,
    AuditModule,
    MembersModule, // Provide MemberLookupService for AuthService/AuthResolver
    CommonModule, // Provide LoggerService for AuthService
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AuthResolver,
    PermissionResolver,
    RoleResolver,
    ModuleResolver,
    RoleRegistryService,
  ],
  exports: [AuthService, JwtModule, PassportModule, RoleRegistryService],
})
export class AuthModule {}
