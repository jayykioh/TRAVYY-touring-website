# AI Prompts & Examples

This document lists the prompts used by the backend AI flows (deterministic examples used in tests and example prompts used in `optimizer` / `llm` helpers). It includes the prompt text, rationale, and the expected/observed outputs captured in the test mocks.

1) llm.parsePrefsSmart (tests)
- Prompt (simplified test input / literal used in tests):

  "Tôi muốn một chuyến đi ngắn, ưu tiên ẩm thực và trải nghiệm địa phương. Tránh nơi quá đông."

  Rationale: short user preference in Vietnamese; tests assert heuristics and AI fallback parsing produce a prefs object with `vibes`, `avoid` and `duration`.

  Mocked AI response (literal used in tests):

  `{"vibes":["food","local"],"duration":"3h","preferences":{"budget":"mid"}}`

2) optimizer.buildItineraryPrompt (tests)
- Prompt (constructed by code; test checks JSON schema instruction is included). Example mocked LLM JSON returned by tests:

  `{"route":["Hanoi","Halong"],"highlights":["bay-cruise"]}`

  Rationale: ensure `callLLMAndParse` can extract JSON from `candidates[].content.parts`.

3) Fallback prompt examples (generateSmartFallback)
- These are deterministic functions that compose short structured text from itinerary items and zone metadata. Example fallback saved in tests when LLM throws:

  `{ "summary": "Short fallback summary", "tips": ["avoid rush hour","book tickets in advance"] }`

Notes and screenshots
- Screenshots: tests include mocked inputs/outputs only (no GUI). If you need screenshots of prompt payloads sent to the real API, please run a dev instance with GEMINI_API_KEY set and enable logs in `jest.setup.js` (or temporarily remove the console mock) and capture the request body.

If you want, I can extract every single prompt string constructed at runtime and write them into `PROMPTS_FULL.md` with line-number pointers to the source files; tell me and I will add it.
