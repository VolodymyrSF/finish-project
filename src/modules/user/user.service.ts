import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/services/user.repository';
import { RefreshTokenRepository } from '../repository/services/refresh-token.repository';
import { UserEntity } from '../../database/entities/user.entity';
import { CreateUserReqDto } from './models/dto/req/create_user.req.dto';
import { UpdateUserReqDto } from './models/dto/req/update-user.req.dto';


@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async create(createUserDto: CreateUserReqDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        `Користувач з email ${createUserDto.email} вже зареєстрований`,
      );
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: String(id) },
    });
    if (!user) {
      throw new NotFoundException(`Користувач з id ${id} не знайдений`);
    }
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserReqDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: String(id) },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: String(id) },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.refreshTokenRepository.delete({ user_id: String(id) });

    await this.userRepository.remove(user);
  }
}
