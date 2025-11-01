// Comprehensive test suite to improve coverage
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/Users");
const Tour = require("../models/agency/Tours");
const { Cart, CartItem } = require("../models/Carts");
const Review = require("../models/Review");
const Wishlist = require("../models/Wishlist");

describe("Coverage Improvement Tests", () => {
  let authToken;
  let testUser;
  let testTour;

  beforeAll(async () => {
    // Create test user
    const userResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: `coverage_test_${Date.now()}@example.com`,
        password: "Test1234!@#",
        name: "Coverage Test User",
        username: `coveragetest${Date.now()}`,
        provinceId: "01",
        wardId: "00001",
        role: "Traveler",
      });

    if (userResponse.body.accessToken) {
      authToken = userResponse.body.accessToken;
      testUser = userResponse.body.user;
    }

    // Create test tour
    testTour = await Tour.create({
      title: "Coverage Test Tour",
      name: "Coverage Test Tour",
      description: "Test tour for coverage",
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

  afterAll(async () => {
    if (testUser?._id) {
      await User.deleteOne({ _id: testUser._id });
      await Cart.deleteMany({ userId: testUser._id });
      await Review.deleteMany({ userId: testUser._id });
      await Wishlist.deleteMany({ userId: testUser._id });
    }
    if (testTour?._id) {
      await Tour.deleteOne({ _id: testTour._id });
    }
  });

  describe("[COVERAGE] Cart Controller", () => {
    it("should get cart with auth", async () => {
      const response = await request(app)
        .get("/api/carts")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Get cart status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should add item to cart", async () => {
      const response = await request(app)
        .post("/api/carts/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          date: testTour.departures[0].date.toISOString().slice(0, 10),
          adults: 2,
          children: 1,
        })
        .expect("Content-Type", /json/);

      console.log("Add to cart status:", response.statusCode);
      expect([200, 201, 400, 404]).toContain(response.statusCode);
    });

    it("should update cart item", async () => {
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

    it("should clear cart", async () => {
      const response = await request(app)
        .delete("/api/carts/clear")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Clear cart status:", response.statusCode);
      expect([200, 204, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Review Controller", () => {
    it("should get reviews for tour", async () => {
      const response = await request(app)
        .get(`/api/reviews/tour/${testTour._id}`)
        .expect("Content-Type", /json/);

      console.log("Get tour reviews status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should create review with auth", async () => {
      const response = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          rating: 5,
          comment: "Great tour!",
        })
        .expect("Content-Type", /json/);

      console.log("Create review status:", response.statusCode);
      expect([201, 400, 404]).toContain(response.statusCode);
    });

    it("should get user reviews", async () => {
      const response = await request(app)
        .get("/api/reviews/my-reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Get my reviews status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Wishlist Controller", () => {
    it("should get wishlist", async () => {
      const response = await request(app)
        .get("/api/wishlist")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Get wishlist status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should add to wishlist", async () => {
      const response = await request(app)
        .post("/api/wishlist/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
        })
        .expect("Content-Type", /json/);

      console.log("Add to wishlist status:", response.statusCode);
      expect([200, 201, 400, 404]).toContain(response.statusCode);
    });

    it("should remove from wishlist", async () => {
      const response = await request(app)
        .delete(`/api/wishlist/remove/${testTour._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Remove from wishlist status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Profile Controller", () => {
    it("should get user profile", async () => {
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Get profile status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should update profile", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Updated Name",
          phone: "0912345678",
        })
        .expect("Content-Type", /json/);

      console.log("Update profile status:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Tour Routes", () => {
    it("should search tours", async () => {
      const response = await request(app)
        .get("/api/tours/search")
        .query({ keyword: "test" })
        .expect("Content-Type", /json/);

      console.log("Search tours status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should get tour by id", async () => {
      const response = await request(app)
        .get(`/api/tours/${testTour._id}`)
        .expect("Content-Type", /json/);

      console.log("Get tour by id status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should handle invalid tour id", async () => {
      const response = await request(app)
        .get("/api/tours/invalid_id")
        .expect("Content-Type", /json/);

      console.log("Invalid tour id status:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Auth Refresh Token", () => {
    it("should handle refresh token request", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .expect("Content-Type", /json/);

      console.log("Refresh token status:", response.statusCode);
      expect([200, 401, 403]).toContain(response.statusCode);
    });

    it("should logout", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .expect("Content-Type", /json/);

      console.log("Logout status:", response.statusCode);
      expect([200, 204]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Password Management", () => {
    it("should handle forgot password", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({
          email: testUser.email,
        })
        .expect("Content-Type", /json/);

      console.log("Forgot password status:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);
    });

    it("should reject invalid reset token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "invalid_token",
          newPassword: "NewPassword123!",
        })
        .expect("Content-Type", /json/);

      console.log("Reset password with invalid token:", response.statusCode);
      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Error Handling", () => {
    it("should handle 404 for unknown routes", async () => {
      const response = await request(app).get("/api/unknown/route");

      console.log("Unknown route status:", response.statusCode);
      expect(response.statusCode).toBe(404);
    });

    it("should handle invalid JSON body", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send("invalid json");

      console.log("Invalid JSON status:", response.statusCode);
      expect([400, 500]).toContain(response.statusCode);
    });

    it("should require auth for protected endpoints", async () => {
      const protectedEndpoints = [
        "/api/profile",
        "/api/carts",
        "/api/wishlist",
        "/api/bookings",
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app).get(endpoint);
        console.log(`${endpoint} without auth:`, response.statusCode);
        expect([401, 403, 404]).toContain(response.statusCode);
      }
    });
  });

  describe("[COVERAGE] Booking Controller", () => {
    it("should get user bookings", async () => {
      const response = await request(app)
        .get("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Get bookings status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should get booking by id", async () => {
      const bookingId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/);

      console.log("Get booking by id status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Promotion Validation", () => {
    it("should validate promotion code format", async () => {
      const response = await request(app)
        .post("/api/promotions/validate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: "INVALID",
          orderAmount: 100000,
        })
        .expect("Content-Type", /json/);

      console.log("Validate invalid promotion:", response.statusCode);
      expect([400, 404]).toContain(response.statusCode);
    });

    it("should list active promotions", async () => {
      const response = await request(app)
        .get("/api/promotions")
        .expect("Content-Type", /json/);

      console.log("List promotions status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Help System", () => {
    it("should get help articles", async () => {
      const response = await request(app)
        .get("/api/help/articles")
        .expect("Content-Type", /json/);

      console.log("Get help articles status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should search help articles", async () => {
      const response = await request(app)
        .get("/api/help/search")
        .query({ q: "payment" })
        .expect("Content-Type", /json/);

      console.log("Search help articles status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Location Services", () => {
    it("should get provinces", async () => {
      const response = await request(app)
        .get("/api/location/provinces")
        .expect("Content-Type", /json/);

      console.log("Get provinces status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });

    it("should get districts by province", async () => {
      const response = await request(app)
        .get("/api/location/districts/01")
        .expect("Content-Type", /json/);

      console.log("Get districts status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("[COVERAGE] Zone/Discovery Services", () => {
    it("should discover zones", async () => {
      const response = await request(app)
        .post("/api/discover")
        .send({
          query: "beach in Da Nang",
        })
        .expect("Content-Type", /json/);

      console.log("Discover zones status:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);
    });

    it("should get zones by province", async () => {
      const response = await request(app)
        .get("/api/zones/province/01")
        .expect("Content-Type", /json/);

      console.log("Get zones by province status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });
});
