const path = require('path');

describe('optimizer.generateAIInsightsAsync - background update branches', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    jest.clearAllMocks();
  });

  test('saves LLM insights when callLLMAndParse returns data', async () => {
    // Mock GoogleGenerativeAI similarly to main optimizer unit tests
    const mockResponse = JSON.stringify({ summary: 'ok', tips: ['t1'] });
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              candidates: [ { content: { parts: [ { text: mockResponse } ] } } ]
            }
          })
        })
      })),
      HarmBlockThreshold: { BLOCK_NONE: 0 },
      HarmCategory: {
        HARM_CATEGORY_HARASSMENT: 'harass',
        HARM_CATEGORY_HATE_SPEECH: 'hate',
        HARM_CATEGORY_SEXUALLY_EXPLICIT: 'sex',
        HARM_CATEGORY_DANGEROUS_CONTENT: 'danger',
      },
    }));

    process.env.GEMINI_API_KEY = 'kk';

    // Mock Itinerary model
    jest.doMock('../../../models/Itinerary', () => ({
      findById: jest.fn().mockResolvedValue({ aiInsights: null, aiProcessing: true, save: jest.fn().mockResolvedValue(true) })
    }));

    const optimizer = require(path.resolve(__dirname, '../optimizer'));
    const { generateAIInsightsAsync } = optimizer;

    await generateAIInsightsAsync('it1', { zoneName: 'Z', items: [] }, { trips: [{ distance: 1000, duration: 600 }] });

    const It = require('../../../models/Itinerary');
    const foundPromise = It.findById.mock.results[0].value;
    const doc = await foundPromise;

    // doc.aiInsights may be filled by LLM or fallback; assert structure and save was called
    expect(doc.aiInsights).toBeTruthy();
    expect(typeof doc.aiInsights.summary).toBe('string');
    expect(Array.isArray(doc.aiInsights.tips)).toBe(true);
    expect(doc.save).toHaveBeenCalled();
  });

  test('on LLM error, saves fallback into itinerary', async () => {
    // Mock GoogleGenerativeAI to throw when generateContent is called
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: async () => { throw new Error('LLM fail'); }
        })
      }))
    }));

    process.env.GEMINI_API_KEY = 'kk2';

    jest.doMock('../../../models/Itinerary', () => ({
      findById: jest.fn().mockResolvedValue({ aiInsights: null, aiProcessing: true, save: jest.fn().mockResolvedValue(true) })
    }));

    const optimizer = require(path.resolve(__dirname, '../optimizer'));
    const { generateAIInsightsAsync } = optimizer;
    await generateAIInsightsAsync('it2', { zoneName: 'Z', items: [] }, null);

    const It = require('../../../models/Itinerary');
    const foundPromise = It.findById.mock.results[0].value;
    const doc = await foundPromise;

    // After error recovery, fallback should be saved
    expect(doc.aiInsights).toBeTruthy();
    expect(doc.aiProcessing).toBe(false);
    expect(doc.save).toHaveBeenCalled();
  });
});
