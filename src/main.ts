if (!process.env.IS_TS_NODE) {
  require('module-alias/register');
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { Logger } from '@nestjs/common';
import { configuration } from './configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['error', 'log'],
  });
  await app.listen(configuration().port);
  Logger.log('Application Started');
}
bootstrap();
