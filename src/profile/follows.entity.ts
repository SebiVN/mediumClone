import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'follows_between_users' })
export class FollowsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  followerId: number;
  @Column()
  followingId: number;
}
