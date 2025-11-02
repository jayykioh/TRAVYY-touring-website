// services/itinerary/__tests__/optimizer.test.js
/* eslint-env node, jest */

// Ensure timers created by production code don't keep Node process alive during tests
const _realSetTimeout = global.setTimeout;
global.setTimeout = (fn, ms, ...args) => {
  const t = _realSetTimeout(fn, ms, ...args);
  if (t && typeof t.unref === 'function') {
    try { t.unref(); } catch (e) { /* ignore */ }
  }
  return t;
};

// Provide a deterministic mock for @google/generative-ai before requiring the module
const mockResponse = JSON.stringify({ summary: 'Short summary', tips: ['tip1', 'tip2'] });

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          candidates: [
            {
              content: { parts: [{ text: mockResponse }] },
            },
          ],
        },
      }),
    }),
  })),
  HarmBlockThreshold: { BLOCK_NONE: 0 },
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'harass',
    HARM_CATEGORY_HATE_SPEECH: 'hate',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'sex',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'danger',
  },
}));

describe('itinerary optimizer (unit)', () => {
  beforeEach(() => {
    // Ensure module picks up env var at load time
    jest.resetModules();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    jest.clearAllMocks();
  });

  test('buildItineraryPrompt includes expected fields and JSON instruction', () => {
    const { buildItineraryPrompt } = require('../optimizer');

    const itinerary = {
      zoneName: 'Phong Nha',
      items: [
        { name: 'Hang Son Doong' },
        { name: 'Paradise Cave' },
      ],
      preferences: { bestTime: 'morning', vibes: ['nature'] },
      totalDistance: 12345,
      totalDuration: 3600,
    };

    const tripData = { trips: [{ distance: 12345, duration: 3600 }] };

    const prompt = buildItineraryPrompt(itinerary, tripData);

    expect(typeof prompt).toBe('string');
    expect(prompt).toMatch(/Phong Nha/);
    expect(prompt).toMatch(/Quãng đường/);
    expect(prompt).toMatch(/Trả về CHỈ JSON/);
    expect(prompt).toMatch(/"summary"/);
    expect(prompt).toMatch(/"tips"/);
    // contains top item names
    expect(prompt).toMatch(/Hang Son Doong/);
  });

  test('generateSmartFallback returns summary and tips array', () => {
    const { generateSmartFallback } = require('../optimizer');

    const itinerary = {
      zoneName: 'Hội An',
      items: [{ name: 'Old Town' }, { name: 'Japanese Bridge' }],
      preferences: { bestTime: 'sunset', vibes: ['culture', 'food'] },
      totalDistance: 5000,
      totalDuration: 180,
    };

    const fb = generateSmartFallback(itinerary);
    expect(fb).toBeDefined();
    expect(typeof fb.summary).toBe('string');
    expect(Array.isArray(fb.tips)).toBe(true);
    expect(fb.tips.length).toBeGreaterThan(0);
  });

  test('callLLMAndParse returns parsed JSON when LLM provides JSON', async () => {
    const { callLLMAndParse } = require('../optimizer');

    const out = await callLLMAndParse('dummy prompt');
    expect(out).toBeDefined();
    expect(out).toHaveProperty('summary', 'Short summary');
    expect(Array.isArray(out.tips)).toBe(true);
    expect(out.tips).toContain('tip1');
  });

  test('callLLMAndParse returns null when GEMINI_API_KEY missing', async () => {
    // Load module with no API key
    delete process.env.GEMINI_API_KEY;
    jest.resetModules();
    const { callLLMAndParse } = require('../optimizer');

    const out = await callLLMAndParse('prompt');
    expect(out).toBeNull();
  });
});
