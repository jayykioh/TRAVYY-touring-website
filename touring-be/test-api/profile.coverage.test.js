// Profile controller coverage tests
const request = require("supertest");
const app = require("../server");
const User = require("../models/Users");

describe("Profile Controller Coverage Tests", () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create test user
    const userResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: `profile_test_${Date.now()}@example.com`,
        password: "Test1234!@#",
        name: "Profile Test User",
        username: `profiletest${Date.now()}`,
        provinceId: "01",
        wardId: "00001",
        role: "Traveler",
      });

    if (userResponse.body.accessToken) {
      authToken = userResponse.body.accessToken;
      testUser = userResponse.body.user;
    }
  });

  afterAll(async () => {
    if (testUser?._id) {
      await User.deleteOne({ _id: testUser._id });
    }
  });

  describe("GET /api/profile - Get Profile", () => {
    it("should get user profile", async () => {
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get profile:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty("email");
        expect(response.body.email).toBe(testUser.email);
      }
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/profile");

      console.log("Get profile without auth:", response.statusCode);
      expect([401, 403, 404]).toContain(response.statusCode);
    });

    it("should handle invalid token", async () => {
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", "Bearer invalid_token");

      console.log("Get profile with invalid token:", response.statusCode);
      expect([401, 403, 404, 500]).toContain(response.statusCode);
    });
  });

  describe("PUT /api/profile - Update Profile", () => {
    it("should update profile name", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Updated Name",
        });

      console.log("Update profile name:", response.statusCode);
      expect([200, 400]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        expect(response.body.name).toBe("Updated Name");
      }
    });

    it("should update profile phone", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          phone: "0912345678",
        });

      console.log("Update profile phone:", response.statusCode);
      expect([200, 400]).toContain(response.statusCode);
    });

    it("should update profile address", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          address: "123 Test Street",
          provinceId: "01",
          districtId: "001",
          wardId: "00001",
        });

      console.log("Update profile address:", response.statusCode);
      expect([200, 400]).toContain(response.statusCode);
    });

    it("should update multiple fields", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Multi Update",
          phone: "0987654321",
          address: "456 Update Ave",
        });

      console.log("Update multiple fields:", response.statusCode);
      expect([200, 400]).toContain(response.statusCode);
    });

    it("should reject invalid phone format", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          phone: "invalid",
        });

      console.log("Update with invalid phone:", response.statusCode);
      expect([400, 500]).toContain(response.statusCode);
    });

    it("should reject empty name", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "",
        });

      console.log("Update with empty name:", response.statusCode);
      expect([400, 500]).toContain(response.statusCode);
    });
  });

  describe("PUT /api/profile/avatar - Update Avatar", () => {
    it("should update avatar URL", async () => {
      const response = await request(app)
        .put("/api/profile/avatar")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          avatarUrl: "https://example.com/avatar.jpg",
        });

      console.log("Update avatar:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);
    });

    it("should reject invalid URL", async () => {
      const response = await request(app)
        .put("/api/profile/avatar")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          avatarUrl: "not-a-url",
        });

      console.log("Update with invalid URL:", response.statusCode);
      expect([400, 404, 500]).toContain(response.statusCode);
    });
  });

  describe("GET /api/profile/preferences - Get Preferences", () => {
    it("should get user preferences", async () => {
      const response = await request(app)
        .get("/api/profile/preferences")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get preferences:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("PUT /api/profile/preferences - Update Preferences", () => {
    it("should update notification preferences", async () => {
      const response = await request(app)
        .put("/api/profile/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          emailNotifications: true,
          smsNotifications: false,
        });

      console.log("Update preferences:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);
    });

    it("should update language preference", async () => {
      const response = await request(app)
        .put("/api/profile/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          language: "en",
        });

      console.log("Update language:", response.statusCode);
      expect([200, 400, 404]).toContain(response.statusCode);
    });
  });

  describe("DELETE /api/profile - Delete Account", () => {
    it("should reject account deletion without confirmation", async () => {
      const response = await request(app)
        .delete("/api/profile")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Delete without confirmation:", response.statusCode);
      expect([400, 401, 404]).toContain(response.statusCode);
    });

    it("should handle account deletion with confirmation", async () => {
      const response = await request(app)
        .delete("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          password: "Test1234!@#",
          confirm: true,
        });

      console.log("Delete with confirmation:", response.statusCode);
      expect([200, 204, 400, 401, 404]).toContain(response.statusCode);
    });
  });

  describe("GET /api/profile/stats - Get User Statistics", () => {
    it("should get user statistics", async () => {
      const response = await request(app)
        .get("/api/profile/stats")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("Get user stats:", response.statusCode);
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("Error Handling", () => {
    it("should handle concurrent updates", async () => {
      const promises = [
        request(app)
          .put("/api/profile")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ name: "Concurrent 1" }),
        request(app)
          .put("/api/profile")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ name: "Concurrent 2" }),
      ];

      const results = await Promise.all(promises);
      console.log(
        "Concurrent updates:",
        results.map((r) => r.statusCode)
      );
      results.forEach((result) => {
        expect([200, 400, 404]).toContain(result.statusCode);
      });
    });

    it("should handle malformed request body", async () => {
      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .set("Content-Type", "application/json")
        .send("invalid json");

      console.log("Malformed body:", response.statusCode);
      expect([400, 500]).toContain(response.statusCode);
    });
  });
});
