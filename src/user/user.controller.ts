import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { LoginUserDTO } from '@app/user/dto/loginUser.dto';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { UserService } from '@app/user/user.service';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UpdateUserDto } from '@app/user/dto/UpdateUser.dto';
import { BackendValidation } from '@app/shared/pipes/backendValidation.pipe';
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/users')
  @UsePipes(new BackendValidation())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('/users/login')
  @UsePipes(new BackendValidation())
  async loginUser(
    @Body('user') loginDto: LoginUserDTO,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.loginUser(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('/user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }

  @Put('/user')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidation())
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateUser: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const updatedUser = await this.userService.updateUser(
      currentUserId,
      updateUser,
    );
    return this.userService.buildUserResponse(updatedUser);
  }
}
