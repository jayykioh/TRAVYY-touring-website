// API test cho /api/reviews endpoints (Jest + supertest)
const request = require("supertest");
const app = require("../server");

describe("Review API", () => {
  // [TC1] Kiểm tra: GET /api/reviews/tour/:tourId - public, trả về mảng nếu hợp lệ, 404/400 nếu không.
  it("should get reviews of a tour (public)", async () => {
    // Thay TOUR_ID_TEST thành id tour hợp lệ trong DB để test thực tế
    const tourId = process.env.TEST_TOUR_ID || "invalid-tour-id";
    const res = await request(app).get(`/api/reviews/tour/${tourId}`);
    console.log(
      "GET /api/reviews/tour/:tourId",
      res.statusCode,
      res.headers["content-type"],
      res.body
    );
    expect([200, 404, 400]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  // [TC2] Kiểm tra: POST /api/reviews - chưa login, phải trả về 401/403/404 (bảo mật).
  it("should reject create review if not logged in", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .send({ tourId: "dummy", rating: 5, comment: "Test review" });
    console.log(
      "POST /api/reviews (no login)",
      res.statusCode,
      res.headers["content-type"],
      res.body
    );
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  afterAll(async () => {
    try {
      const mongoose = require("mongoose");
      await mongoose.disconnect();
    } catch (e) {}
  });
});
