import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

  @Post('admin-login')
  @SkipAuth()
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

  @Post('logout')
  @UseGuards(JwtAccessGuard)
  public async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('access_token');




  }
}
