import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { SignInReqDto } from './models/dto/req/sign-in.req.dto';
import { AuthResDto } from './models/dto/res/auth.res.dto';
import { AuthService } from './services/auth.service';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { ManagerSignInReqDto } from './models/dto/req/manager.sign-in.req.dto';
import { ManagerAuthResDto } from './models/dto/res/manager.auth.res.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
  @Post('admin-login')
  @SkipAuth()
  @ApiOperation({ summary: 'Логін адміном' })
  public async signIn(
    @Body() dto: SignInReqDto,
    @Res() res: Response,
  ): Promise<AuthResDto> {
    const authData: AuthResDto = await this.authService.signIn(dto);

    res.cookie('access_token', authData.tokens.accessToken, {
      httpOnly: true,
    });

    res.setHeader('Authorization', `Bearer ${authData.tokens.accessToken}`);

    res.redirect('/orders');
    return authData;
  }

  @Post('manager-login')
  @SkipAuth()
  @ApiOperation({ summary: 'Логін менеджером' })
  public async managerSignIn(
    @Body() dto: ManagerSignInReqDto,
    @Res() res: Response,
  ): Promise<ManagerAuthResDto> {
    const authManagerData = await this.authService.managerSignIn(dto);

    res.cookie('access_token', authManagerData.tokens.accessToken, {
      httpOnly: true,
    });

    res.setHeader('Authorization', `Bearer ${authManagerData.tokens.accessToken}`);

    res.redirect('/orders');
    return authManagerData.user;
  }
   */

  @Post('login')
  @ApiOperation({ summary: 'Логін (адмін або менеджер)' })
  public async login(
    @Body() dto: SignInReqDto,
    @Res() res: Response,
  ): Promise<any> {
    const authData = await this.authService.signIn(dto);

    res.cookie('access_token', authData.tokens.accessToken, {
      httpOnly: true,
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
    res.status(200).send({ message: 'Ви успішно вийшли!' });
  }
}
