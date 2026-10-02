import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, CookieOptions } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.interface';
import type { AppConfig } from '../config/configuration';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  private cookieOptions(maxAgeMs: number): CookieOptions {
    const isProd =
      this.configService.get('nodeEnv', { infer: true }) === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      domain: this.configService.get('cookieDomain', { infer: true }),
      maxAge: maxAgeMs,
      path: '/',
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Authenticate an admin user and set auth cookies' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const payload = this.authService.buildPayload(user);
    const accessToken = this.authService.signAccessToken(payload);
    const refreshToken = this.authService.signRefreshToken(payload);

    res.cookie('access_token', accessToken, this.cookieOptions(15 * 60 * 1000));
    res.cookie(
      'refresh_token',
      refreshToken,
      this.cookieOptions(7 * 24 * 60 * 60 * 1000),
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate the access token using the refresh cookie' })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: ReturnType<AuthService['verifyRefreshToken']>;
    try {
      payload = this.authService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { sub, email, name, role } = payload;
    const accessToken = this.authService.signAccessToken({
      sub,
      email,
      name,
      role,
    });
    res.cookie('access_token', accessToken, this.cookieOptions(15 * 60 * 1000));
    return { success: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Clear auth cookies' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { success: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the currently authenticated admin user' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
