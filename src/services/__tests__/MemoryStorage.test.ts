import MemoryStorage from '../MemoryStorage';

describe('MemoryStorage', () => {
  it('should return result correctly', () => {
    expect(MemoryStorage.set('test', 1)).toBe(true);
  });

  it('should get result correctly', () => {
    MemoryStorage.set('test', 1);
    expect(MemoryStorage.get('test')).toBe(1);
  });
});
