import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { SignInReqDto } from './models/dto/req/sign-in.req.dto';
import { AuthResDto } from './models/dto/res/auth.res.dto';
import { AuthService } from './services/auth.service';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { ManagerSignInReqDto } from './models/dto/req/manager.sign-in.req.dto';
import { ManagerAuthResDto } from './models/dto/res/manager.auth.res.dto';
import { RefreshTokenReqDto } from './models/dto/req/refresh-token.req.dto';
import { TokenPairResDto } from './models/dto/res/token-pair.res.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Логін (адмін або менеджер)' })
  public async login(
    @Body() dto: SignInReqDto,
    @Res() res: Response,
  ): Promise<any> {
    const authData = await this.authService.signIn(dto);
    res.cookie('access_token', authData.tokens.accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.cookie('refresh_token', authData.tokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });


    res.setHeader('Authorization', `Bearer ${authData.tokens.accessToken}`);
    return res.status(200).json(authData.tokens);
  }

  @Post('logout')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Вихід' })
  public async logout(@Req() req, @Res() res: Response): Promise<void> {
    await this.authService.logout(req.user.id, req.cookies.access_token);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.status(200).send({ message: 'Ви успішно вийшли!' });
  }

  @Post('refresh')
  @SkipAuth()
  public async refresh(@Req() req, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.authService.refreshTokens({ refreshToken });

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.status(200).send({ message: 'Токени оновлено' });
  }


}
