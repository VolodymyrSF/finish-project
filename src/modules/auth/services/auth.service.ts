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
import { assertManagerLoginAllowed } from '../../../helpers/assertManagerLoginAllowed';
import { UserResDto } from '../../user/models/dto/res/user.res.dto';

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

  public async signIn(dto: SignInReqDto): Promise<{ user: UserResDto | ManagerAuthResDto; tokens: TokenPairResDto }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['role'],
      select: ['id', 'password', 'name'],
    });

    const manager = await this.managersRepository.findOne({
      where: { email: dto.email },
      select: [
        'id',
        'password',
        'name',
        'surname',
        'email',
        'phone',
        'isActive',
        'isBanned',
        'created_at',
        'updated_at',
      ],
    });

    if (manager) {
      await this.validatePasswordOrThrow(dto.password, manager.password);
      assertManagerLoginAllowed(manager);

      const tokens = await this.generateAndStoreTokens(manager.id, RoleEnum.MANAGER, false);

      return {
        user: UserMapper.toManagerAuthResDto(manager),
        tokens,
      };
    }else if (user) {
      await this.validatePasswordOrThrow(dto.password, user.password);

      const tokens = await this.generateAndStoreTokens(user.id, user.role.id, true);

      return {
        user: UserMapper.toResDto(user),
        tokens,
      };
    }

    throw new UnauthorizedException('Невірні дані для входу');
  }







  private async validatePasswordOrThrow(raw: string, hashed: string): Promise<void> {
    const isValid = await bcrypt.compare(raw, hashed);
    if (!isValid) {
      throw new UnauthorizedException('Невірні дані для входу');
    }
  }

  private async generateAndStoreTokens(
    id: string,
    roleId: RoleEnum | string,
    isUser: boolean,
  ): Promise<TokenPairResDto> {
    const tokens = await this.tokenService.generateAuthTokens({
      userId: id,
      roleId,
    });

    await Promise.all([
      this.authCacheService.saveToken(tokens.accessToken, id),
      this.refreshTokenRepository.save(
        this.refreshTokenRepository.create({
          user_id: isUser ? id : null,
          manager_id: isUser ? null : id,
          refreshToken: tokens.refreshToken,
        }),
      ),
    ]);

    return tokens;
  }

  public async logout(userId: string, accessToken: string): Promise<void> {
    const isTokenValid = await this.authCacheService.isAccessTokenExist(userId, accessToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Недійсний токен');
    }

    await Promise.all([
      this.authCacheService.deleteToken(userId),
      this.refreshTokenRepository.delete({ user_id: userId }),
      this.refreshTokenRepository.delete({ manager_id: userId }),
    ]);

  }
}
