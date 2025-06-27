import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService, // For fetching user details
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const { sub: id } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: false,
        roles: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                id: true,
                action: true,
                subject: true,
              },
            },
          },
        },
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
