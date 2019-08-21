import HubotScript from '../HubotScript';

describe('HubotScript.readScript', () => {
  it('should load scripts', () => {
    const scripts = HubotScript.readScripts();
    expect(Array.isArray(scripts)).toBe(true);
  });
});
