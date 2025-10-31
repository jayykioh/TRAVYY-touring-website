describe("Traveler Login UI", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should render traveler login form", () => {
    cy.get('input[name="email"]').should("exist");
    cy.get('input[name="password"]').should("exist");
    cy.contains("Đăng nhập").should("exist");
  });

  it("should show error for empty or invalid input", () => {
    cy.get('button[type="submit"]').click();
    cy.contains("Vui lòng nhập đầy đủ thông tin").should("exist");
    cy.get('input[name="email"]').type("invalid-email");
    cy.get('input[name="password"]').type("somepassword");
    cy.get('button[type="submit"]').click();
    cy.contains("Email không hợp lệ").should("exist");
  });

  it("should login successfully and redirect to traveler dashboard", () => {
    cy.get('input[name="username"]').type("nguoidungmoi");
    cy.get('input[name="password"]').type("nguoidungmoi");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/home");
  });

  it("should show error for incorrect credentials", () => {
    cy.get('input[name="email"]').type("travy922@gmail.com");
    cy.get('input[name="password"]').type("fall2025");
    cy.get('button[type="submit"]').click();
    cy.contains("Email hoặc mật khẩu không chính xác").should("exist");
  });
});
describe("Admin Login UI", () => {
  beforeEach(() => {
    // Mock API login và các API khác nếu cần
    cy.intercept("POST", "/api/admin/login", (req) => {
      const { email, password } = req.body;
      if (!email || !password) {
        req.reply({
          statusCode: 400,
          body: { success: false, message: "Vui lòng nhập đầy đủ thông tin" },
        });
      } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        req.reply({
          statusCode: 400,
          body: { success: false, message: "Email không hợp lệ" },
        });
      } else if (email === "admin123@travyy.com" && password === "Admin@123") {
        req.reply({ statusCode: 200, body: { success: true } });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            success: false,
            message: "Email hoặc mật khẩu không chính xác",
          },
        });
      }
    }).as("adminLogin");

    cy.visit("/admin/login");
  });

  it("should render login form with email and password fields", () => {
    cy.get('input[name="email"]').should("exist");
    cy.get('input[name="password"]').should("exist");
    cy.contains("Đăng nhập").should("exist");
  });

  it("should show error if email or password is empty", () => {
    cy.get('button[type="submit"]').click();
    cy.contains("Vui lòng nhập đầy đủ thông tin").should("exist");
  });

  it("should show error for invalid email format", () => {
    cy.get('input[name="email"]').type("invalid-email");
    cy.get('input[name="password"]').type("somepassword");
    cy.get('button[type="submit"]').click();
    cy.contains("Email không hợp lệ").should("exist");
  });

  it("should show/hide password when toggle is clicked", () => {
    cy.get('input[name="password"]').type("somepassword");
    cy.get('button[type="button"]').last().click();
    cy.get('input[name="password"]').should("have.attr", "type", "text");
    cy.get('button[type="button"]').last().click();
    cy.get('input[name="password"]').should("have.attr", "type", "password");
  });

  it("should show loading state when submitting", () => {
    cy.get('input[name="email"]').type("admin123@travyy.com");
    cy.get('input[name="password"]').type("Admin@123");
    cy.get('button[type="submit"]').click();
    cy.contains("Đang đăng nhập...").should("exist");
  });

  it("should login successfully with correct credentials", () => {
    cy.get('input[name="email"]').type("admin123@travyy.com");
    cy.get('input[name="password"]').type("Admin@123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/admin/dashboard");
  });

  it('should remember email if "Ghi nhớ đăng nhập" is checked', () => {
    cy.get('input[name="email"]').type("admin123@travyy.com");
    cy.get('input[name="password"]').type("Admin@123");
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();
    cy.window().then((win) => {
      expect(win.localStorage.getItem("adminRemember")).to.eq(
        "admin123@travyy.com"
      );
    });
  });

  // Có thể mock thêm cho 2FA nếu muốn
  it("should redirect to verify page if 2FA or email verification required", () => {
    cy.intercept("POST", "/api/admin/login", {
      statusCode: 200,
      body: {
        success: false,
        requires2FA: true,
        userId: "123",
        message: "Cần xác thực",
      },
    }).as("adminLogin2FA");
    cy.get('input[name="email"]').type("admin2fa@travyy.com");
    cy.get('input[name="password"]').type("Admin@123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/admin/login/verify");
  });
});
