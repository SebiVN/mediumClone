import { UserEntity } from '@app/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsEntity } from '@app/profile/follows.entity';
import { ProfilesController } from '@app/profile/profile.controller';
import { ProfileService } from '@app/profile/profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowsEntity])],
  controllers: [ProfilesController],
  providers: [ProfileService],
})
export class ProfileModule {}
