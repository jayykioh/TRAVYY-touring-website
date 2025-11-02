# Delivery checklist & instructions

Included artifacts in this branch (`cuocthi`):

- `README.md` — project summary and run instructions
- `README_TESTS.md` — detailed testing doc, mock literals and test pointers
- `PROMPTS.md` — prompts used in AI flows and rationale
- `slides/presentation.md` — slide deck (Markdown) for PDF export (<= 20 slides)
- Tests under `services/**/__tests__` and `utils/**/__tests__` — deterministic Jest suites
- `jest.config.cjs` and `jest.setup.js` — test config & global setup
- `coverage/` — coverage HTML (`lcov-report/index.html`) and JSON (`coverage-final.json`)

Reviewer instructions

1. To run the full test suite locally:

```powershell
cd "D:\!fpt\FA25\swp391\capstone project\touring-be"
npm ci
npm test -- --coverage
```

2. Coverage report
- After running the command above, open `coverage/lcov-report/index.html` in a browser to see the file-by-file HTML report.

3. Prompts and screenshots
- `PROMPTS.md` includes literal prompts used in tests. If you need screenshots of the real API traffic, enable logs in `jest.setup.js` (temporarily remove console mocks) and run integration tests against a dev instance with `GEMINI_API_KEY` set.

4. Sharing repository for judges
- Make the repository public, or add judges as collaborators (GitHub settings → Manage access). Provide the branch name `cuocthi` for review.

Optional follow-ups I can do on request
- Add Codecov/Codecov.io upload step in CI and add coverage badge to `README.md`.
- Export `slides/presentation.md` to PDF (requires pandoc or browser print).
- Package a ZIP of: `coverage/lcov-report`, `slides/` (MD), `PROMPTS.md`, and `README_TESTS.md` for judge download.
