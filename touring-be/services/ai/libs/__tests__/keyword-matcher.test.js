const km = require('../keyword-matcher');

describe('keyword-matcher', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('extractFlexibleKeywords: extracts canonical groups from text', () => {
    // Arrange
    const text = 'Tôi thích bãi biển, hải sản và chụp ảnh ở view đẹp';

    // Act
    const res = km.extractFlexibleKeywords(text);

    // Assert
    expect(Array.isArray(res)).toBe(true);
    // Should include beach, seafood (mapped to food/seafood), photo
    expect(res).toEqual(expect.arrayContaining(['beach', 'seafood', 'photo']));
  });

  test('scoreKeywordMatch: exact, semantic group, partial, none', () => {
    // Arrange
    const userText = 'Tôi muốn đi biển và ăn hải sản ở quán rẻ';

    // Exact match
    expect(km.scoreKeywordMatch(userText, 'hải sản')).toBeGreaterThan(0);

    // Semantic group match (term present in SEMANTIC_GROUPS)
    expect(km.scoreKeywordMatch(userText, 'seafood')).toBeGreaterThan(0);

    // Partial match (substring)
    expect(km.scoreKeywordMatch('I love swimming', 'swim')).toBeGreaterThan(0);

    // No match
    expect(km.scoreKeywordMatch('nothing here', 'mountain')).toBe(0);
  });

  test('calculateSemanticMatch: returns score and matches', () => {
    // Arrange
    const userText = 'Tôi thích núi, rừng và thiên nhiên';
    const zoneKeywords = ['mountain', 'beach', 'forest'];

    // Act
    const res = km.calculateSemanticMatch(userText, zoneKeywords);

    // Assert
    expect(res).toHaveProperty('score');
    expect(res).toHaveProperty('matches');
    expect(res.matches.length).toBeGreaterThanOrEqual(1);
    expect(typeof res.score).toBe('number');
  });
});
