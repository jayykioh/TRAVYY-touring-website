// API test cho /api/tour endpoints (Jest + supertest)
const request = require("supertest");
const app = require("../server");

describe("Tour API", () => {
  // [TC1] Kiểm tra: GET /api/tours - public, trả về mảng tour.
  it("should get all tours (public)", async () => {
    const res = await request(app)
      .get("/api/tours")
      .expect("Content-Type", /json/);
    expect([200, 201]).toContain(res.statusCode);
    // Đúng: trả về mảng (list tour)
    expect(Array.isArray(res.body)).toBe(true);
  });

  // [TC2] Kiểm tra: GET /api/tours/:id - id không tồn tại, phải trả về 404/400, trả về object có message.
  it("should return 404 for non-existent tour", async () => {
    const res = await request(app)
      .get("/api/tours/invalid-id-123")
      .expect("Content-Type", /json/);
    expect([404, 400]).toContain(res.statusCode);
    // Đúng: trả về object có trường error/message
    expect(typeof res.body).toBe("object");
    // Có thể trả về { message: ... } hoặc { error: ... }
    expect(res.body).toMatchObject({ message: expect.any(String) });
  });
});
