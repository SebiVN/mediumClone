import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { configuration } from './configuration';
const config: TypeOrmModuleAsyncOptions = {
  useFactory: () => ({
    type: 'postgres',
    host: configuration().database.host,
    port: configuration().database.port,
    username: configuration().database.username,
    password: configuration().database.password,
    database: configuration().database.database_name,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
  }),
};
export default config;
