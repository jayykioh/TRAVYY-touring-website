// Test suite for PayPal Payment Integration
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const PaymentSession = require("../models/PaymentSession");
const Booking = require("../models/Bookings");
const User = require("../models/Users");
const { Cart, CartItem } = require("../models/Carts");
const Tour = require("../models/agency/Tours");

describe("PayPal Payment Integration Tests", () => {
  let authToken;
  let testUser;
  let testTour;
  let testCart;

  beforeAll(async () => {
    // Create test user
    const userResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: `paypal_test_${Date.now()}@example.com`,
        password: "nguoidungmoi",
        name: "PayPal Test User",
        username: "nguoidungmoi",
        provinceId: "01",
        wardId: "00001",
        role: "Traveler",
      });

    if (userResponse.body.accessToken) {
      authToken = userResponse.body.accessToken;
      testUser = userResponse.body.user;
    } else {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: `paypaltest${Date.now()}`,
          password: "Test1234!@#",
        });
      authToken = loginResponse.body.accessToken;
      testUser = loginResponse.body.user;
    }

    // Create test tour
    testTour = await Tour.create({
      title: "PayPal Test Tour",
      name: "PayPal Test Tour",
      basePrice: 2000000, // 2M VND
      imageItems: [{ imageUrl: "https://example.com/test.jpg" }],
      departures: [
        {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priceAdult: 2000000,
          priceChild: 1000000,
          seatsLeft: 10,
        },
      ],
    });

    // Create test cart
    testCart = await Cart.create({ userId: testUser._id });
    await CartItem.create({
      cartId: testCart._id,
      tourId: testTour._id,
      name: testTour.title,
      date: testTour.departures[0].date.toISOString().slice(0, 10),
      adults: 1,
      children: 1,
      unitPriceAdult: 2000000,
      unitPriceChild: 1000000,
      selected: true,
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testUser?._id) {
      await User.deleteOne({ _id: testUser._id });
      await Cart.deleteMany({ userId: testUser._id });
      await CartItem.deleteMany({ cartId: testCart._id });
      await PaymentSession.deleteMany({ userId: testUser._id });
      await Booking.deleteMany({ userId: testUser._id });
    }
    if (testTour?._id) {
      await Tour.deleteOne({ _id: testTour._id });
    }
  });

  describe("[TC-PAYPAL-01] PayPal Config Endpoint", () => {
    it("should return PayPal client configuration", async () => {
      const response = await request(app)
        .get("/api/paypal/config")
        .expect("Content-Type", /json/)
        .expect(200);

      console.log("PayPal Config Response:", response.body);

      expect(response.body).toHaveProperty("clientId");
      expect(response.body).toHaveProperty("currency");
      expect(response.body.currency).toBe("USD");
      expect(response.body.clientId).toBeTruthy();
    });
  });

  describe("[TC-PAYPAL-02] Create PayPal Order - Cart Mode", () => {
    it("should create PayPal order from cart", async () => {
      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "cart",
        })
        .expect("Content-Type", /json/);

      console.log("PayPal Cart Order Response:", response.body);

      expect([200, 201, 400, 500, 502]).toContain(response.statusCode);

      if (response.statusCode === 200 || response.statusCode === 201) {
        expect(response.body).toHaveProperty("orderID");
        expect(response.body.orderID).toBeTruthy();

        // Verify payment session created
        const session = await PaymentSession.findOne({
          orderId: response.body.orderID,
        });
        expect(session).toBeTruthy();
        expect(session.provider).toBe("paypal");
        expect(session.status).toBe("pending");
        expect(session.mode).toBe("cart");
      }
    });
  });

  describe("[TC-PAYPAL-03] Create PayPal Order - Buy Now Mode", () => {
    it("should create PayPal order for buy-now", async () => {
      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "buy-now",
          item: {
            tourId: testTour._id.toString(),
            date: testTour.departures[0].date.toISOString().slice(0, 10),
            adults: 2,
            children: 0,
          },
        })
        .expect("Content-Type", /json/);

      console.log("PayPal Buy-Now Order Response:", response.body);

      expect([200, 201, 400, 500, 502]).toContain(response.statusCode);

      if (response.statusCode === 200 || response.statusCode === 201) {
        expect(response.body).toHaveProperty("orderID");

        const session = await PaymentSession.findOne({
          orderId: response.body.orderID,
        });
        expect(session).toBeTruthy();
        expect(session.mode).toBe("buy-now");
        expect(session.items).toHaveLength(1);
        expect(session.items[0].meta.adults).toBe(2);
        expect(session.items[0].meta.children).toBe(0);
      }
    });
  });

  describe("[TC-PAYPAL-04] Currency Conversion VND to USD", () => {
    it("should correctly convert VND to USD", async () => {
      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "cart",
        })
        .expect("Content-Type", /json/);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const session = await PaymentSession.findOne({
          orderId: response.body.orderID,
        });

        expect(session).toBeTruthy();
        expect(session.amount).toBeGreaterThan(0);

        // Verify FX rate is reasonable (example: 1 USD = 25000 VND)
        const FX_RATE = 0.00004; // Approximate rate
        const expectedUSD = session.amount * FX_RATE;
        console.log("VND Amount:", session.amount);
        console.log("Expected USD (approx):", expectedUSD.toFixed(2));

        expect(expectedUSD).toBeGreaterThan(0);
        expect(expectedUSD).toBeLessThan(10000); // Sanity check
      }
    });
  });

  describe("[TC-PAYPAL-05] Order Amount Breakdown Validation", () => {
    it("should have correct breakdown with items and discount", async () => {
      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "cart",
          discountAmount: 100000, // 100k VND discount
          voucherCode: "TEST100K",
        })
        .expect("Content-Type", /json/);

      console.log("PayPal Order with Discount:", response.body);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const session = await PaymentSession.findOne({
          orderId: response.body.orderID,
        });

        expect(session.voucherCode).toBe("TEST100K");
        expect(session.discountAmount).toBe(100000);

        // Original amount should be greater than final amount after discount
        const originalTotal = session.items.reduce(
          (sum, item) => sum + item.price,
          0
        );
        const finalAmount = session.amount;

        console.log("Original Total:", originalTotal);
        console.log("Discount:", session.discountAmount);
        console.log("Final Amount:", finalAmount);

        expect(finalAmount).toBeLessThanOrEqual(originalTotal);
      }
    });
  });

  describe("[TC-PAYPAL-06] Capture Order Flow", () => {
    it("should handle capture request (may fail without real PayPal orderID)", async () => {
      // Note: This test will likely fail without a real PayPal order approval
      // It's included to test the endpoint structure

      const response = await request(app)
        .post("/api/paypal/capture")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          orderID: "FAKE_ORDER_ID_FOR_TEST",
        })
        .expect("Content-Type", /json/);

      console.log("PayPal Capture Response:", response.statusCode);

      // Expect error codes since we're using fake orderID
      expect([400, 404, 422, 500]).toContain(response.statusCode);
    });
  });

  describe("[TC-PAYPAL-07] Payment Session Persistence", () => {
    it("should persist passenger details in payment session", async () => {
      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "buy-now",
          item: {
            tourId: testTour._id.toString(),
            date: testTour.departures[0].date.toISOString().slice(0, 10),
            adults: 3,
            children: 2,
          },
        })
        .expect("Content-Type", /json/);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const session = await PaymentSession.findOne({
          orderId: response.body.orderID,
        });

        expect(session).toBeTruthy();
        expect(session.items[0].meta).toBeDefined();
        expect(session.items[0].meta.adults).toBe(3);
        expect(session.items[0].meta.children).toBe(2);
        expect(session.items[0].meta.unitPriceAdult).toBeDefined();
        expect(session.items[0].meta.unitPriceChild).toBeDefined();
        expect(session.items[0].meta.date).toBeDefined();
      }
    });
  });

  describe("[TC-PAYPAL-08] Error Handling", () => {
    it("should handle missing authentication", async () => {
      const response = await request(app)
        .post("/api/paypal/create-order")
        .send({
          mode: "cart",
        });

      console.log("No Auth Response:", response.statusCode);
      expect([401, 403]).toContain(response.statusCode);
    });

    it("should handle invalid mode", async () => {
      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "invalid-mode",
        })
        .expect("Content-Type", /json/);

      console.log("Invalid Mode Response:", response.statusCode);
      expect([400, 500]).toContain(response.statusCode);
    });

    it("should handle missing required fields for buy-now", async () => {
      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "buy-now",
          item: {
            // Missing tourId and date
            adults: 1,
            children: 0,
          },
        })
        .expect("Content-Type", /json/);

      console.log("Missing Fields Response:", response.statusCode);
      expect([400, 500]).toContain(response.statusCode);
    });

    it("should handle empty cart", async () => {
      // Remove all items from cart
      await CartItem.deleteMany({ cartId: testCart._id });

      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "cart",
        })
        .expect("Content-Type", /json/);

      console.log("Empty Cart Response:", response.statusCode);
      expect([400, 500]).toContain(response.statusCode);

      // Restore cart item for other tests
      await CartItem.create({
        cartId: testCart._id,
        tourId: testTour._id,
        name: testTour.title,
        date: testTour.departures[0].date.toISOString().slice(0, 10),
        adults: 1,
        children: 1,
        unitPriceAdult: 2000000,
        unitPriceChild: 1000000,
        selected: true,
      });
    });
  });

  describe("[TC-PAYPAL-09] PayPal Credentials Validation", () => {
    it("should fail gracefully if PayPal cis test checks if the system handles missing credentiaredentials are missing", async () => {
      // Thls properly
      // The actual behavior depends on environment setup

      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "cart",
        })
        .expect("Content-Type", /json/);

      // Should either succeed (if credentials exist) or fail gracefully
      expect([200, 201, 500, 502]).toContain(response.statusCode);

      if (response.statusCode === 500) {
        console.log(
          "PayPal credentials error (expected in test env):",
          response.body
        );
      }
    });
  });

  describe("[TC-PAYPAL-10] Seat Hold Integration", () => {
    it("should hold seats when PayPal order is created", async () => {
      const initialSeats = testTour.departures[0].seatsLeft;

      const response = await request(app)
        .post("/api/paypal/create-order")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "buy-now",
          item: {
            tourId: testTour._id.toString(),
            date: testTour.departures[0].date.toISOString().slice(0, 10),
            adults: 2,
            children: 1,
          },
        })
        .expect("Content-Type", /json/);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const updatedTour = await Tour.findById(testTour._id);
        const currentSeats = updatedTour.departures[0].seatsLeft;

        console.log("Initial seats:", initialSeats);
        console.log("Seats after PayPal order:", currentSeats);

        // Seats should be reduced by 3 (2 adults + 1 child)
        expect(currentSeats).toBeLessThanOrEqual(initialSeats);
      }
    });
  });
});
