require('dotenv').config({ override: true });
const fetch = require('node-fetch');

(async () => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  console.log('Key preview:', key ? key.slice(0,4) + '…' + key.slice(-4) : 'N/A', 'len=', key.length);
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: { 'x-goog-api-key': key }
  });
  const t = await r.text();
  console.log(r.status, t.slice(0,200));
})();
