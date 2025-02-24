import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SKIP_AUTH } from '../auth/decorators/skip-auth.decorator';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../auth/services/token.service';
import { AuthCacheService } from '../auth/services/auth-cache-service';
import { UserRepository } from '../repository/services/user.repository';
import { TokenType } from '../auth/models/enums/token-type.enum';
import { ManagerRepository } from '../repository/services/manager.repository';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    private readonly userRepository: UserRepository,
    private readonly managerRepository: ManagerRepository,
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

    let userData = null;

    if (user) {
      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } else {
      const manager = await this.managerRepository.findOne({
        where: { id: payload.userId },
      });

      if (manager) {
        userData = {
          id: manager.id,
          name: manager.name,
          surname: manager.surname,
          email: manager.email,
          phone: manager.phone,
          isActive: manager.isActive,
          isBanned: manager.isBanned,
          createdAt: manager.created_at,
          updatedAt: manager.updated_at,
        };
      } else {
        throw new UnauthorizedException('User or manager not found');
      }
    }

    request.user = userData;
    return true;
  }
  }