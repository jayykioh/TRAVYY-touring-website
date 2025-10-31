// API test cho /api/profile endpoints (Jest + supertest)
const request = require("supertest");
const app = require("../server");

describe("Profile API", () => {
  // Cần token hợp lệ, ở đây chỉ test truy cập khi chưa đăng nhập
  // [TC1] Kiểm tra: GET /api/profile/me - chưa login, phải trả về 401/403 (bảo mật).
  it("should reject profile info if not logged in", async () => {
    const res = await request(app)
      .get("/api/profile/me")
      .expect("Content-Type", /json/);
    expect([401, 403]).toContain(res.statusCode);
  });

  // Có thể bổ sung test đăng nhập lấy token, rồi test lấy profile khi đã đăng nhập
  // ...
});
