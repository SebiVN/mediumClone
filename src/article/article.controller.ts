import { BackendValidation } from '@app/shared/pipes/backendValidation.pipe';
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
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { ArticleService } from '@app/article/article.service';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleResponseInterface } from '@app/article/type/articleResponse.interface';
import { ArticlesResponseInterface } from '@app/article/type/articlesResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Get('feed')
  @UseGuards(AuthGuard)
  async getCurrentUserFeed(
    @Query() query: any,
    @User() currentUser: UserEntity,
  ): Promise<ArticlesResponseInterface> {
    const articles = await this.articleService.getCurrentUserFeed(
      query,
      currentUser,
    );
    return articles;
  }
  @Get()
  async getArticles(
    @User() user: UserEntity,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(user, query);
  }
  @Get('/:slug')
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Post()
  @UsePipes(new BackendValidation())
  @UseGuards(AuthGuard)
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createdArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      user,
      createdArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }
  @Post('/:slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      currentUserId,
    );
    return this.articleService.buildArticleResponse(article);
  }
  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleToFavorites(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleToFavorites(
      slug,
      currentUserId,
    );
    return this.articleService.buildArticleResponse(article);
  }
  @Delete('/:slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    return await this.articleService.deleteArticle(slug, user);
  }
  @Put('/:slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidation())
  async updateArticle(
    @Param('slug') slug: string,
    @Body('article') article: CreateArticleDto,
    @User() user: UserEntity,
  ): Promise<ArticleResponseInterface> {
    const updatedArticle = await this.articleService.updateArticle(
      slug,
      article,
      user,
    );
    return this.articleService.buildArticleResponse(updatedArticle);
  }
}
