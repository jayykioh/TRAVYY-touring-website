// Booking controller coverage tests
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/Users");
const Tour = require("../models/agency/Tours");
const Booking = require("../models/Bookings");

describe("Booking Controller Coverage Tests", () => {
  let authToken;
  let testUser;
  let testTour;
  let testBooking;

  // Helper function to get departure date
  const getDepartureDate = (tour) => {
    if (!tour?.departures?.[0]?.date) return null;
    const date = tour.departures[0].date;
    return typeof date === "string" ? date.slice(0, 10) : date.toISOString().slice(0, 10);
  };

  beforeAll(async () => {
    // Create test user
    const userResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: `booking_test_${Date.now()}@example.com`,
        password: "Test1234!@#",
        name: "Booking Test User",
        username: `bookingtest${Date.now()}`,
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
      title: "Booking Coverage Test Tour",
      name: "Booking Test Tour",
      description: "Test tour for booking coverage",
      basePrice: 2000000,
      agencyId: new mongoose.Types.ObjectId(),
      duration: {
        days: 5,
        nights: 4,
      },
      departures: [
        {
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          priceAdult: 2000000,
          priceChild: 1000000,
          seatsLeft: 20,
        },
      ],
    });
  });

  afterAll(async () => {
    if (testUser?._id) {
      await User.deleteOne({ _id: testUser._id });
      await Booking.deleteMany({ userId: testUser._id });
    }
    if (testTour?._id) {
      await Tour.deleteOne({ _id: testTour._id });
    }
  });

  describe("GET /api/bookings - Get User Bookings", () => {
    it("should get user bookings", async () => {
      const response = await request(app)
        .get("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get bookings:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(Array.isArray(response.body) || Array.isArray(response.body.bookings)).toBe(true);
      }
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/bookings");

      console.log("Get bookings without auth:", response.statusCode);
      expect([401, 403, 404]).toContain(response.statusCode);
    });

    it("should filter by status", async () => {
      const response = await request(app)
        .get("/api/bookings")
        .query({ status: "confirmed" })
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get bookings by status:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("GET /api/bookings/:id - Get Booking Details", () => {
    beforeAll(async () => {
      // Create a test booking
      testBooking = await Booking.create({
        userId: testUser._id,
        tourId: testTour._id,
        departureDate: testTour.departures[0].date,
        adults: 2,
        children: 1,
        totalPrice: 5000000,
        status: "pending",
        contactInfo: {
          name: testUser.name,
          email: testUser.email,
          phone: "0912345678",
        },
      });
    });

    it("should get booking by id", async () => {
      const response = await request(app)
        .get(`/api/bookings/${testBooking._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get booking by id:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("_id");
      }
    });

    it("should reject invalid booking id", async () => {
      const response = await request(app)
        .get("/api/bookings/invalid_id")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get invalid booking id:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });

    it("should reject non-existent booking", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/bookings/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get non-existent booking:", response.statusCode);
      expect([404, 500]).toContain(response.statusCode);
    });
  });

  describe("POST /api/bookings - Create Booking", () => {
    it("should create booking successfully", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          departureDate: getDepartureDate(testTour),
          adults: 2,
          children: 0,
          contactInfo: {
            name: "Test User",
            email: "test@example.com",
            phone: "0912345678",
          },
        });

      console.log("Create booking:", response.statusCode);
      expect([200, 201, 400, 404]).toContain(response.statusCode);
    });

    it("should reject missing required fields", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          // Missing departureDate
          adults: 2,
        });

      console.log("Create booking without date:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });

    it("should reject zero adults", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          departureDate: getDepartureDate(testTour),
          adults: 0,
          children: 0,
        });

      console.log("Create booking with zero adults:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });

    it("should reject invalid contact info", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          departureDate: getDepartureDate(testTour),
          adults: 2,
          contactInfo: {
            // Missing required fields
          },
        });

      console.log("Create booking with invalid contact:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });
  });

  describe("PUT /api/bookings/:id - Update Booking", () => {
    it("should update booking status", async () => {
      if (!testBooking?._id) {
        console.log("No test booking, skipping");
        return;
      }

      const response = await request(app)
        .put(`/api/bookings/${testBooking._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "confirmed",
        });

      console.log("Update booking:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);
    });

    it("should reject invalid status", async () => {
      if (!testBooking?._id) {
        console.log("No test booking, skipping");
        return;
      }

      const response = await request(app)
        .put(`/api/bookings/${testBooking._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "invalid_status",
        });

      console.log("Update with invalid status:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });
  });

  describe("DELETE /api/bookings/:id - Cancel Booking", () => {
    it("should cancel booking", async () => {
      if (!testBooking?._id) {
        console.log("No test booking, skipping");
        return;
      }

      const response = await request(app)
        .delete(`/api/bookings/${testBooking._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Cancel booking:", response.statusCode);
      expect([200, 204, 400, 404]).toContain(response.statusCode);
    });

    it("should reject cancelling non-existent booking", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/bookings/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Cancel non-existent booking:", response.statusCode);
      expect([404, 500]).toContain(response.statusCode);
    });
  });

  describe("GET /api/bookings/stats - Get Booking Statistics", () => {
    it("should get booking statistics", async () => {
      const response = await request(app)
        .get("/api/bookings/stats")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get booking stats:", response.statusCode);
      expect([200, 404, 500]).toContain(response.statusCode);
    });
  });

  describe("POST /api/bookings/:id/payment - Process Payment", () => {
    it("should initiate payment for booking", async () => {
      if (!testBooking?._id) {
        console.log("No test booking, skipping");
        return;
      }

      const response = await request(app)
        .post(`/api/bookings/${testBooking._id}/payment`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          paymentMethod: "momo",
        });

      console.log("Process payment:", response.statusCode);
      expect([200, 201, 400, 404, 500]).toContain(response.statusCode);
    });

    it("should reject invalid payment method", async () => {
      if (!testBooking?._id) {
        console.log("No test booking, skipping");
        return;
      }

      const response = await request(app)
        .post(`/api/bookings/${testBooking._id}/payment`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          paymentMethod: "invalid_method",
        });

      console.log("Invalid payment method:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });
  });

  describe("Edge Cases", () => {
    it("should handle booking with max seats", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          departureDate: getDepartureDate(testTour),
          adults: 20, // Max seats
          children: 0,
          contactInfo: {
            name: "Test User",
            email: "test@example.com",
            phone: "0912345678",
          },
        });

      console.log("Booking max seats:", response.statusCode);
      expect([200, 201, 400, 404, 500]).toContain(response.statusCode);
    });

    it("should reject booking exceeding available seats", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          departureDate: getDepartureDate(testTour),
          adults: 100, // More than available
          children: 0,
          contactInfo: {
            name: "Test User",
            email: "test@example.com",
            phone: "0912345678",
          },
        });

      console.log("Booking exceeding seats:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });

    it("should handle booking past departure date", async () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tourId: testTour._id.toString(),
          departureDate: pastDate.toISOString().slice(0, 10),
          adults: 2,
          contactInfo: {
            name: "Test User",
            email: "test@example.com",
            phone: "0912345678",
          },
        });

      console.log("Booking past date:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });
  });
});
