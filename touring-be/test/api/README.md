// test/api/README.md
# API Tests

API tests focus on testing REST API endpoints using supertest.
These tests verify the complete request/response cycle including:
- HTTP status codes
- Response data structure
- Authentication/authorization
- Error handling
- API contracts

## Example API Test Structure

```javascript
const request = require('supertest');
const app = require('../../server');

describe('API Tests', () => {
  describe('GET /api/tours', () => {
    it('should return list of tours', async () => {
      const response = await request(app)
        .get('/api/tours')
        .expect(200);

      expect(response.body).toHaveProperty('tours');
      expect(Array.isArray(response.body.tours)).toBe(true);
    });
  });
});
```

## Current API Tests
- auth.routes.integration.test.js (moved to integration folder)