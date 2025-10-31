// API test cho /api/cart endpoints (Jest + supertest)
const request = require("supertest");
const app = require("../server");

describe("Cart API", () => {
  // [TC1] Kiểm tra: GET /api/cart - chưa login, phải trả về 401/403 (bảo mật).
  it("should reject get cart if not logged in", async () => {
    const res = await request(app).get("/api/cart");
    console.log(
      "GET /api/cart (no login)",
      res.statusCode,
      res.headers["content-type"],
      res.body
    );
    expect([401, 403]).toContain(res.statusCode);
  });

  // [TC2] Kiểm tra: POST /api/cart - chưa login, phải trả về 401/403 (bảo mật).
  it("should reject add to cart if not logged in", async () => {
    const res = await request(app)
      .post("/api/cart")
      .send({ tourId: "dummy", quantity: 1 });
    console.log(
      "POST /api/cart (no login)",
      res.statusCode,
      res.headers["content-type"],
      res.body
    );
    expect([401, 403]).toContain(res.statusCode);
  });

  // [TC3] Kiểm tra: PUT /api/cart/:itemId - chưa login, phải trả về 401/403 (bảo mật).
  it("should reject update cart item if not logged in", async () => {
    const res = await request(app)
      .put("/api/cart/dummy-item-id")
      .send({ quantity: 2 });
    console.log(
      "PUT /api/cart/:itemId (no login)",
      res.statusCode,
      res.headers["content-type"],
      res.body
    );
    expect([401, 403]).toContain(res.statusCode);
  });

  // [TC4] Kiểm tra: DELETE /api/cart/:itemId - chưa login, phải trả về 401/403 (bảo mật).
  it("should reject delete cart item if not logged in", async () => {
    const res = await request(app).delete("/api/cart/dummy-item-id");
    console.log(
      "DELETE /api/cart/:itemId (no login)",
      res.statusCode,
      res.headers["content-type"],
      res.body
    );
    expect([401, 403]).toContain(res.statusCode);
  });

  // [TC5] Kiểm tra: DELETE /api/cart - chưa login, phải trả về 401/403 (bảo mật).
  it("should reject clear cart if not logged in", async () => {
    const res = await request(app).delete("/api/cart");
    console.log(
      "DELETE /api/cart (no login)",
      res.statusCode,
      res.headers["content-type"],
      res.body
    );
    expect([401, 403]).toContain(res.statusCode);
  });

  afterAll(async () => {
    try {
      const mongoose = require("mongoose");
      await mongoose.disconnect();
    } catch (e) {}
  });
});
