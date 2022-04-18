import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserNameToUser1649713096161 implements MigrationInterface {
    name = 'AddUserNameToUser1649713096161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

}
