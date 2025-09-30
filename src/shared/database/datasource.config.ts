import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { DatabaseModule } from './database.module';

export default new DataSource(DatabaseModule.getTypeOrmOptions() as DataSourceOptions);
