import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RefreshTokenRepository } from '../../repository/services/refresh-token.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { SignInReqDto } from '../models/dto/req/sign-in.req.dto';
import { AuthResDto } from '../models/dto/res/auth.res.dto';
import { AuthCacheService } from './auth-cache-service';
import { TokenService } from './token.service';
import { RoleRepository } from '../../repository/services/role.repository';
import { UserMapper } from '../../user/user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly authCacheService: AuthCacheService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  /*
  public async signUp(dto: SignUpReqDto): Promise<AuthResDto> {
    await this.isEmailNotExistOrThrow(dto.email);

    const password = await bcrypt.hash(dto.password, 10);

    const role = await this.roleRepository.findOne({
      where: { name: dto.roleName as RoleEnum },
    });
    if (!role) {
      throw new Error(`Role with name ${dto.roleName} not found`);
    }




    const user = this.userRepository.create({
      email: dto.email,
      password,
      name: dto.name,
      role,
    });

    const savedUser = await this.userRepository.save(user);

    const tokens = await this.tokenService.generateAuthTokens({
      userId: savedUser.id,
      roleId: savedUser.role.id,
    });

    await Promise.all([
      this.authCacheService.saveToken(
        tokens.accessToken,
        savedUser.id,
      ),
      this.refreshTokenRepository.save(
        this.refreshTokenRepository.create({
          user_id: savedUser.id,
          refreshToken: tokens.refreshToken,
        }),
      ),
    ]);

    return { user: UserMapper.toResDto(savedUser), tokens };
  }
*/
  public async signIn(dto: SignInReqDto): Promise<AuthResDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['role', 'refreshTokens'],
      select: ['id', 'password', 'role', 'name'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
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
      throw new Error('Email already exists');
    }
  }
}
