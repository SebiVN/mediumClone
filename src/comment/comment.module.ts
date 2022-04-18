import { ArticleEntity } from '@app/article/article.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from '@app/comment/comment.controller';
import { CommentEntity } from '@app/comment/comment.entity';
import { CommentService } from '@app/comment/comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, ArticleEntity])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
