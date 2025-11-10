const path = require('path');

// Ensure fresh module load for each test
beforeEach(() => {
  jest.resetModules();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
  delete process.env.EMBED_SERVICE_URL;
});

const client = require(path.resolve(__dirname, '../embedding-client'));

describe('embedding-client', () => {
  test('embed() posts texts and returns json on ok', async () => {
    const fakeJson = { vectors: [[0.1, 0.2]] };
    global.fetch.mockResolvedValue({ ok: true, json: async () => fakeJson });

    const res = await client.embed(['hello world']);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/embed'), expect.objectContaining({ method: 'POST' }));
    expect(res).toEqual(fakeJson);
  });

  test('upsert() posts items and returns json on ok', async () => {
    const fakeJson = { upserted: 1 };
    global.fetch.mockResolvedValue({ ok: true, json: async () => fakeJson });

    const res = await client.upsert([{ id: 'z1', text: 'x' }]);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/upsert'), expect.objectContaining({ method: 'POST' }));
    expect(res).toEqual(fakeJson);
  });

  test('search() returns parsed json on success', async () => {
    const fakeJson = { hits: [{ id: 'z1', score: 0.9 }] };
    global.fetch.mockResolvedValue({ ok: true, json: async () => fakeJson });

    const res = await client.search('query', { top_k: 5 });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/search'), expect.objectContaining({ method: 'POST' }));
    expect(res).toEqual(fakeJson);
  });

  test('hybridSearch() returns result and logs', async () => {
    const fakeJson = { hits: [{ id: 'z1', score: 0.8 }], strategy: 'hybrid' };
    global.fetch.mockResolvedValue({ ok: true, json: async () => fakeJson });

    const res = await client.hybridSearch({ free_text: 'beach', vibes: ['beach'], avoid: [] });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/hybrid-search'), expect.objectContaining({ method: 'POST' }));
    expect(res).toEqual(fakeJson);
  });

  test('health() returns parsed health object on ok', async () => {
    const healthObj = { status: 'ok', model: 'test', vectors: 123 };
    global.fetch.mockResolvedValue({ ok: true, json: async () => healthObj });

    const res = await client.health();
    // fetch is called with the URL and an options object that includes a signal; don't assert exact options object
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/healthz'), expect.any(Object));
    expect(res).toEqual(healthObj);
  });

  test('isAvailable() returns true when health status ok', async () => {
    const healthObj = { status: 'ok', model: 'm', vectors: 1 };
    global.fetch.mockResolvedValue({ ok: true, json: async () => healthObj });

    const ok = await client.isAvailable();
    expect(ok).toBe(true);
  });

  test('health() handles invalid response shape gracefully', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ unexpected: true }) });
    const res = await client.health();
    expect(res.status).toBe('error');
    expect(res.error).toMatch(/Invalid response format/);
  });

  test('embed() throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500, text: async () => 'err' });
    await expect(client.embed(['x'])).rejects.toThrow(/Embed error/);
  });
});
