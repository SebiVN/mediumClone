import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTableFollowsBetweenUsers1650064296646 implements MigrationInterface {
    name = 'AddTableFollowsBetweenUsers1650064296646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follows_between_users" ("id" SERIAL NOT NULL, "followerId" integer NOT NULL, "followingId" integer NOT NULL, CONSTRAINT "PK_f7e788ae103bbe16b8615b78e2d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "follows_between_users"`);
    }

}
