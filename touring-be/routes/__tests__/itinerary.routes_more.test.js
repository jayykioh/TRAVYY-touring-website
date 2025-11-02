const express = require('express');
const request = require('supertest');

// Reuse auth mock but allow per-test override of user
jest.mock('../../middlewares/authJWT', () => (req, res, next) => {
  // allow tests to set global.__TEST_USER before calling routes
  req.user = global.__TEST_USER || { sub: 'test-user' };
  return next();
});

describe('itinerary routes - additional flows', () => {
  beforeEach(() => {
    jest.resetModules();
    delete global.__TEST_USER;
  });

  test('POST /api/itinerary - creates new itinerary when none exists', async () => {
    // mock Itinerary: findOne -> null, constructor -> doc with save
    jest.doMock('../../models/Itinerary', () => {
      function Itinerary(data) {
        Object.assign(this, data);
        this._id = 'new-it';
        this.save = jest.fn(async () => true);
        this.toObject = function () { return { ...this }; };
      }
      Itinerary.findOne = jest.fn(() => Promise.resolve(null));
      return Itinerary;
    });

    const app = express();
    app.use(express.json());
    const router = require('../itinerary.routes');
    app.use('/api/itinerary', router);

    global.__TEST_USER = { sub: 'u1' };

    const res = await request(app)
      .post('/api/itinerary')
      .send({ zoneId: 'z1', zoneName: 'Zone 1', preferences: { bestTime: 'anytime' } })
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.itinerary).toHaveProperty('_id', 'new-it');
  });

  test('POST /api/itinerary/:id/items - add item and prevent duplicates', async () => {
    // Itinerary with one existing item
    jest.doMock('../../models/Itinerary', () => {
      const doc = {
        _id: 'it-123',
        items: [ { poiId: 'p1', itemType: 'poi', location: { lat: 1, lng: 2 }, name: 'P1' } ],
        save: jest.fn(async () => true),
        toObject() { return { ...this }; }
      };
      return { findOne: jest.fn(() => Promise.resolve(doc)) };
    });

    const app = express();
    app.use(express.json());
    const router = require('../itinerary.routes');
    app.use('/api/itinerary', router);

    global.__TEST_USER = { sub: 'u1' };

    // Try to add duplicate item -> 400
    await request(app)
      .post('/api/itinerary/it-123/items')
      .send({ poi: { place_id: 'p1', name: 'P1' } })
      .expect(400);

    // Add new distinct item -> 200
    const addRes = await request(app)
      .post('/api/itinerary/it-123/items')
      .send({ poi: { place_id: 'p2', name: 'P2', geometry: { location: { lat: 3, lng: 4 } } } })
      .expect(200);

    expect(addRes.body).toHaveProperty('success', true);
    expect(addRes.body.itinerary.items.some(i => i.poiId === 'p2')).toBe(true);
  });

  test('DELETE /api/itinerary/:id/items/:poiId - removes item', async () => {
    const doc = {
      _id: 'it-rem',
      items: [ { poiId: 'p1', itemType: 'poi' }, { poiId: 'p2', itemType: 'poi' } ],
      save: jest.fn(async () => true),
      toObject() { return { ...this }; }
    };
    jest.doMock('../../models/Itinerary', () => ({ findOne: jest.fn(() => Promise.resolve(doc)) }));

    const app = express();
    app.use(express.json());
    const router = require('../itinerary.routes');
    app.use('/api/itinerary', router);

    global.__TEST_USER = { sub: 'u1' };

    const res = await request(app)
      .delete('/api/itinerary/it-rem/items/p1')
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.itinerary.items.some(i => i.poiId === 'p1')).toBe(false);
  });

  test('PATCH /api/itinerary/:id/items/reorder - validates order and reorders', async () => {
    const doc = {
      _id: 'it-re',
      items: [ { poiId: 'a' }, { poiId: 'b' }, { poiId: 'c' } ],
      save: jest.fn(async () => true),
      toObject() { return { ...this }; }
    };
    jest.doMock('../../models/Itinerary', () => ({ findOne: jest.fn(() => Promise.resolve(doc)) }));

    const app = express();
    app.use(express.json());
    const router = require('../itinerary.routes');
    app.use('/api/itinerary', router);

    global.__TEST_USER = { sub: 'u1' };

    // invalid order (not array)
    await request(app)
      .patch('/api/itinerary/it-re/items/reorder')
      .send({ order: 'not-an-array' })
      .expect(400);

    // valid reorder
    const res = await request(app)
      .patch('/api/itinerary/it-re/items/reorder')
      .send({ order: ['c', 'a', 'b'] })
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.itinerary.items[0].poiId).toBe('c');
  });

  test('GET /api/itinerary/:id/export.gpx - returns 400 when no route geometry', async () => {
    // Itinerary without route geometry and fewer than 2 points
    const doc = {
      _id: 'it-no-geo',
      items: [ { location: { lat: 10.0, lng: 10.0 } } ],
      trip: null,
      save: jest.fn(async () => true),
      toObject() { return { ...this }; }
    };
    // findOne(...).lean() should be chainable
    jest.doMock('../../models/Itinerary', () => ({ findOne: jest.fn(() => ({ lean: () => Promise.resolve(doc) })) }));

    const app = express();
    app.use(express.json());
    const router = require('../itinerary.routes');
    app.use('/api/itinerary', router);

    global.__TEST_USER = { sub: 'u1' };

    await request(app)
      .get('/api/itinerary/it-no-geo/export.gpx')
      .expect(400);
  });

  test('POST /api/itinerary/:id/request-tour-guide - sends request when custom tour', async () => {
    const doc = {
      _id: 'it-guide',
      isCustomTour: true,
      items: [],
      tourGuideRequest: { status: 'none' },
      save: jest.fn(async () => true),
      toObject() { return { ...this }; }
    };
    jest.doMock('../../models/Itinerary', () => ({ findOne: jest.fn(() => Promise.resolve(doc)) }));

    const app = express();
    app.use(express.json());
    const router = require('../itinerary.routes');
    app.use('/api/itinerary', router);

    global.__TEST_USER = { sub: 'u1' };

    const res = await request(app)
      .post('/api/itinerary/it-guide/request-tour-guide')
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.itinerary.tourGuideRequest.status).toBe('pending');
  });
});
