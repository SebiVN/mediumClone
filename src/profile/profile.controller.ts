import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from '@app/profile/profile.service';
import { ProfileResponseInterface } from '@app/profile/type/profileResponse.interface';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfileByUsername(
    @Param('username') username: string,
    @User() currentUser: UserEntity,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfileByUsername(
      username,
      currentUser,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  followUser(
    @Param('username') username: string,
    @User() currentUser: UserEntity,
  ): any {
    return this.profileService.followUser(username, currentUser);
  }
  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  unfollowUser(
    @Param('username') username: string,
    @User() currentUser: UserEntity,
  ): any {
    return this.profileService.unfollowUser(username, currentUser);
  }
}
