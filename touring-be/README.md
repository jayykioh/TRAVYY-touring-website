# DUFDUF Touring (touring-be)

This repo contains the backend for the DUFDUF Touring project (branch: `cuocthi`). The focus of this delivery is the deterministic, offline-capable Jest test suite for AI-related flows (LLM, embedding, matching, POI finder, and itinerary optimizer) plus documentation and coverage artifacts to support review.

Quick links
- Tests & test documentation: `README_TESTS.md`
- Coverage HTML (generated locally): `coverage/lcov-report/index.html`
- Prompts and AI docs: `PROMPTS.md`
- Presentation source (Markdown): `slides/presentation.md`
- Delivery checklist: `DELIVERY.md`

How to run (Windows PowerShell)

```powershell
cd "D:\!fpt\FA25\swp391\capstone project\touring-be"
npm install    # (or npm ci in CI)
npm test       # run tests
# with coverage
npm test -- --coverage
```

Notes for reviewers
- Tests are deterministic and mock external services: `@google/generative-ai` (Gemini), embedding HTTP service (`global.fetch`), map APIs (map4d/goong), and Mongoose models. No external network calls should be required to run the test suite.
- Coverage output is in `coverage/` — open `coverage/lcov-report/index.html` in a browser to see the file-by-file HTML report.

If you'd like me to also add Codecov/coveralls upload steps or create an export ZIP with coverage HTML and slides PDF, tell me whether to add the CI steps and whether I should produce a PDF (I can generate the slide MD; PDF export may require you to run `pandoc` or your browser print-to-PDF locally).
