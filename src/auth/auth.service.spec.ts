import * as bcryptOriginal from 'bcrypt'; // Import original for type annotation
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto'; // Added SignInDto
import { User } from '../../generated/prisma';

// mockBcryptHash and mockBcryptCompare will be declared as const after require('bcrypt')

jest.mock('bcrypt', () => {
  // Factory creates and returns the mock functions.
  // It does NOT try to assign to mockBcryptHash/Compare from the outer scope here.
  return {
    __esModule: true,
    hash: jest.fn(),
    compare: jest.fn(),
  };
});

// NOW, after jest.mock has configured the mock for 'bcrypt':
// We get the mocked module.
// Using require here is a common pattern in Jest for this, despite lint rules.
// eslint-disable-next-line -- Disabling all rules for this line to allow require for Jest mocking
const mockedBcrypt = require('bcrypt') as {
  hash: jest.MockedFunction<typeof bcryptOriginal.hash>;
  compare: jest.MockedFunction<typeof bcryptOriginal.compare>;
};

// Declare and assign the const mock functions here for use in tests.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockBcryptHash: jest.MockedFunction<typeof bcryptOriginal.hash> =
  mockedBcrypt.hash;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockBcryptCompare: jest.MockedFunction<typeof bcryptOriginal.compare> =
  mockedBcrypt.compare;

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(), // For signIn tests
  };

  // Mock User data
  const mockUser: User = {
    id: 'user-id-123',
    email: 'test@example.com',
    passwordHash: 'hashedPassword123',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '1234567890',
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto: SignUpDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      phoneNumber: '0987654321',
    };
    const hashedPassword = 'hashedPassword';

    beforeEach(() => {
      // Reset mocks before each test in this describe block
      mockPrismaService.user.findUnique.mockReset();
      mockPrismaService.user.create.mockReset();
      (mockBcryptHash as jest.Mock).mockReset();
      (mockBcryptCompare as jest.Mock).mockReset();
    });

    it('should successfully create a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null); // No existing user
      (mockBcryptHash as jest.Mock).mockResolvedValue(hashedPassword as never);
      const createdUser = {
        ...mockUser,
        email: signUpDto.email,
        passwordHash: hashedPassword,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
        phoneNumber: signUpDto.phoneNumber,
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.signUp(signUpDto);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...expectedUserResult } = createdUser;
      expect(result).toEqual(expectedUserResult);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(mockBcryptHash as jest.Mock).toHaveBeenCalledWith(
        signUpDto.password,
        10,
      );
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signUpDto.email,
          passwordHash: hashedPassword,
          firstName: signUpDto.firstName,
          lastName: signUpDto.lastName,
          phoneNumber: signUpDto.phoneNumber,
        },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser); // User exists

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(mockBcryptHash as jest.Mock).not.toHaveBeenCalled();
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  // TODO: Add tests for signIn method
  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockAccessToken = 'mock.access.token';

    // Re-use mockUser from the outer scope, ensure passwordHash is defined
    const existingUser: User = {
      ...mockUser, // Spread existing mockUser properties
      email: signInDto.email, // Ensure email matches signInDto
      passwordHash: 'hashedPassword123', // Ensure this is set for bcrypt.compare
      isActive: true,
    };

    beforeEach(() => {
      // Reset mocks before each test in this describe block
      mockPrismaService.user.findUnique.mockReset();
      (mockBcryptCompare as jest.Mock).mockReset();
      mockJwtService.sign.mockReset();
    });

    it('should successfully sign in a user and return an access token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (mockBcryptCompare as jest.Mock).mockResolvedValue(true as never); // Password matches
      mockJwtService.sign.mockReturnValue(mockAccessToken);

      const result = await service.signIn(signInDto);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...expectedUser } = existingUser;
      expect(result).toEqual({
        accessToken: mockAccessToken,
        user: expectedUser,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(mockBcryptCompare as jest.Mock).toHaveBeenCalledWith(
        signInDto.password,
        existingUser.passwordHash,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: existingUser.email,
        sub: existingUser.id,
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(mockBcryptCompare as jest.Mock).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (mockBcryptCompare as jest.Mock).mockResolvedValue(false as never); // Password does not match

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(mockBcryptCompare as jest.Mock).toHaveBeenCalledWith(
        signInDto.password,
        existingUser.passwordHash,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...existingUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);
      (mockBcryptCompare as jest.Mock).mockResolvedValue(true as never); // Password matches

      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('User account is inactive.'),
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(mockBcryptCompare as jest.Mock).toHaveBeenCalledWith(
        signInDto.password,
        inactiveUser.passwordHash,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUserById', () => {
    const baseMockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      passwordHash: 'hashed-password', // Not directly used by validateUserById but good for consistency
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
      isActive: true,
      isEmailVerified: true, // Added missing property
      lastLoginAt: new Date(), // Added missing property
      createdAt: new Date(),
      updatedAt: new Date(), // Added comma
      // branchId: null, // Removed as it's not in the expected User type for this context
    };

    beforeEach(() => {
      // Reset prisma mock before each test in this describe block
      mockPrismaService.user.findUnique.mockReset();
    });

    it('should return the user if found and active', async () => {
      const activeUser: User = { ...baseMockUser, isActive: true };
      mockPrismaService.user.findUnique.mockResolvedValue(activeUser);

      const result = await service.validateUserById(activeUser.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...expectedUser } = activeUser;
      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: activeUser.id },
      });
    });

    it('should return null if user is found but inactive', async () => {
      const inactiveUser: User = {
        ...baseMockUser,
        id: 'inactive-user-id',
        isActive: false,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      const result = await service.validateUserById(inactiveUser.id);
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: inactiveUser.id },
      });
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const nonExistentUserId = 'non-existent-user-id';
      const result = await service.validateUserById(nonExistentUserId);
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentUserId },
      });
    });
  });
});
