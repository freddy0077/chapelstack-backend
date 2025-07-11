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
    // The AuthService.signIn method returns an object compatible with AuthPayload.
    // { accessToken: string, user: Omit<User, 'passwordHash'> }
    const authData = await this.authService.signIn(signInDto);
    return {
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      user: authData.user,
    };
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
    return this.authService.forgotPassword(input);
  }

  @Mutation(() => SuccessMessageDto, { name: 'resetPassword' })
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<SuccessMessageDto> {
    return this.authService.resetPassword(input);
  }
}
