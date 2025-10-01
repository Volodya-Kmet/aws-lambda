import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ConfigService, ConfigService],
  exports: [ConfigService],
})
export class CustomConfigModule extends ConfigModule {}
