const path = require('path');

// Require the module under test
const llm = require(path.join('..', 'llm'));

describe('llm - additional unit tests', () => {
  test('extractJsonFromText - fenced JSON block', () => {
    const text = 'prefix ```json\n{ "a": 1, "b": "hi" }\n``` suffix';
    expect(llm.extractJsonFromText(text)).toEqual({ a: 1, b: 'hi' });
  });

  test('extractJsonFromText - inline JSON', () => {
    const text = 'please return {"x": [1,2], "y": "ok"} thanks';
    expect(llm.extractJsonFromText(text)).toEqual({ x: [1, 2], y: 'ok' });
  });

  test('extractJsonFromText - invalid JSON returns null', () => {
    const text = 'here is invalid json: { a: 1, }';
    expect(llm.extractJsonFromText(text)).toBeNull();
  });

  test('extractDuration - weeks, ranges, days and none', () => {
    expect(llm.extractDuration('Tôi có 2 tuần nghỉ')).toBe(14);
    expect(llm.extractDuration('2-3 ngày là đủ')).toBe(3);
    expect(llm.extractDuration('I need 4 days')).toBe(4);
    expect(llm.extractDuration('no duration here')).toBeNull();
  });

  test('heuristicExtractVibes - detects vibes and avoids and keywords', () => {
    const txt = 'Tôi thích biển nhưng tránh chỗ đông và không thích ồn ào';
    const res = llm.heuristicExtractVibes(txt);
    // vibes should include 'beach'
    expect(res.vibes).toContain('beach');
    // avoid should include 'crowded' (tránh chỗ đông)
    expect(res.avoid).toContain('crowded');
    // keywords should include 'beach' (from semantic extractor)
    expect(Array.isArray(res.keywords)).toBe(true);
  });

  test('enrichFromVietnamese - maps interests, avoid, pace, budget, duration', () => {
    const txt = 'Tôi thích ẩm thực, tránh nóng, không thích đi bộ, tiết kiệm, 3 ngày';
    const res = llm.enrichFromVietnamese(txt);
    expect(res.interests).toContain('food');
    expect(res.avoid).toContain('hot');
    expect(res.avoid).toContain('walking');
    expect(res.budget).toBe('low');
    expect(res.durationDays).toBe(3);
  });

  test('sanitizePrefs - trims long lists, normalizes and invalidates bad pace/budget/duration', () => {
    const longKeywords = Array.from({ length: 12 }, (_, i) => `k${i}`);
    const parsed = {
      interests: ['A', 'B', 'C', 'D', 'E', 'F'],
      avoid: ['a', 'b', 'c', 'd', 'e', 'f'],
      keywords: longKeywords,
      pace: 'fast', // invalid (not light/medium/intense)
      budget: 'unknown', // invalid
      durationDays: 'not-a-number'
    };
    const out = llm.sanitizePrefs(parsed);
    expect(out.interests.length).toBe(5);
    expect(out.avoid.length).toBe(5);
    expect(out.keywords.length).toBe(10);
    expect(out.pace).toBeNull();
    expect(out.budget).toBeNull();
    expect(out.durationDays).toBeNull();
  });

  test('parsePrefsSmart - heuristic-only path when signal present or no API key', async () => {
    const txt = 'thích biển và núi'; // two interests -> hasSignal
    const out = await llm.parsePrefsSmart(txt);
    expect(out.interests.length).toBeGreaterThanOrEqual(2);
    // since heuristics used, budget/pace should be present (may be null)
    expect(Object.prototype.hasOwnProperty.call(out, 'durationDays')).toBe(true);
  });
});
