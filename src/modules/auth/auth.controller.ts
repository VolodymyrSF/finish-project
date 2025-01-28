import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SignInReqDto } from './models/dto/req/sign-in.req.dto';
import { AuthResDto } from './models/dto/res/auth.res.dto';
import { AuthService } from './services/auth.service';

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
  public async signIn(@Body() dto: SignInReqDto, @Res() res: any): Promise<AuthResDto> {
    const authData: AuthResDto = await this.authService.signIn(dto);
    res.redirect('/orders');
    return authData;
  }
}
