// API test cho /api/payments endpoints (Jest + supertest)
const request = require("supertest");
const app = require("../server");

describe("Payment API", () => {
  // [TC1] POST /api/payments/momo - chưa login, phải trả về 401/403
  it("should reject create MoMo payment if not logged in", async () => {
    const res = await request(app)
       .post("/api/payments/momo") // [TC1] Kiểm tra: Người chưa đăng nhập không thể tạo thanh toán MoMo (bảo mật). API phải trả về 401/403.
      .send({ amount: 100000, items: [] });
    console.log(
      "POST /api/payments/momo (no login)",
      res.statusCode,
      res.headers["content-type"],
      res.body
    );
    expect([401, 403]).toContain(res.statusCode);
  });

  // [TC2] POST /api/payments/momo/ipn - public, luôn trả về 200/400 tuỳ payload
  it("should handle MoMo IPN (public endpoint)", async () => {
    const res = await request(app).post("/api/payments/momo/ipn").send({}); // Gửi payload rỗng, backend có thể trả về 200 hoặc 400
      console.log("POST /api/payments/momo/ipn", res.statusCode, res.body); // [TC2] Kiểm tra: Endpoint nhận callback từ MoMo là public, luôn phản hồi 200 hoặc 400 tùy payload, không yêu cầu đăng nhập.
    expect([200, 400]).toContain(res.statusCode);
  });

  // [TC3] GET /api/payments/momo/session/:orderId - chưa login, phải trả về 401/403
  it("should reject get MoMo session status if not logged in", async () => {
    const res = await request(app).get(
      "/api/payments/momo/session/dummy-order-id"
    );
      console.log("GET /api/payments/momo/session/:orderId (no login)", res.statusCode, res.headers["content-type"], res.body); // [TC3] Kiểm tra: Người chưa đăng nhập không thể xem trạng thái session thanh toán, API trả về 401/403.
    expect([401, 403]).toContain(res.statusCode);
  });

  // [TC4] GET /api/payments/booking/:provider/:orderId - chưa login, phải trả về 401/403
  it("should reject get booking by payment if not logged in", async () => {
    const res = await request(app).get(
      "/api/payments/booking/momo/dummy-order-id"
    );
      console.log("GET /api/payments/booking/:provider/:orderId (no login)", res.statusCode, res.headers["content-type"], res.body); // [TC4] Kiểm tra: Người chưa đăng nhập không thể tra cứu booking theo payment, API trả về 401/403.
    expect([401, 403]).toContain(res.statusCode);
  });

  // [TC5] POST /api/payments/retry/:bookingId - chưa login, phải trả về 401/403
  it("should reject retry payment for booking if not logged in", async () => {
    const res = await request(app).post("/api/payments/retry/dummy-booking-id");
      console.log("POST /api/payments/retry/:bookingId (no login)", res.statusCode, res.headers["content-type"], res.body); // [TC5] Kiểm tra: Người chưa đăng nhập không thể retry thanh toán cho booking, API trả về 401/403.
    expect([401, 403]).toContain(res.statusCode);
  });

  afterAll(async () => {
    try {
      const mongoose = require("mongoose");
      await mongoose.disconnect();
    } catch (e) {}
  });
});
