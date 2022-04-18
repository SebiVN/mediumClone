import {MigrationInterface, QueryRunner} from "typeorm";

export class ComentsTable1650144610709 implements MigrationInterface {
    name = 'ComentsTable1650144610709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "article_comments" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "body" character varying NOT NULL, "authorId" integer, "articleId" integer, CONSTRAINT "PK_76305985dc2ec48641fdbd44c76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "article_comments" ADD CONSTRAINT "FK_a4126427ed0d9660c2a6ccdea83" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article_comments" ADD CONSTRAINT "FK_7042a18a394319c32bb2d39f854" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article_comments" DROP CONSTRAINT "FK_7042a18a394319c32bb2d39f854"`);
        await queryRunner.query(`ALTER TABLE "article_comments" DROP CONSTRAINT "FK_a4126427ed0d9660c2a6ccdea83"`);
        await queryRunner.query(`DROP TABLE "article_comments"`);
    }

}
