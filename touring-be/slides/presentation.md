% DUFDUF Touring — Test & AI Deliverables
% Team: DUFDUF Touring

--

# Slide 1 — Title

DUFDUF Touring — Backend (touring-be)

Deliverables: deterministic tests, coverage, prompts, docs

--

# Slide 2 — Overview

- Node.js backend
- Focus: AI flows (LLM, embedding), matching, POI finder, itinerary optimizer
- Deterministic Jest tests with mocks

--

# Slide 3 — Repo & Branch

- Repository: local workspace
- Branch: `cuocthi`
- Key folders: `services/`, `routes/`, `utils/`.

--

# Slide 4 — Test strategy

- Unit tests for pure helpers
- Light integration tests for routes (Express) using in-memory app
- All external services mocked (Gemini, embedding service, map4d, Mongoose)

--

# Slide 5 — How to run tests

PowerShell:

```powershell
cd "D:\!fpt\FA25\swp391\capstone project\touring-be"
npm install
npm test -- --coverage
```

--

# Slide 6 — Coverage

- Coverage HTML in `coverage/lcov-report/index.html` (open in browser)
- Overall: ~63% statements, ~50% branches (local run)

--

# Slide 7 — Mocking approach

- `@google/generative-ai` mocked with deterministic candidate outputs
- `global.fetch` mocked for embedding and map APIs
- Mongoose model methods (`.find().lean()`, `.save()`) mocked inline

--

# Slide 8 — Prompts & examples

- See `PROMPTS.md` for prompt literals, rationale, and test mocks

--

# Slide 9 — Results & metrics

- Tests: 14 suites, 42 tests — all passing (local)
- Coverage snapshot location: `coverage/lcov-report/index.html`

--

# Slide 10 — Lessons & next steps

- Add tests for uncovered branches in `llm.js` and `optimizer.js`
- Add CI coverage upload (Codecov) and badge
- Optionally collect real-run prompt payloads and screenshots

--

# Slide 11 — Contact / Notes

- Files included: README.md, README_TESTS.md, PROMPTS.md, slides/
- I can export to PDF if you want — tell me whether to run `pandoc` (not available here) or to generate browser-printable HTML.
