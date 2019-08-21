import alignText from '../alignText';
import flatten from '../flatten';

describe('utils#alignText', () => {
  it('should align text', () => {
    const commands = [
      'ci   develop ci function',
      'preview   add a preview',
      'depl   deploy to production'
    ];

    expect(alignText(commands)).toEqual([
      'ci        develop ci function',
      'preview   add a preview',
      'depl      deploy to production'
    ]);
  });

  it('should align text correctly if all command has the same length', () => {
    const commands = [
      'cixxxxx   develop ci function',
      'preview   add a preview',
      'deplxxx   deploy to production'
    ];

    expect(alignText(commands)).toEqual(commands);
  });
});

describe('utils#flatten', () => {
  it('should flatten array', () => {
    const deepArray = [1, 2, 3, [4, 5, 6, [7, 8]]];

    expect(flatten(deepArray)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
