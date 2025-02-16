import { cacheService } from '../cache.service';
import { cache } from '../../lib/redis';

jest.mock('../../lib/redis');

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return parsed data when cache hit', async () => {
      const mockData = { test: 'data' };
      jest.spyOn(cache, 'get').mockResolvedValue(JSON.stringify(mockData));

      const result = await cacheService.get('test-key');

      expect(result).toEqual(mockData);
      expect(cache.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when cache miss', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(null);

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle cache errors gracefully', async () => {
      jest.spyOn(cache, 'get').mockRejectedValue(new Error('Cache error'));

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set cache with default TTL', async () => {
      const mockData = { test: 'data' };
      jest.spyOn(cache, 'set').mockResolvedValue('OK');

      await cacheService.set('test-key', mockData);

      expect(cache.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(mockData),
        'EX',
        300
      );
    });

    it('should set cache with custom TTL', async () => {
      const mockData = { test: 'data' };
      jest.spyOn(cache, 'set').mockResolvedValue('OK');

      await cacheService.set('test-key', mockData, 600);

      expect(cache.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(mockData),
        'EX',
        600
      );
    });
  });

  describe('invalidatePattern', () => {
    it('should delete all matching keys', async () => {
      const mockKeys = ['key1', 'key2'];
      jest.spyOn(cache, 'keys').mockResolvedValue(mockKeys);
      jest.spyOn(cache, 'del').mockResolvedValue(2);

      await cacheService.invalidatePattern('test:*');

      expect(cache.keys).toHaveBeenCalledWith('test:*');
      expect(cache.del).toHaveBeenCalledWith(...mockKeys);
    });
  });
}); 