import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { JwtPayload } from './types/jwt-payload.interface';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      this.logger.warn(`Failed login attempt for unknown/inactive email`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      this.logger.warn(`Failed login attempt for user ${user.id}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  buildPayload(user: UserDocument): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  signAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwtSecret', { infer: true }),
      expiresIn: this.configService.get('jwtAccessExpiresIn', {
        infer: true,
      }),
    });
  }

  signRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwtRefreshSecret', { infer: true }),
      expiresIn: this.configService.get('jwtRefreshExpiresIn', {
        infer: true,
      }),
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.configService.get('jwtRefreshSecret', { infer: true }),
    });
  }
}
