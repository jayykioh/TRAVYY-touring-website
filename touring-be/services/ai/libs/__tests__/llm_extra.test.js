/* Extra tests for llm.js: timeout, malformed JSON, and thrown errors */

jest.useRealTimers();
const path = require('path');

describe('llm - extra branches', () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.GEMINI_API_KEY;
  });

  test('timeout triggers fallback to heuristics', async () => {
    // Mock GoogleGenerativeAI where generateContent never resolves
    jest.doMock('@google/generative-ai', () => {
      return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
          getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: () => new Promise(() => {})
          })
        }))
      };
    });

    // Enable GEMINI_API_KEY so parsePrefsSmart tries AI
    process.env.GEMINI_API_KEY = 'test-key-1234';

    // Use fake timers to advance the internal timeout quickly
    jest.useFakeTimers();
    const llm = require(path.resolve(__dirname, '../llm'));

    const p = llm.parsePrefsSmart('Tôi muốn biển và ẩm thực');
    // advance beyond 3s AI timeout
    jest.advanceTimersByTime(4000);
    const out = await p;

    // Should return heuristics (object with interests/avoid keys)
    expect(out).toBeTruthy();
    expect(Array.isArray(out.interests)).toBe(true);
    expect(Array.isArray(out.avoid)).toBe(true);

    jest.useRealTimers();
  });

  test('AI returns malformed JSON -> fallback to heuristics (no crash)', async () => {
    jest.doMock('@google/generative-ai', () => {
      return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
          getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: async () => ({
              response: { text: () => 'this is not json at all' }
            })
          })
        }))
      };
    });

    process.env.GEMINI_API_KEY = 'k';
    const llm = require(path.resolve(__dirname, '../llm'));
    const out = await llm.parsePrefsSmart('Muốn đi biển');

    // Should still return a sanitized prefs object
    expect(out).toBeTruthy();
    expect(Array.isArray(out.interests)).toBe(true);
  });

  test('AI generateContent throws -> parsePrefsSmart catches and returns heuristics', async () => {
    jest.doMock('@google/generative-ai', () => {
      return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
          getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: async () => { throw new Error('API down'); }
          })
        }))
      };
    });

    process.env.GEMINI_API_KEY = 'k2';
    const llm = require(path.resolve(__dirname, '../llm'));
    const out = await llm.parsePrefsSmart('Tôi thích ẩm thực');
    expect(out).toBeTruthy();
    expect(Array.isArray(out.interests)).toBe(true);
  });
});
