import { splitTextToBulletItems } from './text.utilities';

describe('splitTextToBulletItems', () => {
  it('should split dot-separated string into array of trimmed items', () => {
    const input = '4 huevos revueltos. cebolla. cilantro. chile dulce';
    const result = splitTextToBulletItems(input);

    expect(result).toEqual(['4 huevos revueltos', 'cebolla', 'cilantro', 'chile dulce']);
  });

  it('should handle strings with extra spaces', () => {
    const input = 'apple  .   banana   .   orange';
    const result = splitTextToBulletItems(input);

    expect(result).toEqual(['apple', 'banana', 'orange']);
  });

  it('should filter out empty items', () => {
    const input = 'apple. . banana. . . orange';
    const result = splitTextToBulletItems(input);

    expect(result).toEqual(['apple', 'banana', 'orange']);
  });

  it('should handle single item without dot', () => {
    const input = 'single item';
    const result = splitTextToBulletItems(input);

    expect(result).toEqual(['single item']);
  });

  it('should return empty array for empty string', () => {
    const result = splitTextToBulletItems('');

    expect(result).toEqual([]);
  });

  it('should return empty array for whitespace-only string', () => {
    const result = splitTextToBulletItems('   ');

    expect(result).toEqual([]);
  });

  it('should return empty array for null', () => {
    const result = splitTextToBulletItems(null);

    expect(result).toEqual([]);
  });

  it('should return empty array for undefined', () => {
    const result = splitTextToBulletItems(undefined);

    expect(result).toEqual([]);
  });

  it('should handle special characters and unicode', () => {
    const input = 'pimienta negra. 🌶️ chile rojo. cilantro fresco';
    const result = splitTextToBulletItems(input);

    expect(result).toEqual(['pimienta negra', '🌶️ chile rojo', 'cilantro fresco']);
  });
});
