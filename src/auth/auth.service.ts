import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '@prisma/client';

import { UserType, AuthPayload } from './dto/auth.types';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { SuccessMessageDto } from './dto/success-message.dto';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { EmailService } from '../communications/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // --- Helper method to generate access token ---
  private _generateAccessToken(user: Pick<User, 'id' | 'email'>): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  // --- Helper method to generate a new raw refresh token ---
  private _generateRawRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // --- Helper method to hash a token ---
  private _hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // --- Helper method to create and store a new refresh token ---
  private async _createAndStoreRefreshToken(userId: string): Promise<string> {
    const rawRefreshToken = this._generateRawRefreshToken();
    const hashedRefreshToken = this._hashToken(rawRefreshToken);
    const refreshTokenExpiresInDays = parseInt(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_DAYS', '7'),
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresInDays);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        hashedToken: hashedRefreshToken,
        expiresAt,
      },
    });
    return rawRefreshToken;
  }

  async signUp(signUpDto: SignUpDto): Promise<UserType> {
    const {
      email,
      password: passwordInput,
      firstName,
      lastName,
      phoneNumber,
    } = signUpDto;
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const saltRounds = 10;
    const passwordHash: string = await bcrypt.hash(passwordInput, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phoneNumber,
        // roles: { connect: [{ name: 'MEMBER' }] } // Example: Assign a default role
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userData } = user;
    return {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName ?? undefined,
      lastName: userData.lastName ?? undefined,
      phoneNumber: userData.phoneNumber ?? undefined,
      isActive: userData.isActive,
      isEmailVerified: userData.isEmailVerified,
      lastLoginAt: userData.lastLoginAt ?? undefined,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  }

  // signIn method will be modified to return AuthPayload including refreshToken
  async signIn(
    signInDto: SignInDto,
  ): Promise<AuthPayload & { refreshToken: string }> {
    // Modified return type
    const { email, password: passwordInput } = signInDto;

    // Include roles and userBranches with branch and role information
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
        member: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordMatching: boolean = await bcrypt.compare(
      passwordInput,
      user.passwordHash,
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive.');
    }

    const accessToken = this._generateAccessToken(user);
    const refreshToken = await this._createAndStoreRefreshToken(user.id);

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userData } = user;
    return {
      accessToken,
      refreshToken,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName ?? undefined,
        lastName: userData.lastName ?? undefined,
        phoneNumber: userData.phoneNumber ?? undefined,
        isActive: userData.isActive,
        isEmailVerified: userData.isEmailVerified,
        lastLoginAt: user.lastLoginAt ?? undefined,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        organisationId: userData.organisationId ?? undefined,
        roles: userData.roles,
        userBranches: Array.isArray(userData.userBranches)
          ? userData.userBranches.map((ub: any) => ({
              ...ub,
              branchId: ub.branchId ?? undefined,
              branch: ub.branch ?? undefined,
            }))
          : [],
        member: userData.member
          ? {
              id: userData.member.id,
              firstName: userData.member.firstName,
              lastName: userData.member.lastName,
              profileImageUrl: userData.member.profileImageUrl ?? undefined,
              status: userData.member.status ?? undefined,
            }
          : undefined,
      },
    };
  }

  async refreshToken(
    refreshTokenInput: RefreshTokenInput,
  ): Promise<TokenPayloadDto> {
    const { refreshToken: rawRefreshTokenFromInput } = refreshTokenInput;
    const hashedTokenFromInput = this._hashToken(rawRefreshTokenFromInput);

    const refreshTokenTable = this.prisma.refreshToken;
    const storedToken = await refreshTokenTable.findUnique({
      where: { hashedToken: hashedTokenFromInput },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (storedToken.isRevoked) {
      await refreshTokenTable.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (!storedToken.user || !storedToken.user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });
    const newAccessToken = this._generateAccessToken(storedToken.user);
    const newRawRefreshToken = await this._createAndStoreRefreshToken(
      storedToken.userId,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async validateUserById(userId: string): Promise<UserType | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });
    if (user && user.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userData } = user;
      return {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName ?? undefined,
        lastName: userData.lastName ?? undefined,
        phoneNumber: userData.phoneNumber ?? undefined,
        isActive: userData.isActive,
        isEmailVerified: userData.isEmailVerified,
        lastLoginAt: userData.lastLoginAt ?? undefined,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        roles: userData.roles,
        userBranches: Array.isArray(userData.userBranches)
          ? userData.userBranches.map((ub: any) => ({
              ...ub,
              branchId: ub.branchId ?? undefined,
              branch: ub.branch ?? undefined,
            }))
          : [],
      };
    }
    return null;
  }

  async logout(
    refreshTokenInput: RefreshTokenInput,
  ): Promise<SuccessMessageDto> {
    const { refreshToken: rawRefreshTokenFromInput } = refreshTokenInput;
    if (!rawRefreshTokenFromInput) {
      return { message: 'Logout successful as no token was provided.' };
    }

    const hashedTokenFromInput = this._hashToken(rawRefreshTokenFromInput);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { hashedToken: hashedTokenFromInput },
    });

    if (!storedToken) {
      return { message: 'Logout successful or token not found.' };
    }

    if (storedToken.isRevoked) {
      return { message: 'Logout successful, token already revoked.' };
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    return { message: 'Successfully logged out.' };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<SuccessMessageDto> {
    console.log('forgotPassword input:', input); // Debug log
    if (!input || !input.email) {
      throw new Error('Email is required');
    }
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: {
        userBranches: {
          include: {
            branch: true,
          },
          take: 1,
        },
      },
    });
    if (!user) {
      // Do not reveal if user exists
      return {
        message: 'If that email is registered, a reset link will be sent.',
      };
    }
    // Generate a secure token and expiry (1 hour from now)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiry: expiry,
      },
    });
    // Build reset link (adjust base URL as needed)
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    // Send email using the new sendSingleEmail method
    await this.emailService.sendSingleEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #111827; margin-bottom: 8px;">Password Reset Request</h1>
            <p style="color: #6B7280; margin-top: 0;">You requested to reset your password</p>
          </div>
          <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); height: 2px; margin: 20px 0;"></div>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">We received a request to reset your password for your Chapel Stack account. Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Thank you,<br>The Chapel Stack Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6B7280; text-align: center;">
            <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all;">${resetLink}</p>
          </div>
        </div>
      `,
      text: `You requested a password reset. Visit the following link to reset your password: ${resetLink}. This link will expire in 1 hour.`,
      // Use optional chaining for branchId and organizationId
      branchId: user.userBranches?.[0]?.branch?.id,
      organisationId: user.organisationId || undefined,
    });

    return {
      message: 'If that email is registered, a reset link will be sent.',
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<SuccessMessageDto> {
    // Validate input
    if (!input || !input.token || !input.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    // Find user by token
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: input.token,
        passwordResetTokenExpiry: { gte: new Date() },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }
    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.newPassword, saltRounds);
    // Update user password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });
    return { message: 'Password has been reset successfully.' };
  }
}
