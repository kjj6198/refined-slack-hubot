import HubotScript from '../HubotScript';
import MemoryStorage from '../MemoryStorage';

describe('HubotScript.readScript', () => {
  it('should load scripts', () => {
    const scripts = HubotScript.readScripts();
    expect(Array.isArray(scripts)).toBe(true);
  });

  it('should throw error if has duplicated scripts', () => {
    const scripts = [
      {
        name: 'test',
        command: 'test',
        action: () => {}
      },
      {
        name: 'test',
        command: 'test',
        action: () => {}
      }
    ];

    expect(() => {
      MemoryStorage.del('scripts'); // make sure no cache.
      HubotScript.readScripts(() => scripts);
    }).toThrowError();
  });
});
