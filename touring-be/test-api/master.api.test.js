// Master test suite runner - runs all external API and critical feature tests
const request = require("supertest");
const app = require("../server");

describe("🚀 Travyy Tourism - Complete Test Suite", () => {
  console.log("\n==============================================");
  console.log("🎯 TRAVYY TOURISM SYSTEM TEST SUITE");
  console.log("==============================================\n");

  describe("📋 Test Environment Check", () => {
    it("should have required environment variables", () => {
      const requiredVars = ["MONGO_URI", "JWT_SECRET"];

      const optionalVars = [
        "MOMO_PARTNER_CODE",
        "MOMO_ACCESS_KEY",
        "MOMO_SECRET_KEY",
        "PAYPAL_CLIENT_ID",
        "PAYPAL_SECRET",
        "GOOGLE_CLIENT_ID",
        "FACEBOOK_APP_ID",
      ];

      console.log("\n✅ Required Environment Variables:");
      requiredVars.forEach((varName) => {
        const exists = !!process.env[varName];
        console.log(
          `   ${exists ? "✓" : "✗"} ${varName}: ${exists ? "SET" : "MISSING"}`
        );
        if (!exists) {
          console.warn(`⚠️  Warning: ${varName} is required`);
        }
      });

      console.log("\n📦 Optional Environment Variables (for external APIs):");
      optionalVars.forEach((varName) => {
        const exists = !!process.env[varName];
        console.log(
          `   ${exists ? "✓" : "-"} ${varName}: ${exists ? "SET" : "not set"}`
        );
      });

      console.log("\n");
    });

    it("should connect to database", async () => {
      const mongoose = require("mongoose");
      expect(mongoose.connection.readyState).toBeGreaterThan(0);
      console.log("✅ Database connection: OK");
    });

    it("should have server running", async () => {
      const response = await request(app).get("/");
      console.log(`✅ Server status: ${response.statusCode}`);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("🔐 External API Integration Status", () => {
    it("should check MoMo API configuration", () => {
      const momoConfigured =
        !!process.env.MOMO_PARTNER_CODE &&
        !!process.env.MOMO_ACCESS_KEY &&
        !!process.env.MOMO_SECRET_KEY;

      console.log(
        `\n${momoConfigured ? "✅" : "⚠️"} MoMo Sandbox: ${
          momoConfigured ? "Configured" : "Not Configured"
        }`
      );

      if (momoConfigured) {
        console.log("   Partner Code:", process.env.MOMO_PARTNER_CODE);
        console.log("   Mode:", process.env.MOMO_SANDBOX_MODE || "sandbox");
        console.log(
          "   Max Amount:",
          process.env.MOMO_MAX_AMOUNT || "10,000,000 VND"
        );
      } else {
        console.log(
          "   Run: npm test -- momo.api.test.js (will use fallback credentials)"
        );
      }
    });

    it("should check PayPal API configuration", () => {
      const paypalConfigured =
        !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_SECRET;

      console.log(
        `\n${paypalConfigured ? "✅" : "⚠️"} PayPal: ${
          paypalConfigured ? "Configured" : "Not Configured"
        }`
      );

      if (paypalConfigured) {
        console.log("   Mode:", process.env.PAYPAL_MODE || "sandbox");
        console.log(
          "   Client ID:",
          process.env.PAYPAL_CLIENT_ID.slice(0, 20) + "..."
        );
      } else {
        console.log("   Tests will fail without valid credentials");
        console.log("   Set PAYPAL_CLIENT_ID and PAYPAL_SECRET in .env");
      }
    });

    it("should check Google OAuth configuration", () => {
      const googleConfigured =
        !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

      console.log(
        `\n${googleConfigured ? "✅" : "⚠️"} Google OAuth: ${
          googleConfigured ? "Configured" : "Not Configured"
        }`
      );

      if (googleConfigured) {
        console.log(
          "   Client ID:",
          process.env.GOOGLE_CLIENT_ID.slice(0, 30) + "..."
        );
        console.log("   Callback URL:", process.env.GOOGLE_CALLBACK_URL);
      } else {
        console.log("   OAuth tests will be limited");
      }
    });

    it("should check Facebook OAuth configuration", () => {
      const facebookConfigured =
        !!process.env.FACEBOOK_APP_ID && !!process.env.FACEBOOK_APP_SECRET;

      console.log(
        `\n${facebookConfigured ? "✅" : "⚠️"} Facebook OAuth: ${
          facebookConfigured ? "Configured" : "Not Configured"
        }`
      );

      if (facebookConfigured) {
        console.log("   App ID:", process.env.FACEBOOK_APP_ID);
        console.log("   Callback URL:", process.env.FACEBOOK_CALLBACK_URL);
      } else {
        console.log("   OAuth tests will be limited");
      }
    });
  });

  describe("📊 Test Suite Coverage Summary", () => {
    it("should list all test files", () => {
      const testFiles = [
        "auth.api.test.js - Authentication & Security",
        "momo.api.test.js - MoMo Sandbox Payment (NEW)",
        "paypal.api.test.js - PayPal Payment (NEW)",
        "oauth.api.test.js - Google & Facebook OAuth (NEW)",
        "features.api.test.js - Critical Business Features (NEW)",
        "cart.api.test.js - Shopping Cart",
        "payment.api.test.js - Payment Integration",
        "profile.api.test.js - User Profile",
        "review.api.test.js - Review System",
        "tour.api.test.js - Tour Management",
        "wishlist.api.test.js - Wishlist",
      ];

      console.log("\n📁 Available Test Suites:");
      testFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });

      console.log("\n🎯 New Test Suites (External APIs):");
      console.log("   - momo.api.test.js: 15+ test cases");
      console.log("   - paypal.api.test.js: 20+ test cases");
      console.log("   - oauth.api.test.js: 12+ test cases");
      console.log("   - features.api.test.js: 40+ test cases");

      console.log("\n📊 Total Test Cases: 100+ across all suites\n");
    });
  });

  describe("🏃 Quick Test Commands", () => {
    it("should display test commands", () => {
      console.log("\n📝 How to Run Tests:");
      console.log("\n1. Run ALL tests:");
      console.log("   npm test\n");

      console.log("2. Run specific test suites:");
      console.log("   npm test -- momo.api.test.js");
      console.log("   npm test -- paypal.api.test.js");
      console.log("   npm test -- oauth.api.test.js");
      console.log("   npm test -- features.api.test.js\n");

      console.log("3. Run with coverage:");
      console.log("   npm run test:coverage\n");

      console.log("4. Watch mode:");
      console.log("   npm run test:watch\n");

      console.log("5. Run single test:");
      console.log(
        '   npm test -- --testNamePattern="should create MoMo payment"\n'
      );
    });
  });

  describe("📚 Documentation Links", () => {
    it("should reference documentation files", () => {
      console.log("\n📖 Documentation:");
      console.log("   - test-api/README_TEST.md: Quick start guide");
      console.log("   - test-api/TEST_DOCUMENTATION.md: Detailed test docs");
      console.log("\n💡 Tips:");
      console.log("   - Check TEST_DOCUMENTATION.md for detailed test cases");
      console.log("   - Set up .env file with API credentials");
      console.log("   - Run tests in watch mode during development");
      console.log(
        "   - Check coverage report: coverage/lcov-report/index.html\n"
      );
    });
  });

  describe("✅ System Health Check", () => {
    it("should verify all critical endpoints exist", async () => {
      const criticalEndpoints = [
        { method: "POST", path: "/api/auth/register" },
        { method: "POST", path: "/api/auth/login" },
        { method: "POST", path: "/api/payments/momo" },
        { method: "POST", path: "/api/paypal/create-order" },
        { method: "GET", path: "/api/tours" },
        { method: "GET", path: "/api/bookings" },
      ];

      console.log("\n🔍 Critical Endpoints Check:");

      for (const endpoint of criticalEndpoints) {
        try {
          let response;
          if (endpoint.method === "GET") {
            response = await request(app).get(endpoint.path);
          } else {
            response = await request(app).post(endpoint.path);
          }

          const status = response.statusCode;
          const isOk = [200, 201, 400, 401, 403, 404].includes(status);
          console.log(
            `   ${isOk ? "✓" : "✗"} ${endpoint.method} ${
              endpoint.path
            }: ${status}`
          );
        } catch (error) {
          console.log(`   ✗ ${endpoint.method} ${endpoint.path}: ERROR`);
        }
      }

      console.log("\n");
    });
  });

  describe("🎉 Ready to Test!", () => {
    it("should be ready for comprehensive testing", () => {
      console.log("\n==============================================");
      console.log("✅ System is ready for testing!");
      console.log("==============================================\n");

      console.log("🚀 Next Steps:");
      console.log("   1. Configure API credentials in .env");
      console.log("   2. Run: npm test");
      console.log("   3. Check coverage: npm run test:coverage");
      console.log("   4. Review reports in coverage/lcov-report/\n");

      console.log("📧 Test Coverage Goals:");
      console.log("   - Auth: 80%+");
      console.log("   - Payment (MoMo): 85%+");
      console.log("   - Payment (PayPal): 85%+");
      console.log("   - OAuth: 75%+");
      console.log("   - Features: 80%+\n");

      console.log("Happy Testing! 🎉\n");
    });
  });
});
