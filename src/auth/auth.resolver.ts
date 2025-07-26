import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { UserType, AuthPayload } from './dto/auth.types';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { SuccessMessageDto } from './dto/success-message.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => UserType, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: UserType): Promise<UserType> {
    const userData = await this.authService.validateUserById(user.id);
    if (!userData) {
      throw new Error('User not found');
    }
    return userData;
  }

  @Mutation(() => UserType, { name: 'register' })
  async register(@Args('input') signUpDto: SignUpDto): Promise<UserType> {
    // The AuthService.signUp method returns Omit<User, 'passwordHash'>
    // which is compatible with UserType if fields match.
    // Explicit type casting might be needed if strict type checks complain,
    // or ensure UserType perfectly matches the structure of Omit<User, 'passwordHash'>.
    const user = await this.authService.signUp(signUpDto);
    return user;
  }

  @Mutation(() => AuthPayload, { name: 'login' })
  async login(@Args('input') signInDto: SignInDto): Promise<AuthPayload> {
    console.log(' AuthResolver login - Input:', signInDto.email);
    
    const result = await this.authService.signIn(signInDto);
    
    console.log(' AuthResolver login - Result from AuthService:');
    console.log(' Result user:', result.user);
    console.log(' Result user.organisationId:', result.user?.organisationId);
    console.log(' Result user.organisationId type:', typeof result.user?.organisationId);
    console.log(' Result user.userBranches:', result.user?.userBranches);
    
    console.log(' AuthResolver login - Final GraphQL response being sent:');
    console.log(' GraphQL response:', JSON.stringify(result, null, 2));
    
    return result;
  }

  @Mutation(() => SuccessMessageDto, { name: 'logout' })
  async logout(
    @Args('input') refreshTokenInput: RefreshTokenInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SuccessMessageDto> {
    // Clear the refresh token cookie if it exists
    res.clearCookie('jid', { path: '/', httpOnly: true, sameSite: 'lax' });
    return this.authService.logout(refreshTokenInput);
  }

  @Mutation(() => TokenPayloadDto, { name: 'refreshToken' })
  async refreshToken(
    @Args('input') refreshTokenInput: RefreshTokenInput,
  ): Promise<TokenPayloadDto> {
    return this.authService.refreshToken(refreshTokenInput);
  }

  @Mutation(() => SuccessMessageDto, { name: 'forgotPassword' })
  async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<SuccessMessageDto> {
    console.log('forgotPassword input:', input);
    console.log('forgotPassword input type:', typeof input);
    console.log('forgotPassword input email:', input?.email);
    console.log('forgotPassword input email type:', typeof input?.email);

    // Validate input
    if (!input || !input.email) {
      throw new Error('Email is required');
    }

    return this.authService.forgotPassword(input);
  }

  @Mutation(() => SuccessMessageDto, { name: 'resetPassword' })
  async resetPassword(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
  ): Promise<SuccessMessageDto> {
    console.log('resetPassword token:', token);
    console.log('resetPassword newPassword:', newPassword);

    const input: ResetPasswordInput = { token, newPassword };
    return this.authService.resetPassword(input);
  }
}
