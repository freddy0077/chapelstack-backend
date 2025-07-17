import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { PermissionResolver } from './resolvers/permission.resolver';
import { CommunicationsModule } from '../communications/communications.module';
import { EmailModule } from '../email/email.module';

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
  ],
  providers: [AuthService, JwtStrategy, AuthResolver, PermissionResolver],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
