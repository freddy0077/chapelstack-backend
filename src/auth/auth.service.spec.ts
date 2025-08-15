import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../communications/services/email.service';
import { UnauthorizedException } from '@nestjs/common';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let bcryptCompareSpy: jest.Mock;

  const mockUser = {
    id: '7e621a39-0e14-40c7-a158-40614ff4ec53',
    email: 'branch_admin@chapelstack.com',
    firstName: 'Branch_admin',
    lastName: 'User',
    phoneNumber: null,
    isActive: true,
    isEmailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    organisationId: '9885dc20-3f03-42d3-a45b-3d5ed3799309',
    passwordHash: '$2b$10$hashedpassword',
    roles: [
      {
        id: 'role-1',
        name: 'BRANCH_ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    userBranches: [
      {
        branch: {
          id: 'beb34fbd-f016-4c94-975a-59e1d0843bf4',
          name: 'Main Branch',
        },
        role: {
          id: 'role-1',
          name: 'BRANCH_ADMIN',
        },
      },
    ],
    member: null,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_TOKEN_EXPIRATION_DAYS: '7',
      };
      return config[key];
    }),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    bcryptCompareSpy = bcrypt.compare as jest.Mock;
    bcryptCompareSpy.mockImplementation(() => Promise.resolve(true));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return user with organisationId when login is successful', async () => {
      // Arrange
      const signInDto = {
        email: 'branch_admin@chapelstack.com',
        password: 'password123',
      };

      // Mock Prisma user.findUnique to return our mock user
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock Prisma user.update for lastLoginAt
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      // Mock subscription check
      mockPrismaService.subscription.findFirst.mockResolvedValue({
        id: 'subscription-1',
        status: 'ACTIVE',
        organisationId: mockUser.organisationId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      // Mock refresh token creation
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'refresh-token-id',
        hashedToken: 'hashed-refresh-token',
        userId: mockUser.id,
        expiresAt: new Date(),
        isRevoked: false,
      });

      // Act
      const result = await service.signIn(signInDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.organisationId).toBe(
        '9885dc20-3f03-42d3-a45b-3d5ed3799309',
      );
      expect(result.user.organisationId).not.toBeNull();
      expect(result.user.organisationId).not.toBeUndefined();
      expect(typeof result.user.organisationId).toBe('string');

      // Verify other user properties
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.firstName).toBe(mockUser.firstName);
      expect(result.user.lastName).toBe(mockUser.lastName);
      expect(result.user.isActive).toBe(true);

      // Verify tokens are returned
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.accessTokenExpiresAt).toBeDefined();
      expect(result.refreshTokenExpiresAt).toBeDefined();

      // Verify Prisma was called with correct parameters
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          organisationId: true,
          passwordHash: true,
          roles: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          userBranches: {
            include: {
              branch: true,
              role: true,
            },
          },
          member: true,
        },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const signInDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const signInDto = {
        email: 'branch_admin@chapelstack.com',
        password: 'wrongpassword',
      };

      bcryptCompareSpy.mockImplementation(() => Promise.resolve(false));

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const signInDto = {
        email: 'branch_admin@chapelstack.com',
        password: 'password123',
      };

      const inactiveUser = { ...mockUser, isActive: false };

      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle user with null organisationId gracefully', async () => {
      // Arrange
      const signInDto = {
        email: 'branch_admin@chapelstack.com',
        password: 'password123',
      };

      const userWithNullOrgId = { ...mockUser, organisationId: null };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithNullOrgId);
      mockPrismaService.user.update.mockResolvedValue(userWithNullOrgId);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'refresh-token-id',
        hashedToken: 'hashed-refresh-token',
        userId: mockUser.id,
        expiresAt: new Date(),
        isRevoked: false,
      });

      // Act
      const result = await service.signIn(signInDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.organisationId).toBeUndefined(); // Should be undefined when null
    });
  });
});
