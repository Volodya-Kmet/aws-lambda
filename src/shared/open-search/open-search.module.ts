import { Module } from '@nestjs/common';
import { OpenSearchService } from './open-search.service';

@Module({
  imports: [],
  providers: [OpenSearchService],
  exports: [OpenSearchService],
})
export class OpenSearchModule {}
