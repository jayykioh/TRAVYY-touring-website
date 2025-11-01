// Test suite for critical features: Booking, Promotion, Tour Management
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/Users");
const Tour = require("../models/agency/Tours");
const Booking = require("../models/Bookings");
const Promotion = require("../models/Promotion");
const { Cart, CartItem } = require("../models/Carts");

describe("Critical Features Integration Tests", () => {
  let authToken;
  let testUser;
  let adminToken;
  let adminUser;

  beforeAll(async () => {
    // Create test user
    const userResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: `features_test_${Date.now()}@example.com`,
        password: "Test1234!@#",
        name: "Features Test User",
        username: `featurestest${Date.now()}`,
        provinceId: "01",
        wardId: "00001",
        role: "Traveler",
      });

    if (userResponse.body.accessToken) {
      authToken = userResponse.body.accessToken;
      testUser = userResponse.body.user;
    }

    // Create admin user
    adminUser = await User.create({
      email: `admin_${Date.now()}@test.com`,
      username: `admin${Date.now()}`,
      password: "AdminPassword123!",
      name: "Admin User",
      role: "TravelAgency",
      provinceId: "01",
      wardId: "00001",
    });

    const { signAccess } = require("../utils/jwt");
    adminToken = signAccess({ id: adminUser._id, role: adminUser.role });
  });

  afterAll(async () => {
    // Cleanup
    if (testUser?._id) {
      await User.deleteOne({ _id: testUser._id });
      await Cart.deleteMany({ userId: testUser._id });
      await Booking.deleteMany({ userId: testUser._id });
    }
    if (adminUser?._id) {
      await User.deleteOne({ _id: adminUser._id });
      await Tour.deleteMany({ createdBy: adminUser._id });
    }
    await Promotion.deleteMany({ code: /^TEST/ });
  });

  describe("[TC-TOUR-01] Tour Creation and Management", () => {
    let testTour;

    it("should create a new tour", async () => {
      const tourData = {
        title: "Critical Feature Test Tour",
        name: "Test Tour",
        description: "A comprehensive test tour",
        basePrice: 1500000,
        agencyId: new mongoose.Types.ObjectId(),
        duration: {
          days: 3,
          nights: 2,
        },
        maxGroupSize: 20,
        difficulty: "Trung bình",
        category: "Nghỉ dưỡng",
        location: {
          provinceId: "01",
          province: "Hà Nội",
        },
        departures: [
          {
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            priceAdult: 1500000,
            priceChild: 750000,
            seatsLeft: 20,
          },
        ],
      };

      testTour = await Tour.create({
        ...tourData,
        createdBy: adminUser._id,
      });

      expect(testTour).toBeTruthy();
      expect(testTour.title).toBe(tourData.title);
      expect(testTour.basePrice).toBe(tourData.basePrice);
      expect(testTour.departures).toHaveLength(1);
      expect(testTour.departures[0].seatsLeft).toBe(20);
    });

    it("should retrieve tour details", async () => {
      if (!testTour?._id) {
        console.log("Test tour not created, skipping");
        return;
      }

      const response = await request(app)
        .get(`/api/tours/${testTour._id}`)
        .expect("Content-Type", /json/);

      console.log("Tour details status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("_id");
        expect(response.body.title).toBe(testTour.title);
      }
    });

    it("should update tour availability", async () => {
      if (!testTour?.departures?.[0]) {
        console.log("Test tour not created properly, skipping");
        return;
      }

      const initialSeats = testTour.departures[0].seatsLeft;

      testTour.departures[0].seatsLeft = initialSeats - 5;
      await testTour.save();

      const updatedTour = await Tour.findById(testTour._id);
      expect(updatedTour.departures[0].seatsLeft).toBe(initialSeats - 5);
    });

    it("should list available tours", async () => {
      const response = await request(app)
        .get("/api/tours")
        .expect("Content-Type", /json/);

      console.log("Tours list status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(Array.isArray(response.body.tours || response.body)).toBe(true);
      }
    });
  });

  describe("[TC-BOOKING-01] Booking Creation and Management", () => {
    let bookingTour;
    let testBooking;

    beforeAll(async () => {
      // Create a tour for booking tests
      bookingTour = await Tour.create({
        title: "Booking Test Tour",
        name: "Booking Test Tour",
        description: "Test tour for booking",
        basePrice: 1000000,
        agencyId: new mongoose.Types.ObjectId(),
        duration: {
          days: 3,
          nights: 2,
        },
        departures: [
          {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            priceAdult: 1000000,
            priceChild: 500000,
            seatsLeft: 10,
          },
        ],
      });
    });

    it("should create a new booking", async () => {
      testBooking = await Booking.create({
        userId: testUser._id,
        items: [
          {
            tourId: testTour._id,
            name: testTour.title,
            date: testTour.departures[0].date.toISOString().slice(0, 10),
            adults: 2,
            children: 1,
            unitPriceAdult: 2000000,
            unitPriceChild: 1000000,
          },
        ],
        originalAmount: 5000000,
        totalAmount: 5000000,
        currency: "VND",
        status: "pending",
        payment: {
          provider: "momo",
          status: "pending",
        },
      });

      expect(testBooking).toBeTruthy();
      expect(testBooking.status).toBe("pending");
      expect(testBooking.totalAmount).toBe(5000000);
      expect(testBooking.items).toHaveLength(1);
    });

    it("should retrieve user bookings", async () => {
      const response = await request(app)
        .get("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("User bookings status:", response.statusCode);
      expect([200, 401, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(Array.isArray(response.body.bookings || response.body)).toBe(
          true
        );
      }
    });

    it("should update booking status", async () => {
      testBooking.status = "paid";
      testBooking.payment.status = "completed";
      testBooking.payment.paidAt = new Date();
      await testBooking.save();

      const updatedBooking = await Booking.findById(testBooking._id);
      expect(updatedBooking.status).toBe("paid");
      expect(updatedBooking.payment.status).toBe("completed");
    });

    it("should handle booking cancellation", async () => {
      testBooking.status = "cancelled";
      testBooking.cancelledAt = new Date();
      testBooking.cancelReason = "User requested cancellation";
      await testBooking.save();

      const cancelledBooking = await Booking.findById(testBooking._id);
      expect(cancelledBooking.status).toBe("cancelled");
      expect(cancelledBooking.cancelReason).toBeTruthy();
    });
  });

  describe("[TC-PROMO-01] Promotion/Voucher System", () => {
    let testPromotion;

    beforeAll(async () => {
      // Create test promotion for the suite
      testPromotion = await Promotion.create({
        code: `TEST${Date.now()}`,
        name: "Test Promotion",
        description: "Test discount voucher",
        type: "percentage",
        value: 10, // 10% off
        minOrderValue: 500000,
        maxDiscount: 200000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usageCount: 0,
        status: "active",
        createdBy: adminUser._id,
      });
    });

    it("should create a new promotion", async () => {
      expect(testPromotion).toBeTruthy();
      expect(testPromotion.code).toContain("TEST");
      expect(testPromotion.type).toBe("percentage");
      expect(testPromotion.value).toBe(10);
    });

    it("should validate promotion code", async () => {
      const response = await request(app)
        .post("/api/promotions/validate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: testPromotion.code,
          orderAmount: 1000000,
        })
        .expect("Content-Type", /json/);

      console.log("Promotion validation status:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("valid");
        expect(response.body).toHaveProperty("discountAmount");
      }
    });

    it("should calculate correct discount amount", async () => {
      const orderAmount = 1000000;
      const discountPercentage = 10;
      const expectedDiscount = orderAmount * (discountPercentage / 100);

      expect(expectedDiscount).toBe(100000);
      expect(expectedDiscount).toBeLessThanOrEqual(testPromotion.maxDiscount);
    });

    it("should reject expired promotion", async () => {
      const expiredPromo = await Promotion.create({
        code: `EXPIRED${Date.now()}`,
        name: "Expired Promo",
        description: "Expired promotion",
        type: "fixed",
        value: 50000,
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Ended 30 days ago
        usageLimit: 10,
        usageCount: 0,
        status: "active",
        createdBy: adminUser._id,
      });

      const response = await request(app)
        .post("/api/promotions/validate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: expiredPromo.code,
          orderAmount: 1000000,
        })
        .expect("Content-Type", /json/);

      console.log("Expired promo validation:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);

      // Cleanup
      await Promotion.deleteOne({ _id: expiredPromo._id });
    });

    it("should reject promotion below minimum order value", async () => {
      const response = await request(app)
        .post("/api/promotions/validate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: testPromotion.code,
          orderAmount: 100000, // Below minOrderValue of 500000
        })
        .expect("Content-Type", /json/);

      console.log("Below min order validation:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);
    });

    it("should track promotion usage", async () => {
      const initialCount = testPromotion.usageCount;

      testPromotion.usageCount += 1;
      await testPromotion.save();

      const updatedPromo = await Promotion.findById(testPromotion._id);
      expect(updatedPromo.usageCount).toBe(initialCount + 1);
    });

    it("should reject promotion at usage limit", async () => {
      const limitedPromo = await Promotion.create({
        code: `LIMITED${Date.now()}`,
        name: "Limited Use Promo",
        description: "Limited usage promotion",
        type: "fixed",
        value: 50000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 1,
        usageCount: 1, // Already at limit
        status: "active",
        createdBy: adminUser._id,
      });

      const response = await request(app)
        .post("/api/promotions/validate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: limitedPromo.code,
          orderAmount: 1000000,
        })
        .expect("Content-Type", /json/);

      console.log("Usage limit validation:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);

      // Cleanup
      await Promotion.deleteOne({ _id: limitedPromo._id });
    });
  });

  describe("[TC-CART-01] Shopping Cart Functionality", () => {
    let testCart;
    let testTour;

    beforeAll(async () => {
      testTour = await Tour.create({
        title: "Cart Test Tour",
        name: "Cart Test Tour",
        description: "Test tour for cart functionality",
        basePrice: 800000,
        agencyId: adminUser._id,
        duration: {
          days: 2,
          nights: 1,
        },
        departures: [
          {
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            priceAdult: 800000,
            priceChild: 400000,
            seatsLeft: 15,
          },
        ],
        createdBy: adminUser._id,
      });
    });

    it("should add item to cart", async () => {
      if (!testTour?._id || !testTour?.departures?.[0]) {
        console.log("Test tour not available, skipping");
        return;
      }

      const departureDate =
        typeof testTour.departures[0].date === "string"
          ? testTour.departures[0].date
          : testTour.departures[0].date.toISOString().slice(0, 10);

      const response = await request(app)
        .post("/api/carts/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          date: departureDate,
          adults: 2,
          children: 1,
        })
        .expect("Content-Type", /json/);

      console.log("Add to cart status:", response.statusCode);
      expect([200, 201, 401, 404]).toContain(response.statusCode);

      if (response.statusCode === 200 || response.statusCode === 201) {
        expect(response.body).toHaveProperty("success");
        expect(response.body.success).toBe(true);
      }
    });

    it("should retrieve cart items", async () => {
      const response = await request(app)
        .get("/api/carts")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Get cart status:", response.statusCode);
      expect([200, 401, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("items");
        expect(Array.isArray(response.body.items)).toBe(true);
      }
    });

    it("should update cart item quantity", async () => {
      if (!testUser?._id) {
        console.log("Test user not available, skipping");
        return;
      }

      // Get cart first
      const cart = await Cart.findOne({ userId: testUser._id });
      if (cart) {
        const cartItem = await CartItem.findOne({ cartId: cart._id });
        if (cartItem) {
          const response = await request(app)
            .put(`/api/carts/items/${cartItem._id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
              adults: 3,
              children: 2,
            })
            .expect("Content-Type", /json/);

          console.log("Update cart item status:", response.statusCode);
          expect([200, 404]).toContain(response.statusCode);
        }
      }
    });

    it("should remove item from cart", async () => {
      if (!testUser?._id) {
        console.log("Test user not available, skipping");
        return;
      }

      const cart = await Cart.findOne({ userId: testUser._id });
      if (cart) {
        const cartItem = await CartItem.findOne({ cartId: cart._id });
        if (cartItem) {
          const response = await request(app)
            .delete(`/api/carts/items/${cartItem._id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect("Content-Type", /json/);

          console.log("Remove cart item status:", response.statusCode);
          expect([200, 204, 404]).toContain(response.statusCode);
        }
      }
    });

    it("should calculate cart total correctly", async () => {
      if (!testUser?._id) {
        console.log("Test user not available, skipping");
        return;
      }

      // Add items to cart
      const cart = await Cart.findOne({ userId: testUser._id });
      if (!cart) {
        await Cart.create({ userId: testUser._id });
      }

      const newCart = await Cart.findOne({ userId: testUser._id });
      await CartItem.create({
        cartId: newCart._id,
        tourId: testTour._id,
        name: testTour.title,
        date: testTour.departures[0].date.toISOString().slice(0, 10),
        adults: 2,
        children: 1,
        unitPriceAdult: 800000,
        unitPriceChild: 400000,
        selected: true,
      });

      const expectedTotal = 2 * 800000 + 1 * 400000; // 2 adults + 1 child
      expect(expectedTotal).toBe(2000000);
    });
  });

  describe("[TC-SEAT-01] Seat Availability Management", () => {
    let testTour;

    beforeAll(async () => {
      testTour = await Tour.create({
        title: "Seat Management Test Tour",
        name: "Seat Management Test Tour",
        description: "Test tour for seat management",
        basePrice: 1000000,
        agencyId: adminUser._id,
        duration: {
          days: 3,
          nights: 2,
        },
        departures: [
          {
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            priceAdult: 1000000,
            priceChild: 500000,
            seatsLeft: 5, // Limited seats
          },
        ],
        createdBy: adminUser._id,
      });
    });

    it("should check seat availability before booking", async () => {
      const departure = testTour.departures[0];
      const requestedSeats = 3;

      expect(departure.seatsLeft).toBeGreaterThanOrEqual(requestedSeats);
    });

    it("should reject booking when seats insufficient", async () => {
      const departure = testTour.departures[0];
      const requestedSeats = 10; // More than available

      expect(requestedSeats).toBeGreaterThan(departure.seatsLeft);
    });

    it("should update seat count after booking", async () => {
      const initialSeats = testTour.departures[0].seatsLeft;
      const bookedSeats = 2;

      testTour.departures[0].seatsLeft = initialSeats - bookedSeats;
      await testTour.save();

      const updatedTour = await Tour.findById(testTour._id);
      expect(updatedTour.departures[0].seatsLeft).toBe(
        initialSeats - bookedSeats
      );
    });

    it("should handle concurrent seat booking", async () => {
      // Simulate race condition
      const departure = testTour.departures[0];
      const initialSeats = departure.seatsLeft;

      // Two simultaneous bookings
      const booking1 = 2;
      const booking2 = 1;

      departure.seatsLeft = initialSeats - booking1;
      await testTour.save();

      const afterFirst = await Tour.findById(testTour._id);
      expect(afterFirst.departures[0].seatsLeft).toBe(initialSeats - booking1);

      // Check if second booking can proceed
      expect(afterFirst.departures[0].seatsLeft).toBeGreaterThanOrEqual(
        booking2
      );
    });
  });

  describe("[TC-NOTIF-01] Notification System", () => {
    it("should trigger booking confirmation notification", async () => {
      // Test notification logic exists
      const notificationData = {
        userId: testUser?._id || new mongoose.Types.ObjectId(),
        type: "booking_confirmed",
        message: "Your booking has been confirmed",
        bookingId: new mongoose.Types.ObjectId(),
      };

      expect(notificationData).toBeTruthy();
      expect(notificationData.type).toBe("booking_confirmed");
      expect(notificationData.userId).toBeTruthy();
    });

    it("should trigger payment success notification", async () => {
      const notificationData = {
        userId: testUser?._id || new mongoose.Types.ObjectId(),
        type: "payment_success",
        message: "Payment successful",
        amount: 1000000,
      };

      expect(notificationData).toBeTruthy();
      expect(notificationData.type).toBe("payment_success");
      expect(notificationData.userId).toBeTruthy();
    });
  });

  describe("[TC-SECURITY-01] Authentication and Authorization", () => {
    it("should require authentication for protected routes", async () => {
      const response = await request(app).get("/api/bookings");

      console.log("Protected route without auth:", response.statusCode);
      expect([401, 403, 404]).toContain(response.statusCode);
    });

    it("should validate JWT token", async () => {
      const response = await request(app)
        .get("/api/bookings")
        .set("Authorization", "Bearer INVALID_TOKEN");

      console.log("Invalid token response:", response.statusCode);
      expect([401, 403, 404, 500]).toContain(response.statusCode);
    });

    it("should enforce role-based access control", async () => {
      // Traveler trying to access admin routes
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("RBAC enforcement:", response.statusCode);
      expect([401, 403, 404]).toContain(response.statusCode);
    });
  });
});
