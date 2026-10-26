import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from './auth.service';

export interface JwtPayload {
  sub: number;
  username: string;
  role?: string;
  employeeId?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'quanlykho_jwt_secret_key_2026',
      ),
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Không xác thực được phiên đăng nhập');
    }

    const authHeader = req?.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

    if (token) {
      const revoked = await this.authService.isTokenRevoked(token);
      if (revoked) {
        throw new UnauthorizedException(
          'Phiên đăng nhập đã kết thúc, vui lòng đăng nhập lại',
        );
      }
    }

    return payload;
  }
}
