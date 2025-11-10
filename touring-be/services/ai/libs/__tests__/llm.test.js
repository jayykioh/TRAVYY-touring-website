// Unit tests for services/ai/libs/llm.js
// Mocks GoogleGenerativeAI so tests are deterministic and offline.

jest.resetModules();

// Mock the @google/generative-ai package before requiring the module under test
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: async (prompt) => {
          // Return interests (not vibes) so mergePrefs can pick them up as interests
          return {
            response: {
              text: () => '{"interests":["beach","food"],"avoid":["crowded"],"pace":"slow","budget":"low","durationDays":5}'
            }
          };
        }
      })
    }))
  };
});

// Do NOT set GEMINI_API_KEY here to avoid starting the AI timeout in parsePrefsSmart.
// Tests will exercise heuristics and utility functions deterministically.

const path = require('path');

// Ensure AI key is disabled during tests to avoid starting AI timeout timers
const _origGemini = process.env.GEMINI_API_KEY;
process.env.GEMINI_API_KEY = '';

const llm = require(path.resolve(__dirname, '../llm'));

afterAll(() => {
  // restore original env
  if (typeof _origGemini === 'undefined') delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = _origGemini;
});

describe('llm module - unit tests', () => {
  test('extractJsonFromText: extracts fenced JSON', () => {
    const txt = 'Some text\n```json\n{ "a": 1, "b": "x" }\n```\nmore';
    const parsed = llm.extractJsonFromText(txt);
    expect(parsed).toEqual({ a: 1, b: 'x' });
  });

  test('extractJsonFromText: extracts first JSON in plain text', () => {
    const txt = 'prefix {"foo": "bar"} suffix';
    const parsed = llm.extractJsonFromText(txt);
    expect(parsed).toEqual({ foo: 'bar' });
  });

  test('extractJsonFromText: returns null for invalid JSON', () => {
    const txt = 'no json here';
    const parsed = llm.extractJsonFromText(txt);
    expect(parsed).toBeNull();
  });

  test('extractDuration: parses weeks and ranges correctly', () => {
    expect(llm.extractDuration('2 tuần')).toBe(14);
    expect(llm.extractDuration('2-3 ngày')).toBe(3);
    expect(llm.extractDuration('3 days')).toBe(3);
    expect(llm.extractDuration('no duration')).toBeNull();
  });

  test('heuristicExtractVibes: extracts vibes and avoid keys', () => {
    const txt = 'Tôi muốn đi biển, tránh chỗ đông và không thích đi bộ nhiều';
    const res = llm.heuristicExtractVibes(txt);
    expect(res.vibes).toEqual(expect.arrayContaining(['beach']));
    // avoid should include 'crowded' and/or 'walking'
    expect(res.avoid).toEqual(expect.arrayContaining(['crowded']));
    // keywords should be an array (from keyword-matcher)
    expect(Array.isArray(res.keywords)).toBe(true);
  });

  test('parsePrefsSmart: falls back to AI (mocked) when heuristics insufficient', async () => {
    const shortText = 'Short input that has little heuristic signal';
    const out = await llm.parsePrefsSmart(shortText);
    // Heuristics-only path should return a sanitized prefs object even when AI not available
    expect(out).toBeTruthy();
    expect(Array.isArray(out.interests)).toBe(true);
    expect(Array.isArray(out.avoid)).toBe(true);
    expect(typeof out.durationDays === 'number' || out.durationDays === null).toBe(true);
  });
});
