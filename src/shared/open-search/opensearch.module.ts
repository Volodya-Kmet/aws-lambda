import { Module } from '@nestjs/common';
import { OpenSearchService } from './openseearch.service';

@Module({
  imports: [],
  providers: [OpenSearchService],
  exports: [OpenSearchService],
})
export class OpenSearchModule {}
