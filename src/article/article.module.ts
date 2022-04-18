import { FollowsEntity } from '@app/profile/follows.entity';
import { UserEntity } from '@app/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from '@app/article/article.controller';
import { ArticleEntity } from '@app/article/article.entity';
import { ArticleService } from '@app/article/article.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, UserEntity, FollowsEntity]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
