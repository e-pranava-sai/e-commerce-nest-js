import { Global, Module } from '@nestjs/common';
import { BlackListService } from './black_list.service';

@Module({
  exports: [BlackListService],
  providers: [BlackListService],
})
@Global()
export class BlacklistModuel {}
