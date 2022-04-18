import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleResponseInterface } from '@app/article/type/articleResponse.interface';
import slugyfy from 'slugify';
import { ArticlesResponseInterface } from '@app/article/type/articlesResponse.interface';
import { FollowsEntity } from '@app/profile/follows.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowsEntity)
    private readonly userFollowsRepository: Repository<FollowsEntity>,
  ) {}

  async createArticle(
    user: UserEntity,
    createdArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    try {
      const article = new ArticleEntity();
      Object.assign(article, createdArticleDto);
      if (!article.tagList) {
        article.tagList = [];
      }
      article.slug = this.getSlug(createdArticleDto.title);
      article.author = user;
      return this.articleRepository.save(article);
    } catch (err) {
      Logger.error(
        'There was an error creating article',
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  async findAll(
    user: UserEntity,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const querySelector = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    querySelector.orderBy('articles.createdAt', 'DESC');
    if (query.tag) {
      querySelector.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }
    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });
      querySelector.andWhere('articles.authorId = :id', {
        id: author?.id ?? null,
      });
    }
    if (query.limit) {
      querySelector.limit(query.limit);
    }
    if (query.offset) {
      querySelector.offset(query.offset);
    }
    if (query.favorited) {
      const author = await this.userRepository.findOne(
        {
          username: query.favorited,
        },
        { relations: ['favorites'] },
      );
      let ids: number[];
      if (author && author.favorites.length > 0) {
        ids = author.favorites.map((el) => el.id);
      } else {
        ids = [null];
      }
      querySelector.andWhere('articles.id in (:...ids)', { ids: ids });
    }
    let favoriteArticlesIds: number[] = [];
    try {
      const articlesCount = await querySelector.getCount();

      if (user) {
        const currentUser = await this.userRepository.findOne(user.id, {
          relations: ['favorites'],
        });
        favoriteArticlesIds = currentUser.favorites.map((el) => el.id);
      }
      const articles = await querySelector.getMany();

      const articleWithFavoriteId = articles.map((article) => {
        const favorited = favoriteArticlesIds.includes(article.id);
        return { ...article, favorited };
      });

      return { articles: articleWithFavoriteId, articlesCount };
    } catch (err) {
      Logger.error(
        `There was an error finding article`,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  async getArticleBySlug(articleSlug: string): Promise<ArticleEntity> {
    try {
      return await this.articleRepository.findOne({ slug: articleSlug });
    } catch (err) {
      Logger.error(
        `There was an error finding article by slug`,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }
  async deleteArticle(slug: string, user: UserEntity): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.BAD_REQUEST);
    }
    if (article.author.id !== user.id) {
      throw new HttpException(
        'You are not an author of this article',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.articleRepository.delete({ slug: slug, author: user });
  }

  async updateArticle(
    slug: string,
    article: CreateArticleDto,
    user: UserEntity,
  ): Promise<ArticleEntity> {
    const art = await this.getArticleBySlug(slug);

    if (!art) {
      throw new HttpException('Article does not exist', HttpStatus.BAD_REQUEST);
    }
    if (art.author.id !== user.id) {
      throw new HttpException(
        'You are not an author of this article',
        HttpStatus.UNAUTHORIZED,
      );
    }
    Object.assign(art, article);
    art.slug = this.getSlug(art.title);
    return await this.articleRepository.save(art);
  }

  async addArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);

    if (!article) {
      throw new HttpException('Article do not exists', HttpStatus.NOT_FOUND);
    }
    try {
      const user = await this.userRepository.findOne(currentUserId, {
        relations: ['favorites'],
      });
      const isNotFavorite =
        user.favorites.findIndex(
          (articleInFavorites) => articleInFavorites.id === article.id,
        ) === -1;

      if (isNotFavorite) {
        user.favorites.push(article);
        article.favoritesCount++;
        await this.userRepository.save(user);
        await this.articleRepository.save(article);
      }
      return article;
    } catch (err) {
      Logger.error(
        `There was an error adding article to favorites: `,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  async deleteArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Article do not exists', HttpStatus.NOT_FOUND);
    }
    try {
      const user = await this.userRepository.findOne(currentUserId, {
        relations: ['favorites'],
      });

      const articleIndex = user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      );

      if (articleIndex >= 0) {
        user.favorites.splice(articleIndex);
        article.favoritesCount--;
        await this.userRepository.save(user);
        await this.articleRepository.save(article);
      }
      return article;
    } catch (err) {
      Logger.error(
        `There was an error deleting article to favorites: `,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  async getCurrentUserFeed(query: any, currentUser: UserEntity) {
    try {
      const followUsers = await this.userFollowsRepository.find({
        followerId: currentUser.id,
      });

      if (!followUsers) {
        return { articles: [], articlesCount: 0 };
      }

      let ids: number[];
      if (followUsers && followUsers.length > 0) {
        ids = followUsers.map((follow) => follow.followingId);
      } else {
        ids = [null];
      }

      const articlePostByFollowedUsers = getRepository(ArticleEntity)
        .createQueryBuilder('articles')
        .leftJoinAndSelect('articles.author', 'author')
        .where('articles.authorId in (:...ids)', { ids: ids });

      articlePostByFollowedUsers.orderBy('articles.createdAt', 'DESC');

      const articlesCount = await articlePostByFollowedUsers.getCount();
      if (query.limit) {
        articlePostByFollowedUsers.limit(query.limit);
      }
      if (query.offset) {
        articlePostByFollowedUsers.offset(query.offset);
      }
      const articles = await articlePostByFollowedUsers.getMany();
      return { articles, articlesCount };
    } catch (err) {
      Logger.error(
        `There was an error generating the feed:`,
        err.toString ? err.toString() : JSON.stringify(err),
      );
      throw err;
    }
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugyfy(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
