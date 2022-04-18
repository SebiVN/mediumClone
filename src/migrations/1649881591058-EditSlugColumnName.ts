import {MigrationInterface, QueryRunner} from "typeorm";

export class EditSlugColumnName1649881591058 implements MigrationInterface {
    name = 'EditSlugColumnName1649881591058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "slag" TO "slug"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "slug" TO "slag"`);
    }

}
