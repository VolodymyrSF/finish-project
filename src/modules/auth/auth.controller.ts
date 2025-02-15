import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import {  ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { SignInReqDto } from './models/dto/req/sign-in.req.dto';
import { AuthResDto } from './models/dto/res/auth.res.dto';
import { AuthService } from './services/auth.service';
import { SkipAuth } from './decorators/skip-auth.decorator'
import { JwtAccessGuard } from '../guards/jwt-access.guard';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
  @Post('sign-up')
  public async signUp(@Body() dto: SignUpReqDto): Promise<AuthResDto> {
    return await this.authService.signUp(dto);
  }

   */

  @Post('login')
  @SkipAuth()
  public async signIn(@Body() dto: SignInReqDto, @Res() res: Response): Promise<AuthResDto> {
    const authData: AuthResDto = await this.authService.signIn(dto);

    res.cookie('access_token', authData.tokens.accessToken, {
      httpOnly: true,
    });

    res.setHeader('Authorization', `Bearer ${authData.tokens.accessToken}`);

    res.redirect('/orders');
    return authData;
  }

}
