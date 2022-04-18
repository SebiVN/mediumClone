import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1649961639478 implements MigrationInterface {
  name = 'SeedDb1649961639478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`insert into tags(name) values ('cat'),('coffee')`);
    await queryRunner.query(
      // password is 123
      `INSERT INTO users (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$sb6FXe8PuK8w6uioXxVgBe5UG1lJj2dGjf4PzWDlGEvhdCss7SVJ2')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'First article description', 'First article body', 'coffee,dragons', 1), ('second-article', 'Second article', 'Second article description', 'Second article body', 'coffee,dragons', 1)`,
    );
  }

  public async down(): Promise<void> {}
}
