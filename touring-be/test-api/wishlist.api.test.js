// API test cho /api/wishlist endpoints (Jest + supertest)
const request = require("supertest");
const app = require("../server");

describe("Wishlist API", () => {
  // [TC1] Kiểm tra: GET /api/wishlist - chưa login, phải trả về 401/403 (bảo mật).
  it("should reject get wishlist if not logged in", async () => {
    const res = await request(app)
      .get("/api/wishlist")
      .expect("Content-Type", /json/);
    expect([401, 403]).toContain(res.statusCode);
  });

  // Test đúng: nếu có token hợp lệ, trả về 200 và là mảng (giả lập token nếu có sẵn)
  // [TC2] Kiểm tra: GET /api/wishlist - đã login (token hợp lệ), trả về 200 và body là mảng wishlist.
  it("should get wishlist if logged in (mock token)", async () => {
    // Thay YOUR_JWT_TOKEN bằng token hợp lệ lấy từ đăng nhập thật hoặc cấu hình test
    const token = process.env.TEST_USER_TOKEN || "";
    if (!token) {
      console.warn(
        "⚠️  Bỏ qua test get wishlist khi đã login vì chưa có token test."
      );
      return;
    }
    const res = await request(app)
      .get("/api/wishlist")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/);
    expect([200, 201]).toContain(res.statusCode);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    // Đóng kết nối mongoose nếu có
    try {
      const mongoose = require("mongoose");
      await mongoose.disconnect();
    } catch (e) {}
  });
});
