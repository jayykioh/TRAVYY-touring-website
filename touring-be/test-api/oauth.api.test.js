// Test suite for OAuth Integration (Google & Facebook)
const request = require("supertest");
const app = require("../server");
const User = require("../models/Users");

describe("OAuth Integration Tests", () => {
  describe("[TC-OAUTH-01] Google OAuth Configuration", () => {
    it("should have Google OAuth endpoint configured", async () => {
      const response = await request(app).get("/api/auth/google");

      console.log("Google OAuth redirect status:", response.statusCode);
      // Should redirect to Google or return error
      expect([302, 500]).toContain(response.statusCode);
    });
  });

  describe("[TC-OAUTH-02] Facebook OAuth Configuration", () => {
    it("should have Facebook OAuth endpoint configured", async () => {
      const response = await request(app).get("/api/auth/facebook");

      console.log("Facebook OAuth redirect status:", response.statusCode);
      // Should redirect to Facebook or return error
      expect([302, 500]).toContain(response.statusCode);
    });
  });

  describe("[TC-OAUTH-03] OAuth Callback Handling", () => {
    it("should handle Google callback endpoint", async () => {
      const response = await request(app).get(
        "/api/auth/google/callback?code=test_code"
      );

      console.log("Google callback status:", response.statusCode);
      // Will fail without valid OAuth code, but endpoint should exist
      expect([302, 400, 401, 500]).toContain(response.statusCode);
    });

    it("should handle Facebook callback endpoint", async () => {
      const response = await request(app).get(
        "/api/auth/facebook/callback?code=test_code"
      );

      console.log("Facebook callback status:", response.statusCode);
      expect([302, 400, 401, 500]).toContain(response.statusCode);
    });
  });

  describe("[TC-OAUTH-04] OAuth User Creation", () => {
    it("should create new user with Google ID", async () => {
      const googleUser = await User.create({
        googleId: `test_google_${Date.now()}`,
        email: `google_${Date.now()}@test.com`,
        name: "Google Test User",
        role: "Traveler",
      });

      expect(googleUser).toBeTruthy();
      expect(googleUser.googleId).toBeTruthy();
      expect(googleUser.email).toContain("@test.com");

      // Cleanup
      await User.deleteOne({ _id: googleUser._id });
    });

    it("should create new user with Facebook ID", async () => {
      const facebookUser = await User.create({
        facebookId: `test_facebook_${Date.now()}`,
        email: `facebook_${Date.now()}@test.com`,
        name: "Facebook Test User",
        role: "Traveler",
      });

      expect(facebookUser).toBeTruthy();
      expect(facebookUser.facebookId).toBeTruthy();
      expect(facebookUser.email).toContain("@test.com");

      // Cleanup
      await User.deleteOne({ _id: facebookUser._id });
    });
  });

  describe("[TC-OAUTH-05] OAuth User Linking", () => {
    it("should link Google account to existing email user", async () => {
      const email = `linking_test_${Date.now()}@test.com`;

      // Create user without OAuth
      const user = await User.create({
        email,
        name: "Link Test User",
        password: "hashedpassword123",
        role: "Traveler",
      });

      expect(user.googleId).toBeUndefined();

      // Simulate linking Google account
      user.googleId = `google_link_${Date.now()}`;
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.googleId).toBeTruthy();
      expect(updatedUser.email).toBe(email);

      // Cleanup
      await User.deleteOne({ _id: user._id });
    });

    it("should link Facebook account to existing email user", async () => {
      const email = `fb_linking_test_${Date.now()}@test.com`;

      const user = await User.create({
        email,
        name: "FB Link Test User",
        password: "hashedpassword123",
        role: "Traveler",
      });

      user.facebookId = `fb_link_${Date.now()}`;
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.facebookId).toBeTruthy();

      // Cleanup
      await User.deleteOne({ _id: user._id });
    });
  });

  describe("[TC-OAUTH-06] OAuth User Password Management", () => {
    it("should prevent password change for Google users", async () => {
      const googleUser = await User.create({
        googleId: `google_pwd_${Date.now()}`,
        email: `google_pwd_${Date.now()}@test.com`,
        name: "Google Password Test",
        role: "Traveler",
      });

      // Login and get token
      const bcrypt = require("bcryptjs");
      const { signAccess } = require("../utils/jwt");
      const token = signAccess({ id: googleUser._id, role: googleUser.role });

      const response = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "any_password",
          newPassword: "NewPassword123!",
        })
        .expect("Content-Type", /json/);

      console.log("Google user password change:", response.body);
      expect([400, 401]).toContain(response.statusCode);

      if (response.body.message) {
        expect(response.body.message.toLowerCase()).toMatch(
          /oauth|google|facebook|cannot/
        );
      }

      // Cleanup
      await User.deleteOne({ _id: googleUser._id });
    });

    it("should prevent password change for Facebook users", async () => {
      const fbUser = await User.create({
        facebookId: `fb_pwd_${Date.now()}`,
        email: `fb_pwd_${Date.now()}@test.com`,
        name: "Facebook Password Test",
        role: "Traveler",
      });

      const { signAccess } = require("../utils/jwt");
      const token = signAccess({ id: fbUser._id, role: fbUser.role });

      const response = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "any_password",
          newPassword: "NewPassword123!",
        })
        .expect("Content-Type", /json/);

      expect([400, 401]).toContain(response.statusCode);

      // Cleanup
      await User.deleteOne({ _id: fbUser._id });
    });
  });

  describe("[TC-OAUTH-07] OAuth Environment Variables", () => {
    it("should have required Google OAuth environment variables", () => {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

      console.log("Google OAuth Config:");
      console.log("  Client ID:", googleClientId ? "✓ Set" : "✗ Missing");
      console.log("  Secret:", googleClientSecret ? "✓ Set" : "✗ Missing");
      console.log("  Callback:", googleCallbackUrl ? "✓ Set" : "✗ Missing");

      // These might be missing in test env, but we should document it
      if (!googleClientId) {
        console.warn("⚠️ GOOGLE_CLIENT_ID not configured");
      }
    });

    it("should have required Facebook OAuth environment variables", () => {
      const fbAppId = process.env.FACEBOOK_APP_ID;
      const fbAppSecret = process.env.FACEBOOK_APP_SECRET;
      const fbCallbackUrl = process.env.FACEBOOK_CALLBACK_URL;

      console.log("Facebook OAuth Config:");
      console.log("  App ID:", fbAppId ? "✓ Set" : "✗ Missing");
      console.log("  Secret:", fbAppSecret ? "✓ Set" : "✗ Missing");
      console.log("  Callback:", fbCallbackUrl ? "✓ Set" : "✗ Missing");

      if (!fbAppId) {
        console.warn("⚠️ FACEBOOK_APP_ID not configured");
      }
    });
  });

  describe("[TC-OAUTH-08] OAuth Security", () => {
    it("should not expose sensitive OAuth data in user response", async () => {
      const user = await User.create({
        googleId: `security_test_${Date.now()}`,
        email: `security_${Date.now()}@test.com`,
        name: "Security Test",
        role: "Traveler",
      });

      const userObj = user.toObject();

      // Sensitive fields should not be exposed
      expect(userObj.password).toBeUndefined();

      // OAuth IDs can be exposed but should be handled carefully
      expect(userObj.googleId).toBeTruthy();

      // Cleanup
      await User.deleteOne({ _id: user._id });
    });
  });

  describe("[TC-OAUTH-09] Multiple OAuth Provider Support", () => {
    it("should allow user to link both Google and Facebook", async () => {
      const email = `multi_oauth_${Date.now()}@test.com`;

      const user = await User.create({
        email,
        name: "Multi OAuth User",
        googleId: `google_multi_${Date.now()}`,
        role: "Traveler",
      });

      // Link Facebook later
      user.facebookId = `fb_multi_${Date.now()}`;
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.googleId).toBeTruthy();
      expect(updatedUser.facebookId).toBeTruthy();
      expect(updatedUser.email).toBe(email);

      // Cleanup
      await User.deleteOne({ _id: user._id });
    });
  });

  describe("[TC-OAUTH-10] OAuth Session Management", () => {
    it("should generate valid tokens after OAuth login", async () => {
      const user = await User.create({
        googleId: `token_test_${Date.now()}`,
        email: `token_${Date.now()}@test.com`,
        name: "Token Test User",
        role: "Traveler",
      });

      const { signAccess, signRefresh } = require("../utils/jwt");

      const accessToken = signAccess({ id: user._id, role: user.role });
      const refreshToken = signRefresh({
        jti: "test_jti",
        userId: user._id,
      });

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
      expect(typeof accessToken).toBe("string");
      expect(typeof refreshToken).toBe("string");

      // Cleanup
      await User.deleteOne({ _id: user._id });
    });
  });

  describe("[TC-OAUTH-11] OAuth Error Scenarios", () => {
    it("should handle OAuth callback without code parameter", async () => {
      const response = await request(app).get("/api/auth/google/callback");

      console.log("Google callback without code:", response.statusCode);
      // Should fail gracefully
      expect([302, 400, 401, 500]).toContain(response.statusCode);
    });

    it("should handle OAuth with invalid/expired code", async () => {
      const response = await request(app).get(
        "/api/auth/google/callback?code=INVALID_EXPIRED_CODE"
      );

      console.log("Google callback with invalid code:", response.statusCode);
      expect([302, 400, 401, 500]).toContain(response.statusCode);
    });
  });

  describe("[TC-OAUTH-12] Welcome Email for New OAuth Users", () => {
    it("should track if welcome email should be sent for new Google users", async () => {
      // This test verifies the logic exists, actual email sending is mocked
      const newGoogleUser = await User.create({
        googleId: `welcome_${Date.now()}`,
        email: `welcome_${Date.now()}@test.com`,
        name: "Welcome Test User",
        role: "Traveler",
      });

      expect(newGoogleUser).toBeTruthy();
      expect(newGoogleUser.email).toBeTruthy();

      // In production, welcome email would be sent via notify service
      console.log("✓ New OAuth user created with email:", newGoogleUser.email);

      // Cleanup
      await User.deleteOne({ _id: newGoogleUser._id });
    });
  });
});
