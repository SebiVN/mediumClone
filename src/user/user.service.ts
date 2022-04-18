import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { sign } from 'jsonwebtoken';
import { configuration } from '@app/configuration';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDTO } from '@app/user/dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const userByEmail = await this.userRepository.findOne({
        email: createUserDto.email,
      });
      const userByUserName = await this.userRepository.findOne({
        username: createUserDto.username,
      });
      const errorResponse = { errors: {} };

      if (userByUserName) {
        errorResponse.errors['Username'] = 'is taken';
      }
      if (userByEmail) {
        errorResponse.errors['Email'] = 'is taken';
      }
      if (userByUserName || userByEmail) {
        throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
      }
      const newUser = new UserEntity();
      Object.assign(newUser, createUserDto);

      return await this.userRepository.save(newUser);
    } catch (err) {
      Logger.error(
        `There was an error creating the user: `,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: { ...user, token: this.generateJWT(user) },
    };
  }

  generateJWT(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      configuration().jwt.secret,
    );
  }

  async loginUser(loginDto: LoginUserDTO): Promise<UserEntity> {
    try {
      const userByEmail = await this.userRepository.findOne(
        {
          email: loginDto.email,
        },
        { select: ['id', 'username', 'email', 'bio', 'image', 'password'] },
      );
      if (!userByEmail) {
        throw new HttpException(
          { errors: { 'email or password': 'is invalid' } },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const verifyPassword = await compare(
        loginDto.password,
        userByEmail.password,
      );
      if (!verifyPassword) {
        throw new HttpException(
          { errors: { 'email or password': 'is invalid' } },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      delete userByEmail.password;
      return userByEmail;
    } catch (err) {
      Logger.error(
        `There was an error login in the user `,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }
  async updateUser(
    currentUserId: number,
    userDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      id: currentUserId,
    });
    Object.assign(user, userDto);
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }
}
