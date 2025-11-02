# AI Feature Flow & Test Plan

This document explains the AI-related feature flow in this project, the files involved, how they interact (end-to-end), required environment variables, and recommended test cases and mocking strategies to build a deterministic test suite.

Purpose
- Provide a single reference for developers to understand the LLM + embedding + matching + POI + itinerary flows.
- Provide a prioritized per-file test plan so you can implement the test suite fast for submission.

Audience
- Contest judges and teammates who will implement tests and prepare the submission package.

Summary flow (high level)
1. Frontend sends free-text preferences (vibes/avoid/freeText) to endpoint /api/discover/parse (see `routes/discover.routes.js`).
2. `discover.routes` calls `services/ai.parsePreferences` (or `services/ai/libs/llm.js` directly) which runs `parsePrefsSmart`:
   - Heuristics first (language patterns + semantic keyword extraction via `keyword-matcher.js`).
   - If heuristics are weak and GEMINI API key present, call LLM (Google Gemini via `@google/generative-ai`) to enrich preferences.
   - Sanitize and return structured `prefs` ({ interests/vibes, avoid, pace, budget, durationDays, keywords, _rawText }).
3. The parsed preferences are passed to `services/zones/getMatchingZones` (implemented in `services/zones/matcher.js`):
   - If embedding service available (`services/ai/libs/embedding-client.isAvailable`): call `hybridSearch` to get vector-based hits (embedding-client talks to an embedding service at EMBED_SERVICE_URL).
   - Otherwise fallback to keyword-based matching using Zone DB (`models/Zones`) and `keyword-matcher` logic.
   - Always re-rank candidates using `[services/zones/scorer.js]` which computes `ruleScore` and merges with `embedScore` to a `finalScore`.
4. `discover.routes` returns top zones to frontend.
5. When user opens a zone, the code calls `services/zones/poi-finder.js` which:
   - Uses `services/ai/libs/map4d.js` or `goong.js` to fetch POIs (external mapping APIs).
   - Scores POIs (`poi-scorer.js`) and returns POI lists to frontend.
6. Adding POIs to itinerary uses itinerary routes (`routes/itinerary.routes.js`) and `models/Itinerary`.
7. Optimize itinerary (AI-assisted): `services/itinerary/optimizer.js` calls external routing/trip APIs (goong `tripV2`) and calls LLM (`GoogleGenerativeAI`) for summarization and insights (callLLMAndParse). Output is stored as `aiInsights` on itinerary.
8. Tour flow: if itinerary contains a `tour` item or is a custom tour, the code takes different actions (marking itinerary as custom/booking flow). There are route handlers for requesting tour guides (`/api/itinerary/:id/request-tour-guide`).

Files involved (core AI/embedding/flow)
- services/ai/libs/llm.js — LLM heuristics + optional Gemini calls. Primary parser used for user preferences.
- services/ai/libs/keyword-matcher.js — semantic keyword extraction and scoring helpers used by heuristics and scorer.
- services/ai/libs/embedding-client.js — HTTP client that talks to embedding service (embed, upsert, search, hybrid-search, health). Used by matcher.
- services/ai/libs/embedding-sync-zones.js — syncs zones to embedding service (upsert). Helpful for integration tests if you want an index.
- services/zones/matcher.js — glue: uses embedding-client, Zone DB, and `scorer` to produce ranked zones.
- services/zones/scorer.js — compute rule-based score from preferences & zone data.
- services/zones/poi-finder.js — POI retrieval & merging using `map4d.js`/`goong.js`.
- services/itinerary/optimizer.js — LLM-based itinerary summarization and insights (callLLMAndParse, generateAIInsightsAsync).
- routes/discover.routes.js — entrypoint for parsing + matching API.

Models
- models/Zones.js — DB for zone documents (used by matcher and poi-finder).
- models/Itinerary.js — itinerary storage, used by itinerary routes.

External services / env vars required
- GEMINI_API_KEY — used by `llm.js` and other LLM callers.
- EMBED_SERVICE_URL — embedding service base URL (default http://localhost:8088). Used by `embedding-client.js`.
- GOONG_API_KEY — used by `goong.js`.
- MAP4D_API_KEY — used by `map4d.js`.

Recommended Test Strategy (prioritized)

Priority A — must-have for submission (fast, deterministic unit tests)
- Unit tests for `services/ai/libs/llm.js`
  - extractJsonFromText: fenced JSON, plain JSON, invalid text.
  - extractDuration: weeks, ranges, days, none.
  - heuristicExtractVibes & enrichFromVietnamese: ensure proper extraction and avoid detection.
  - parsePrefsSmart: two unit tests
    * Heuristic-strong input: assert no AI call; output derived purely from heuristics.
    * Heuristic-weak input: mock `@google/generative-ai` (mock getGenerativeModel().generateContent()) to return JSON (with `interests` or `keywords`) and assert merged sanitized prefs.
  - Mocks: jest.mock('@google/generative-ai') to return deterministic response.

- Unit tests for `services/ai/libs/embedding-client.js`
  - Mock `global.fetch` to return fake responses for endpoints: /embed, /upsert, /search, /hybrid-search, /healthz.
  - Test error path when response.ok === false and timeout (simulate fetch throw).

- Unit tests for `services/ai/libs/keyword-matcher.js`
  - extractFlexibleKeywords: map text pieces to canonical groups.
  - scoreKeywordMatch: exact, semantic group, partial, none.

Priority B — important integration / logic pieces
- Unit tests for `services/zones/scorer.js`
  - Create sample zone objects (name, desc, tags, vibes, rating) and pref objects; assert score ranges, matchedVibes, matchedKeywords and penalty for avoid.
  - Edge cases: empty preferences, empty zone fields.

- Unit tests for `services/zones/matcher.js` (mock external dependencies)
  - Mock `embedding-client.isAvailable()` and `embedding-client.hybridSearch()` for embedding path. Provide sample embedding hits (with id and score). Mock `Zone.find()` to return zone docs with `embedScore` populated (or map hits to DB records using a simple mock of `Zone.find`/`lean`).
  - Test fallback keyword path: mock `isAvailable()` => false; `Zone.find()` returns candidate zones; ensure `strategy === 'keyword'` and final ranking contains finalScore computed by scorer.

Priority C — end-to-end / routes / integration (optional)
- Integration test for `routes/discover.routes.js` using `supertest`:
  - Mock `services/ai.parsePreferences` (or `llm.parsePrefsSmart`) and `services/zones.getMatchingZones` to return canned results; call POST /api/discover/parse and assert JSON.
  - Use jest.mock() to stub there and restore.

- Integration test for itinerary optimization route that calls `optimizer.callLLMAndParse` and `goong.tripV2`.
  - Mock external LLM and trip API, assert the route returns success and that `aiInsights` added.

Mocks and test isolation
- For deterministic tests, mock external network calls (embedding service, Goong/Map4D, GoogleGenerativeAI) with jest mocks or nock/global.fetch replacement.
- Avoid running `embedding-sync-zones.js` or other scripts that call remote services during unit tests.

Suggested test locations
- Put tests under `services/**/__tests__/*.test.js` (already used in this repo).
- Keep one test file per module to keep scope small and focused.

How to run tests locally
1) From project root (touring-be):

```powershell
cd "D:\!fpt\FA25\swp391\capstone project\touring-be"
npm install
npm test
```

2) Coverage report

```powershell
npm run test:coverage
# open coverage/lcov-report/index.html in a browser
```

Notes / gotchas observed during initial run
- Jest by default may try to execute unexpected files (e.g., a top-level `test.js` script that requires `node-fetch` ESM). Limit `testMatch` or put tests under `__tests__` directories (configured in `jest.config.cjs`).
- Node >= 18 recommended (fetch native) and consistent environment (PowerShell on Windows as used here).

Submission checklist (aligns with competition request)
- [ ] Git repo URL public or judges added as collaborators
- [ ] Source code complete + tests under `services/**/__tests__`
- [ ] README.md (this file + project README describing how to run tests and coverage)
- [ ] jest.config.cjs and any .coveragerc present
- [ ] Test suite complete (Priority A at minimum)
- [ ] Coverage report (coverage/lcov-report/index.html) generated and screenshot included if requested
- [ ] Slides + AI prompt docs (prompts, rationale, results) (not covered by this file, but required for submission)

Next steps I can do for you (pick one or more):
- Implement Priority A tests now (LLM, embedding-client, keyword-matcher) and run them.
- Implement `scorer` tests and `matcher` tests (Priority B). I'll mock the DB and embedding-client.
- Create a `README.md` snippet for judges and a short `TESTING.md` with commands and troubleshooting notes.

Assumptions
- Tests should run offline — all external services will be mocked.
- DB reads (Zone.find, Zone.findOne) will be mocked in unit tests; do not require a running MongoDB for the unit tests.

If anything in this flow is incorrect or you want a different set of files prioritized, tell me which items to change or confirm and I'll implement tests next.

---
Generated on: 2025-11-01
