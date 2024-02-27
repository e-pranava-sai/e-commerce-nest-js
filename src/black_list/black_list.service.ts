import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BlackListService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async addToBlacklist(token: string) {
    await this.cacheManager.set(token, true, 0);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const value = await this.cacheManager.get(token);
    return !!value;
  }
}
