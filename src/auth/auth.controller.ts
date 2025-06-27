import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { Public } from './decorators/public.decorator'; // We'll create this decorator later if needed for public routes

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // Assuming signup is a public route
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    // The service returns the user object without the password
    return this.authService.signUp(signUpDto);
  }

  @Public() // Assuming signin is a public route
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  // Example of a protected route (would require JWT auth)
  // @Get('profile')
  // @UseGuards(JwtAuthGuard) // Assuming JwtAuthGuard is set up
  // getProfile(@Request() req) {
  //   return req.user; // User object attached by JwtStrategy
  // }
}
