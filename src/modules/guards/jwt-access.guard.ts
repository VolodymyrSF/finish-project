import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SKIP_AUTH } from '../auth/decorators/skip-auth.decorator';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../auth/services/token.service';
import { AuthCacheService } from '../auth/services/auth-cache-service';
import { UserRepository } from '../repository/services/user.repository';
import { TokenType } from '../auth/models/enums/token-type.enum';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    private readonly userRepository: UserRepository,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.get('Authorization') || request.headers.authorization;

    const accessTokenFromCookies = request.cookies ? request.cookies['access_token'] : null;
    const accessToken = authHeader?.split('Bearer ')[1] || accessTokenFromCookies;

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    const payload = await this.tokenService.verifyToken(accessToken, TokenType.ACCESS);

    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    const isAccessTokenExist = await this.authCacheService.isAccessTokenExist(payload.userId, accessToken);

    if (!isAccessTokenExist) {
      throw new UnauthorizedException('Access token is not found in cache');
    }


    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }


    request.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return true;
  }
}