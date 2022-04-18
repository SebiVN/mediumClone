import {MigrationInterface, QueryRunner} from "typeorm";

export class ModifyColumnName1650131347051 implements MigrationInterface {
    name = 'ModifyColumnName1650131347051'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "favoriteCount" TO "favoritesCount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "favoritesCount" TO "favoriteCount"`);
    }

}
