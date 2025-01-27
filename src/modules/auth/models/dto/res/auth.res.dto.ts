import { TokenPairResDto } from './token-pair.res.dto';
import { UserResDto } from '../../../../user/models/dto/res/user.res.dto';

export class AuthResDto {
  tokens: TokenPairResDto;
  user: UserResDto;
}
