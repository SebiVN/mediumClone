import { ArticleEntity } from '@app/article/article.entity';
import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '@app/comment/comment.entity';
import { CreateCommentDTO } from '@app/comment/dto/createComment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}
  async getAllCometsForArticle(slug: string) {
    const currentArticle = await this.findArticle(slug);
    return await this.commentRepository.find({
      article: currentArticle,
    });
  }

  async addCommentsForArticle(
    slug: string,
    user: UserEntity,
    comment: CreateCommentDTO,
  ): Promise<CommentEntity> {
    const article = await this.findArticle(slug);
    try {
      const newComment = new CommentEntity();
      newComment.body = comment.body;
      newComment.author = user;
      newComment.article = article;

      const newSavedComment = await this.commentRepository.save(newComment);
      delete newSavedComment.article;
      return newSavedComment;
    } catch (err) {
      Logger.error(
        `There was an error adding comments: `,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  private async findArticle(slug: string): Promise<ArticleEntity> {
    try {
      const article = await this.articleRepository.findOne(
        { slug: slug },
        { relations: ['article_comments'] },
      );

      if (!article)
        throw new HttpException(
          { article: ['Does not exit'] },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );

      return article;
    } catch (err) {
      Logger.error(
        `There was an error finding comments: `,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  async deleteCommentsForArticle(slug: string, Id: number) {
    const article = await this.findArticle(slug);
    this.commentRepository.delete({ id: Id, article: article });
    return;
  }
}
