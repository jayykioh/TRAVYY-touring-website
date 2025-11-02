You are a senior JS test engineer. Produce a single, runnable Jest test file (CommonJS) that is deterministic and fully offline for the Travyy backend (Node 18+). Follow these strict rules exactly.

Context & environment
- Node: 18+ (native fetch available). Jest v30+ is expected.
- Project root: the test will be run from the repository folder that contains `touring-be/package.json`.
- Tests must be runnable with: npm test
- Use only CommonJS (require) in the test file.

Global rules (must follow)
1. Test style: AAA (Arrange-Act-Assert). Keep tests small and focused.
2. Framework: Jest. For HTTP route tests use supertest and require the Express app (do NOT call app.listen). Assume server exports the app: `const app = require('../../server')` (adjust path per project – caller will specify exact require path if needed).
3. Mock EVERYTHING external:
   - LLM: mock `@google/generative-ai` via `jest.mock()` when testing code that would call it.
   - HTTP: mock network calls (embedding service, goong/map APIs) by stubbing `global.fetch = jest.fn()` in tests.
   - DB: mock Mongoose model methods (e.g., find, findOne, lean, countDocuments, save) with jest spies or jest.mock for model modules.
   - Any other external library that does network or filesystem side-effects should be mocked.
4. No real network or DB calls allowed — tests must pass offline.
5. Clean up after each test: use afterEach to call jest.clearAllMocks(), jest.resetModules(), and restore any altered globals (e.g., delete global.fetch or restore original).
6. Fixtures: If a large sample is required, use a fixture file under `__fixtures__/zones.sample.json`. Prefer inline minimal fixtures where possible.
7. Output requirement: The assistant must return ONLY the test file content inside a single fenced code block (```javascript ... ```). No extra text.
8. File path: the caller will specify the exact desired test file path. The test content must match that location (i.e., test should assume require paths from project root).
9. Assertions: tests should assert behavior and outputs (not implementation internals). Use toEqual, toBe, toHaveBeenCalledWith, etc.

Acceptance criteria (must pass)
- Running `npm test` from `touring-be` must execute the created test and it should PASS (given the mocks in the test file).
- Tests generate coverage folder when run with `npm run test:coverage`.
- No open handles or timers remain after tests (use .unref or ensure no setTimeout is left).
- Tests do not import or execute ESM-only modules (avoid requiring node-fetch v3 files directly).

What to include in the test file (depending on target)
- If target is a parser module (e.g., `services/ai/libs/llm.js`):
  - Mock `@google/generative-ai` so generateContent returns deterministic JSON.
  - Test heuristics-only path and AI-enriched path.
- If target is embedding client (`services/ai/libs/embedding-client.js`):
  - Stub `global.fetch` to simulate /embed, /upsert, /search, /hybrid-search, /healthz responses (ok/non-ok).
  - Test success and error paths.
- If target is a route (`routes/discover.routes.js` → POST /api/discover/parse):
  - Use `supertest` against `require('../../server')`.
  - Mock underlying services: `services/ai` (parsePreferences) and `services/zones` (getMatchingZones), ensure response shape and status.
- If target is matcher/scorer (`services/zones/matcher.js`, `services/zones/scorer.js`):
  - Mock embedding-client functions (`isAvailable`, `hybridSearch`) and `models/Zones` methods.
  - Provide minimal sample zone docs inline.

Teardown & reliability
- Use afterEach to clear mocks/reset modules.
- Use deterministic timestamps/IDs if needed (stub Date.now or uuid).
- Avoid process.env side-effects; if tests set env vars, restore previous values.

Exact output requirements to the assistant (repeat)
- I will supply: (a) target module path, (b) its public API (or code if necessary), (c) desired test file path (relative to project root).
- You must return ONLY the test file content in a single fenced code block using CommonJS require.
- The test file must be self-contained (aside from fixtures path if requested) and runnable with `npm test` from `touring-be`, using only the repository's installed packages and the mocks included in the test.

Example short template (for your reference only; DO NOT output this in final result):
```javascript
// Example structure (not to be returned verbatim)
const { myFn } = require('../path/to/module');
jest.mock('...'); // mocks
describe('myFn', () => {
  afterEach(() => { jest.resetAllMocks(); jest.resetModules(); });
  test('...', () => {
    // Arrange
    // Act
    // Assert
  });
});





# PROMPT LLM 

Target: services/ai/libs/llm.js
Public API to test:
- extractJsonFromText(text)
- extractDuration(text)
- heuristicExtractVibes(text)
- enrichFromVietnamese(text)
- parsePrefsSmart(text, { enableLLM?: boolean, geminiApiKey?: string })

Constraints:
- Mock @google/generative-ai using a __mocks__ module so parsePrefsSmart behaves deterministically
  when heuristics are weak.
- Create tests that cover:
  * JSON fenced vs plain vs invalid
  * duration weeks / range / none
  * heuristic extraction (vibes/avoid)
  * parsePrefsSmart(heuristic-strong) → should NOT rely on LLM
  * parsePrefsSmart(heuristic-weak) → should call LLM mock and merge

Desired output path:
services/ai/libs/__tests__/llm.test.js

Please produce ONLY the test file content in a single code block.



EMBEDDING_CLIENT_TEST_JS

Target: services/ai/libs/embedding-client.js
Public API to test:
- health(baseUrl)
- isAvailable(baseUrl)
- embed(baseUrl, texts)
- upsert(baseUrl, items)
- search(baseUrl, query, topK, filterType)
- hybridSearch(baseUrl, body)

Constraints:
- Mock global.fetch for all requests. No network.
- Cover ok path and error path (response.ok=false and throws).
- Keep tests small and deterministic.

Desired output path:
services/ai/libs/__tests__/embedding-client.test.js

Return ONLY the test file content.






KEYWORD_MATCHER_TEST_JS

Target: services/ai/libs/keyword-matcher.js
Public API:
- extractFlexibleKeywords(text) → string[]
- scoreKeywordMatch(keywords:string[], zone:{tags?:string[], vibes?:string[], desc?:string}) → number

Constraints:
- Create tests to show canonicalization (e.g., "biển"→"beach", "hoàng hôn"→"sunset", "yên tĩnh"→"quiet").
- Show scoring differences: exact > semantic > none.

Desired output path:
services/ai/libs/__tests__/keyword-matcher.test.js

Return ONLY the test file content.




SCORER 
Target: services/zones/scorer.js
Public API:
- computeRuleScore(prefs, zone) → { ruleScore:number, matchedVibes:string[], matchedKeywords:string[], penalties:number }

Fixtures:
- Use services/zones/__tests__/__fixtures__/zones.sample.json (3–5 zones).
- Assume it exists and contains fields: id, name, desc, tags, vibes, rating, province.

Constraints:
- Tests must verify higher score for zones matching vibes/keywords.
- Verify avoid penalty applied.
- Verify empty prefs handled.

Desired output path:
services/zones/__tests__/scorer.test.js

Return ONLY the test file content.



Target: services/zones/matcher.js
Public API:
- getMatchingZones(prefs) → { strategy:'embedding'|'keyword', items:[{ zone, ruleScore, embedScore?, finalScore }] }

Mocks:
- jest.mock('../../ai/libs/embedding-client', () => ({ isAvailable, hybridSearch }))
- jest.mock('../../../models/Zones', () => ({ find: () => ({ lean: async () => mockZones }) }))
- Load mockZones from services/zones/__tests__/__fixtures__/zones.sample.json

Cases:
- Embedding path: isAvailable=true, hybridSearch returns hits -> expect strategy 'embedding' and re-ranking applied.
- Keyword fallback: isAvailable=false -> expect strategy 'keyword'.

Desired output path:
services/zones/__tests__/matcher.test.js

Return ONLY the test file content.



Prompt cho Route /api/discover/parse
Target: routes/discover.routes.js (mounted into server)
Test via supertest on exported `app` from server.js (assume module.exports = app).

Mocks:
- jest.mock('../../services/ai/libs/llm', () => ({ parsePrefsSmart: jest.fn(...) }))
- jest.mock('../../services/zones/matcher', () => ({ getMatchingZones: jest.fn(...) }))

Case:
- POST /api/discover/parse with { text: "thích biển chụp ảnh" }
- Expect 200, body.prefs.vibes contains 'beach','photo'
- body.zones.items[0] contains a zone id

Desired output path:
routes/__tests__/discover.routes.test.js

Return ONLY the test file content.
