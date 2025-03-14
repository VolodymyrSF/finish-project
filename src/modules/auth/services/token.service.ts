import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { JwtService } from '@nestjs/jwt';

import { TokenType } from '../../../database/entities/enums/token-type.enum';
import { IJwtPayload } from '../models/interfaces/jwt-payload.interface';
import { ITokenPair } from '../models/interfaces/token-pair.interface';
import { Config, JwtConfig } from '../../../config/config.type';

@Injectable()
export class TokenService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Config>,
  ) {
    this.jwtConfig = configService.get<JwtConfig>('jwt');
  }

  public async generateAuthTokens(payload: IJwtPayload): Promise<ITokenPair> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn: this.jwtConfig.accessExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshSecret,
      expiresIn: this.jwtConfig.refreshExpiresIn,
    });
    return { accessToken, refreshToken };
  }
  public async verifyToken(token: string, type: TokenType): Promise<IJwtPayload> {
    try {
      const secret = this.getSecret(type);
      return await this.jwtService.verifyAsync(token, { secret });
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  public async signToken(
    payload: any,
    expiresIn: string,
    type: TokenType
  ): Promise<string> {
    const secret = this.getSecret(type);
    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  private getSecret(type: TokenType): string {
    let secret: string;
    switch (type) {
      case TokenType.ACCESS:
        secret = this.jwtConfig.accessSecret;
        break;
      case TokenType.REFRESH:
        secret = this.jwtConfig.refreshSecret;
        break;
      case TokenType.ACTIVATE:
        return this.jwtConfig.activationSecret;
      case TokenType.RESET:
        return this.jwtConfig.resetSecret;
      default:
        throw new Error('Невідомий тип токена');
    }
    return secret;
  }
}
