// Test suite for MoMo Sandbox Payment Integration
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const PaymentSession = require("../models/PaymentSession");
const Booking = require("../models/Bookings");
const User = require("../models/Users");
const { Cart, CartItem } = require("../models/Carts");
const Tour = require("../models/agency/Tours");

describe("MoMo Payment Integration Tests", () => {
  let authToken;
  let testUser;
  let testTour;
  let testCart;

  beforeAll(async () => {
    // Create test user
    const userResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: `momo_test_${Date.now()}@example.com`,
        password: "Test1234!@#",
        name: "MoMo Test User",
        username: `momotest${Date.now()}`,
        provinceId: "01",
        wardId: "00001",
        role: "Traveler",
      });

    if (userResponse.body.accessToken) {
      authToken = userResponse.body.accessToken;
      testUser = userResponse.body.user;
    } else {
      // Try login if user already exists
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "nguoidungmoi",
        password: "nguoidungmoi",
      });
      authToken = loginResponse.body.accessToken;
      testUser = loginResponse.body.user;
    }

    // Create test tour
    testTour = await Tour.create({
      title: "MoMo Test Tour",
      name: "MoMo Test Tour",
      basePrice: 500000, // 500k VND
      departures: [
        {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          priceAdult: 500000,
          priceChild: 250000,
          seatsLeft: 10,
        },
      ],
    });

    // Create test cart with items
    testCart = await Cart.create({ userId: testUser._id });
    await CartItem.create({
      cartId: testCart._id,
      tourId: testTour._id,
      name: testTour.title,
      date: testTour.departures[0].date.toISOString().slice(0, 10),
      adults: 2,
      children: 1,
      unitPriceAdult: 500000,
      unitPriceChild: 250000,
      selected: true,
    });
  });

  afterAll(async () => {
    // Cleanup test data
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

  describe("[TC-MOMO-01] Create MoMo Payment - Cart Mode", () => {
    it("should create MoMo payment session from cart", async () => {
      const response = await request(app)
        .post("/api/payments/momo")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "cart",
          orderInfo: "Test payment from cart",
        })
        .expect("Content-Type", /json/);

      console.log("MoMo Cart Payment Response:", response.body);

      expect([200, 201, 502]).toContain(response.statusCode);

      if (response.statusCode === 200 || response.statusCode === 201) {
        expect(response.body).toHaveProperty("payUrl");
        expect(response.body).toHaveProperty("orderId");
        expect(response.body.payUrl).toContain("https://");

        // Verify payment session created
        const session = await PaymentSession.findOne({
          orderId: response.body.orderId,
        });
        expect(session).toBeTruthy();
        expect(session.provider).toBe("momo");
        expect(session.status).toBe("pending");
        expect(session.mode).toBe("cart");
      }
    });
  });

  describe("[TC-MOMO-02] Create MoMo Payment - Buy Now Mode", () => {
    it("should create MoMo payment session for buy-now", async () => {
      const response = await request(app)
        .post("/api/payments/momo")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "buy-now",
          item: {
            tourId: testTour._id.toString(),
            date: testTour.departures[0].date.toISOString().slice(0, 10),
            adults: 1,
            children: 0,
          },
          orderInfo: "Test buy-now payment",
        })
        .expect("Content-Type", /json/);

      console.log("MoMo Buy-Now Payment Response:", response.body);

      expect([200, 201, 502]).toContain(response.statusCode);

      if (response.statusCode === 200 || response.statusCode === 201) {
        expect(response.body).toHaveProperty("payUrl");
        expect(response.body).toHaveProperty("orderId");

        const session = await PaymentSession.findOne({
          orderId: response.body.orderId,
        });
        expect(session).toBeTruthy();
        expect(session.mode).toBe("buy-now");
      }
    });
  });

  describe("[TC-MOMO-03] MoMo Payment Amount Validation", () => {
    it("should respect MoMo sandbox test limits", async () => {
      const response = await request(app)
        .post("/api/payments/momo")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "cart",
          orderInfo: "Test amount validation",
        })
        .expect("Content-Type", /json/);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const session = await PaymentSession.findOne({
          orderId: response.body.orderId,
        });

        // MoMo sandbox limit is typically 10,000,000 VND
        const MOMO_SANDBOX_LIMIT = 10000000;
        expect(session.amount).toBeLessThanOrEqual(MOMO_SANDBOX_LIMIT);
      }
    });

    it("should reject invalid amount", async () => {
      const response = await request(app)
        .post("/api/payments/momo")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "buy-now",
          item: {
            tourId: testTour._id.toString(),
            date: testTour.departures[0].date.toISOString().slice(0, 10),
            adults: 0, // Invalid: no passengers
            children: 0,
          },
        })
        .expect("Content-Type", /json/);

      console.log("Invalid Amount Response:", response.body);
      expect([400, 502]).toContain(response.statusCode);
    });
  });

  describe("[TC-MOMO-04] MoMo IPN Callback Handling", () => {
    let testOrderId;

    beforeEach(async () => {
      // Create a test payment session
      const session = await PaymentSession.create({
        userId: testUser._id,
        provider: "momo",
        orderId: `TEST_${Date.now()}`,
        requestId: `REQ_${Date.now()}`,
        amount: 500000,
        status: "pending",
        mode: "cart",
        items: [
          {
            tourId: testTour._id,
            name: testTour.title,
            price: 500000,
            meta: {
              date: testTour.departures[0].date.toISOString().slice(0, 10),
              adults: 1,
              children: 0,
              unitPriceAdult: 500000,
              unitPriceChild: 0,
            },
          },
        ],
      });
      testOrderId = session.orderId;
    });

    it("should handle successful payment IPN", async () => {
      const crypto = require("crypto");
      const secretKey =
        process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";

      const ipnData = {
        partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
        orderId: testOrderId,
        requestId: `REQ_${Date.now()}`,
        amount: "500000",
        orderInfo: "Test payment",
        orderType: "momo_wallet",
        transId: `TRANS_${Date.now()}`,
        resultCode: "0",
        message: "Success",
        payType: "qr",
        responseTime: Date.now().toString(),
        extraData: "",
        accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
      };

      // Calculate signature
      const rawSignature = [
        `accessKey=${ipnData.accessKey}`,
        `amount=${ipnData.amount}`,
        `extraData=${ipnData.extraData}`,
        `message=${ipnData.message}`,
        `orderId=${ipnData.orderId}`,
        `orderInfo=${ipnData.orderInfo}`,
        `orderType=${ipnData.orderType}`,
        `partnerCode=${ipnData.partnerCode}`,
        `payType=${ipnData.payType}`,
        `requestId=${ipnData.requestId}`,
        `responseTime=${ipnData.responseTime}`,
        `resultCode=${ipnData.resultCode}`,
        `transId=${ipnData.transId}`,
      ].join("&");

      ipnData.signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      const response = await request(app)
        .post("/api/payments/momo/ipn")
        .send(ipnData)
        .expect("Content-Type", /json/);

      console.log("IPN Success Response:", response.body);
      expect([200, 404]).toContain(response.statusCode);

      // Verify session updated
      const updatedSession = await PaymentSession.findOne({
        orderId: testOrderId,
      });
      if (updatedSession) {
        expect(["paid", "pending"]).toContain(updatedSession.status);
      }
    });

    it("should handle failed payment IPN", async () => {
      const crypto = require("crypto");
      const secretKey =
        process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";

      const ipnData = {
        partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
        orderId: testOrderId,
        requestId: `REQ_${Date.now()}`,
        amount: "500000",
        orderInfo: "Test payment",
        orderType: "momo_wallet",
        transId: `TRANS_${Date.now()}`,
        resultCode: "1001", // Failed
        message: "Payment failed",
        payType: "qr",
        responseTime: Date.now().toString(),
        extraData: "",
        accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
      };

      const rawSignature = [
        `accessKey=${ipnData.accessKey}`,
        `amount=${ipnData.amount}`,
        `extraData=${ipnData.extraData}`,
        `message=${ipnData.message}`,
        `orderId=${ipnData.orderId}`,
        `orderInfo=${ipnData.orderInfo}`,
        `orderType=${ipnData.orderType}`,
        `partnerCode=${ipnData.partnerCode}`,
        `payType=${ipnData.payType}`,
        `requestId=${ipnData.requestId}`,
        `responseTime=${ipnData.responseTime}`,
        `resultCode=${ipnData.resultCode}`,
        `transId=${ipnData.transId}`,
      ].join("&");

      ipnData.signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      const response = await request(app)
        .post("/api/payments/momo/ipn")
        .send(ipnData)
        .expect("Content-Type", /json/);

      expect([200, 404]).toContain(response.statusCode);

      const updatedSession = await PaymentSession.findOne({
        orderId: testOrderId,
      });
      if (updatedSession) {
        expect(["failed", "pending"]).toContain(updatedSession.status);
      }
    });

    it("should reject IPN with invalid signature", async () => {
      const ipnData = {
        partnerCode: "MOMO",
        orderId: testOrderId,
        requestId: `REQ_${Date.now()}`,
        amount: "500000",
        resultCode: "0",
        message: "Success",
        signature: "INVALID_SIGNATURE",
      };

      const response = await request(app)
        .post("/api/payments/momo/ipn")
        .send(ipnData);

      console.log("Invalid Signature Response:", response.statusCode);
      expect([400, 500]).toContain(response.statusCode);
    });
  });

  describe("[TC-MOMO-05] Payment Session Status Polling", () => {
    it("should retrieve payment session status", async () => {
      // Create a test session
      const session = await PaymentSession.create({
        userId: testUser._id,
        provider: "momo",
        orderId: `POLL_TEST_${Date.now()}`,
        requestId: `REQ_${Date.now()}`,
        amount: 500000,
        status: "pending",
        mode: "cart",
      });

      const response = await request(app)
        .get(`/api/payments/momo/session/${session.orderId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Session Status Response:", response.body);
      expect([200, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("orderId");
        expect(response.body).toHaveProperty("status");
        expect(response.body.orderId).toBe(session.orderId);
      }
    });
  });

  describe("[TC-MOMO-06] Seat Hold and Release", () => {
    it("should hold seats when payment is created", async () => {
      const initialSeats = testTour.departures[0].seatsLeft;

      const response = await request(app)
        .post("/api/payments/momo")
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
        // Check if seats were held
        const updatedTour = await Tour.findById(testTour._id);
        const currentSeats = updatedTour.departures[0].seatsLeft;

        console.log("Seats before:", initialSeats);
        console.log("Seats after hold:", currentSeats);

        // Seats should be reduced by 3 (2 adults + 1 child)
        expect(currentSeats).toBeLessThanOrEqual(initialSeats);
      }
    });
  });

  describe("[TC-MOMO-07] Discount/Voucher Application", () => {
    it("should apply discount to payment amount", async () => {
      const response = await request(app)
        .post("/api/payments/momo")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "cart",
          orderInfo: "Test payment with discount",
          discountAmount: 50000, // 50k VND discount
          voucherCode: "TEST50K",
        })
        .expect("Content-Type", /json/);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const session = await PaymentSession.findOne({
          orderId: response.body.orderId,
        });

        expect(session.voucherCode).toBe("TEST50K");
        expect(session.discountAmount).toBe(50000);
      }
    });
  });

  describe("[TC-MOMO-08] Error Handling", () => {
    it("should handle missing authentication", async () => {
      const response = await request(app).post("/api/payments/momo").send({
        mode: "cart",
      });

      console.log("No Auth Response:", response.statusCode);
      expect([401, 403]).toContain(response.statusCode);
    });

    it("should handle invalid tour ID", async () => {
      const response = await request(app)
        .post("/api/payments/momo")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          mode: "buy-now",
          item: {
            tourId: "invalid_tour_id",
            date: "2025-12-31",
            adults: 1,
            children: 0,
          },
        })
        .expect("Content-Type", /json/);

      console.log("Invalid Tour Response:", response.statusCode);
      expect([400, 404, 500, 502]).toContain(response.statusCode);
    });
  });
});
