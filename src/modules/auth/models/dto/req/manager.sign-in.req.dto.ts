import { IsString, IsEmail } from 'class-validator';

export class ManagerSignInReqDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
