import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowsEntity } from '@app/profile/follows.entity';
import { ProfileType } from '@app/profile/type/profile.type';
import { ProfileResponseInterface } from '@app/profile/type/profileResponse.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowsEntity)
    private readonly followsRepository: Repository<FollowsEntity>,
  ) {}

  async getProfileByUsername(
    username: string,
    currentUser: UserEntity,
  ): Promise<ProfileType> {
    const userProfile = await this.userRepository.findOne({
      username: username,
    });
    if (!userProfile) {
      throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
    }
    const follow = await this.followsRepository.findOne({
      followerId: currentUser.id,
      followingId: userProfile.id,
    });
    return { ...userProfile, following: Boolean(follow) };
  }

  async followUser(username: string, currentUser: UserEntity) {
    try {
      const userToBeFollow = await this.userRepository.findOne({
        username: username,
      });

      if (!userToBeFollow) {
        throw new HttpException('Profile do not exists', HttpStatus.NOT_FOUND);
      }

      if (currentUser.id == userToBeFollow.id) {
        throw new HttpException(
          'Follower and Following can not be the same',
          HttpStatus.BAD_REQUEST,
        );
      }
      const followsTableValues = new FollowsEntity();

      const follow = await this.followsRepository.findOne({
        followerId: currentUser.id,
        followingId: userToBeFollow.id,
      });
      if (!follow) {
        followsTableValues.followerId = currentUser.id;
        followsTableValues.followingId = userToBeFollow.id;
        this.followsRepository.save(followsTableValues);
      }
    } catch (err) {
      Logger.error(
        `There was an error flowing the user comments `,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  async unfollowUser(username: string, currentUser: UserEntity) {
    try {
      const userToBeUnfollow = await this.userRepository.findOne({
        username: username,
      });

      if (!userToBeUnfollow) {
        throw new HttpException('Profile do not exists', HttpStatus.NOT_FOUND);
      }

      this.followsRepository.delete({
        followerId: currentUser.id,
        followingId: userToBeUnfollow.id,
      });
    } catch (err) {
      Logger.error(
        `There was an error unflowing the user comments:`,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile: profile };
  }
}
