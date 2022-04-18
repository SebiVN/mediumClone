import { ArticleEntity } from '@app/article/article.entity';
import { UserEntity } from '@app/user/user.entity';
import { IsNotEmpty } from 'class-validator';
import {
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'article_comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @IsNotEmpty()
  @Column()
  body: string;

  @ManyToOne(() => UserEntity, (user) => user.article_comments, { eager: true })
  author: UserEntity;

  @ManyToOne(() => ArticleEntity, (article) => article.article_comments, {
    onDelete: 'CASCADE',
  })
  article: ArticleEntity;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
