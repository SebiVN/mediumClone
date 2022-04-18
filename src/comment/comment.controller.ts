import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDTO } from './dto/createComment.dto';
import { CommentResponse } from './interfaces/commentResponse.interface';
import { CommentsResponse } from './interfaces/commentsResponse.interface';

@Controller('articles')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Get('/:slug/comments')
  async getAllCometsForArticle(
    @Param('slug') slug: string,
  ): Promise<CommentsResponse> {
    const comments = await this.commentService.getAllCometsForArticle(slug);

    return { comments };
  }

  @Post('/:slug/comments')
  @UseGuards(AuthGuard)
  async addComment(
    @Param('slug') slug: string,
    @User() user: UserEntity,
    @Body('comment') comment: CreateCommentDTO,
  ): Promise<CommentResponse> {
    const returnComment = await this.commentService.addCommentsForArticle(
      slug,
      user,
      comment,
    );
    return { comment: returnComment };
  }

  @Delete(':slug/comments/:id')
  @UseGuards(AuthGuard)
  deleteCommentsForArticle(
    @Param('slug') slug: string,
    @Param('id') currentUserId: number,
  ): any {
    this.commentService.deleteCommentsForArticle(slug, currentUserId);
    return;
  }
}
