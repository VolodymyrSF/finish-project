import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RefreshTokenRepository } from '../../repository/services/refresh-token.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { SignInReqDto } from '../models/dto/req/sign-in.req.dto';
import { AuthResDto } from '../models/dto/res/auth.res.dto';
import { AuthCacheService } from './auth-cache-service';
import { TokenService } from './token.service';
import { RoleRepository } from '../../repository/services/role.repository';
import { UserMapper } from '../../user/user.mapper';
import { ManagerRepository } from '../../repository/services/manager.repository';
import { JwtService } from '@nestjs/jwt';
import { RoleEnum } from '../../../database/entities/enums/role.enum';
import { ManagerAuthResDto } from '../models/dto/res/manager.auth.res.dto';
import { ManagerSignInReqDto } from '../models/dto/req/manager.sign-in.req.dto';
import { TokenPairResDto } from '../models/dto/res/token-pair.res.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authCacheService: AuthCacheService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly roleRepository: RoleRepository,
    private readonly managersRepository: ManagerRepository,
    private readonly jwtService: JwtService,

  ) {}

  public async signIn(dto: SignInReqDto): Promise<AuthResDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['role', 'refreshTokens'],
      select: ['id', 'password', 'role', 'name'],
    });

    if (!user) {
      throw new UnauthorizedException('Користувача не знайдено');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильний пароль');
    }



    const tokens = await this.tokenService.generateAuthTokens({
      userId: user.id,
      roleId: user.role.id,
    });

    await Promise.all([
      this.authCacheService.saveToken(
        tokens.accessToken,
        user.id,
      ),
      this.refreshTokenRepository.save(
        this.refreshTokenRepository.create({
          user_id: user.id,
          refreshToken: tokens.refreshToken,
        }),
      ),
    ]);

    return { user: UserMapper.toResDto(user), tokens };
  }

  private async isEmailNotExistOrThrow(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw new Error('Користувач з таким email вже існує');
    }
  }


  public async managerSignIn(dto: ManagerSignInReqDto): Promise<{ user: ManagerAuthResDto, tokens: TokenPairResDto }> {

    const manager = await this.managersRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'password', 'name', 'surname', 'email', 'phone', 'isActive', 'isBanned', 'created_at', 'updated_at'],
    });


    if (!manager) {
      throw new UnauthorizedException('Менеджера не знайдено');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, manager.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильний пароль');
    }

    const isBanned = manager.isBanned;
    if (isBanned) {
      throw new UnauthorizedException('Вас забанив адміністратор');
    }




    const tokens = await this.tokenService.generateAuthTokens({
      userId: manager.id,
      roleId: RoleEnum.MANAGER,
    });

    await Promise.all([
      this.authCacheService.saveToken(tokens.accessToken, manager.id),
      this.refreshTokenRepository.save(
        this.refreshTokenRepository.create({
          manager_id: manager.id,
          user_id: null,
          refreshToken: tokens.refreshToken,
        }),
      ),
    ]);



    return { user: UserMapper.toManagerAuthResDto(manager), tokens };
  }

  public async logout(userId: string, accessToken: string): Promise<void> {
    const isTokenValid = await this.authCacheService.isAccessTokenExist(userId, accessToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Недійсний токен');
    }

    await Promise.all([
      this.authCacheService.deleteToken(userId),
      this.refreshTokenRepository.delete({ user_id: userId }),
    ]);
  }
}
