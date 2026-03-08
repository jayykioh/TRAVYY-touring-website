// scripts/seed-tour-guides.js
// Script to create tour guides for each zone/province

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const Guide = require("../models/guide/Guide");
const Zone = require("../models/Zones");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/travelApp";

// Vietnamese names for guides
const firstNames = ["An", "Bình", "Cường", "Dũng", "Đức", "Giang", "Hà", "Hải", "Hùng", "Hương", "Khánh", "Linh", "Long", "Mai", "Minh", "Nam", "Nga", "Ngọc", "Phong", "Phương", "Quân", "Sơn", "Thảo", "Thành", "Thương", "Tiến", "Trâm", "Trang", "Tuấn", "Tú", "Vân", "Việt", "Yến"];
const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];

// Experience levels
const experiences = ["2 năm", "3 năm", "5 năm", "7 năm", "10 năm", "15 năm"];

// Specialties by type
const specialties = [
  "Tour Thiên nhiên",
  "Tour Văn hóa",
  "Tour Ẩm thực",
  "Tour Lịch sử",
  "Tour Phiêu lưu",
  "Tour Nghỉ dưỡng",
  "Tour Nhiếp ảnh",
  "Tour Gia đình",
  "Tour Sinh thái",
  "Tour Tâm linh"
];

// Languages
const languageSets = [
  ["Tiếng Việt", "English"],
  ["Tiếng Việt", "English", "中文"],
  ["Tiếng Việt", "English", "日本語"],
  ["Tiếng Việt", "English", "한국어"],
  ["Tiếng Việt", "Français"],
  ["Tiếng Việt"],
];

// Bio templates
const bioTemplates = [
  (name, province, years) => `Xin chào! Tôi là ${name}, hướng dẫn viên du lịch ${province} với ${years} kinh nghiệm. Tôi yêu thích việc chia sẻ vẻ đẹp và văn hóa địa phương với du khách từ khắp nơi trên thế giới.`,
  (name, province, years) => `Chào mừng đến với ${province}! Tôi là ${name}, đã làm hướng dẫn viên ${years}. Niềm đam mê của tôi là giúp du khách khám phá những điểm đến tuyệt vời và trải nghiệm văn hóa độc đáo của vùng đất này.`,
  (name, province, years) => `${name} - HDV chuyên nghiệp tại ${province} với ${years} kinh nghiệm. Tôi cam kết mang đến cho bạn những chuyến đi an toàn, thú vị và đáng nhớ nhất!`,
  (name, province, years) => `Tôi là ${name}, người ${province} sinh ra và lớn lên tại đây. Với ${years} kinh nghiệm làm HDV, tôi biết mọi ngóc ngách đẹp nhất của vùng này để chia sẻ với bạn.`,
];

// Certificate templates
const certificates = [
  { name: "Giấy phép Hướng dẫn viên Du lịch", issuer: "Bộ Văn hóa, Thể thao và Du lịch" },
  { name: "Chứng chỉ An toàn Du lịch", issuer: "Tổng cục Du lịch Việt Nam" },
  { name: "Chứng chỉ Sơ cấp cứu", issuer: "Hội Chữ thập đỏ Việt Nam" },
  { name: "Chứng chỉ Tiếng Anh Du lịch", issuer: "British Council" },
];

// Generate random items from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr, min = 2, max = 4) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate guide name
function generateGuideName() {
  return `${randomItem(lastNames)} ${randomItem(firstNames)}`;
}

// Generate phone number
function generatePhone() {
  const prefixes = ["09", "03", "07", "08", "05"];
  const prefix = randomItem(prefixes);
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${number}`;
}

// Generate email from name
function generateEmail(name, index) {
  const cleanName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
  return `${cleanName}${index}@tourguide.vn`;
}

// Generate license number
function generateLicenseNumber(province, index) {
  const provinceCode = province.substring(0, 2).toUpperCase();
  const number = String(index).padStart(6, "0");
  return `HDV-${provinceCode}-${number}`;
}

// Generate certificate with dates
function generateCertificate(cert, issueYearsAgo = 2) {
  const issueDate = new Date();
  issueDate.setFullYear(issueDate.getFullYear() - issueYearsAgo);

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 3);

  // Create dummy base64 certificate (1x1 transparent PNG)
  const dummyPNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  return {
    name: cert.name,
    issuer: cert.issuer,
    issueDate,
    expiryDate,
    documentUrl: dummyPNG,
    verified: Math.random() > 0.3, // 70% verified
  };
}

async function seedTourGuides() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all active zones
    const zones = await Zone.find({ isActive: true }).select("name province id");
    console.log(`📍 Found ${zones.length} zones`);

    if (zones.length === 0) {
      console.log("❌ No zones found. Please seed zones first.");
      process.exit(0);
    }

    // Group zones by province
    const provinceZones = {};
    zones.forEach(zone => {
      const province = zone.province || zone.name;
      if (!provinceZones[province]) {
        provinceZones[province] = [];
      }
      provinceZones[province].push(zone);
    });

    console.log(`🗺️  Found ${Object.keys(provinceZones).length} provinces`);

    const guideCredentials = []; // Store credentials to print
    let totalCreated = 0;

    // Create 2-3 guides per province
    for (const [province, provinceZoneList] of Object.entries(provinceZones)) {
      const guidesCount = Math.floor(Math.random() * 2) + 2; // 2-3 guides
      console.log(`\n📍 Creating ${guidesCount} guides for ${province}...`);

      for (let i = 0; i < guidesCount; i++) {
        const name = generateGuideName();
        const email = generateEmail(name, totalCreated + 1);
        const phone = generatePhone();
        const password = process.env.DEFAULT_GUIDE_PASSWORD || "your_default_guide_password"; // Default password from .env
        const experience = randomItem(experiences);
        const languages = randomItem(languageSets);
        const guideSpecialties = randomItems(specialties, 2, 4);

        // Coverage areas - this province + maybe nearby
        const coverageAreas = [province];
        if (Math.random() > 0.5 && provinceZoneList.length > 1) {
          coverageAreas.push(...randomItems(provinceZoneList.map(z => z.name), 1, 2));
        }

        const bio = randomItem(bioTemplates)(name, province, experience);

        try {
          // Check if user exists
          let user = await User.findOne({ email });

          if (!user) {
            // Create user account
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
              name,
              email,
              password: hashedPassword,
              phone,
              role: "TourGuide", // Fixed: Use correct enum value
              isVerified: true,
              location: {
                addressLine: province,
              },
            });
            console.log(`  ✅ Created user: ${email}`);
          } else {
            console.log(`  ℹ️  User exists: ${email}`);
          }

          // Check if guide profile exists
          let guide = await Guide.findOne({ userId: user._id });

          if (!guide) {
            // Generate certificates
            const guideCertificates = [
              generateCertificate(certificates[0], Math.floor(Math.random() * 3) + 1),
              generateCertificate(certificates[1], Math.floor(Math.random() * 2) + 1),
            ];

            // 50% chance to have additional certificates
            if (Math.random() > 0.5) {
              guideCertificates.push(generateCertificate(certificates[2], 1));
            }
            if (Math.random() > 0.7) {
              guideCertificates.push(generateCertificate(certificates[3], 1));
            }

            // Create guide profile
            guide = await Guide.create({
              guideId: `guide-${Date.now()}-${i}`,
              userId: user._id,
              name,
              email,
              phone,
              location: province,
              provinceId: String(Math.floor(Math.random() * 63) + 1), // Random province ID 1-63
              coverageAreas,
              bio,
              experience,
              languages,
              specialties: guideSpecialties,
              licenseNumber: generateLicenseNumber(province, totalCreated + 1),
              licenseVerified: Math.random() > 0.2, // 80% verified
              certifications: guideCertificates,
              rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 - 5.0
              totalTours: Math.floor(Math.random() * 100) + 10, // 10-110 tours
              toursConducted: Math.floor(Math.random() * 100) + 10,
              availability: randomItem(["Available", "Available", "Available", "Busy"]), // 75% available
              joinedDate: new Date(Date.now() - Math.random() * 365 * 3 * 24 * 60 * 60 * 1000), // Random within 3 years
              profileComplete: true,
              isVerified: Math.random() > 0.3, // 70% verified
              verificationStatus: Math.random() > 0.3 ? "approved" : Math.random() > 0.5 ? "pending" : "incomplete",
            });

            // Check profile completeness
            guide.checkProfileComplete();
            await guide.save();

            console.log(`  ✅ Created guide: ${name} (${email})`);
            totalCreated++;

            // Store credentials
            guideCredentials.push({
              name,
              email,
              password,
              phone,
              province,
              licenseNumber: guide.licenseNumber,
              verified: guide.isVerified,
              status: guide.verificationStatus,
            });
          } else {
            console.log(`  ℹ️  Guide exists: ${name}`);
          }

        } catch (err) {
          console.error(`  ❌ Error creating guide ${name}:`, err.message);
        }
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("🎉 TOUR GUIDE SEEDING COMPLETE!");
    console.log("=".repeat(80));
    console.log(`✅ Total guides created: ${totalCreated}`);
    console.log(`📧 Total accounts: ${guideCredentials.length}`);

    console.log("\n" + "=".repeat(80));
    console.log("🔐 GUIDE LOGIN CREDENTIALS");
    console.log("=".repeat(80));

    // Group by province for display
    const credsByProvince = {};
    guideCredentials.forEach(cred => {
      if (!credsByProvince[cred.province]) {
        credsByProvince[cred.province] = [];
      }
      credsByProvince[cred.province].push(cred);
    });

    // Print credentials by province
    for (const [province, creds] of Object.entries(credsByProvince)) {
      console.log(`\n📍 ${province.toUpperCase()}`);
      console.log("-".repeat(80));
      creds.forEach((cred, idx) => {
        console.log(`${idx + 1}. ${cred.name}`);
        console.log(`   Email: ${cred.email}`);
        console.log(`   Password: ${cred.password}`);
        console.log(`   Phone: ${cred.phone}`);
        console.log(`   License: ${cred.licenseNumber}`);
        console.log(`   Status: ${cred.verified ? "✅ Verified" : "⏳ " + cred.status}`);
        console.log("");
      });
    }

    console.log("\n" + "=".repeat(80));
    console.log("💡 NOTES:");
    console.log(`- All guides have default password: ${process.env.DEFAULT_GUIDE_PASSWORD || "Guide@123"}`);
    console.log("- Guides can login at: http://localhost:5173/login");
    console.log("- Each guide has 2-4 certificates uploaded");
    console.log("- ~70% of guides are verified and approved");
    console.log("- ~75% of guides are currently available");
    console.log("=".repeat(80));

    // Save credentials to file
    const fs = require("fs");
    const outputPath = path.join(__dirname, "guide-credentials.json");
    fs.writeFileSync(outputPath, JSON.stringify({ guides: guideCredentials }, null, 2));
    console.log(`\n💾 Credentials saved to: ${outputPath}`);

    // Also create a simple text file
    const txtPath = path.join(__dirname, "guide-credentials.txt");
    let txtContent = "TOUR GUIDE CREDENTIALS\n";
    txtContent += "=".repeat(80) + "\n\n";

    for (const [province, creds] of Object.entries(credsByProvince)) {
      txtContent += `📍 ${province}\n`;
      txtContent += "-".repeat(80) + "\n";
      creds.forEach((cred, idx) => {
        txtContent += `${idx + 1}. ${cred.name}\n`;
        txtContent += `   Email: ${cred.email}\n`;
        txtContent += `   Password: ${cred.password}\n`;
        txtContent += `   Phone: ${cred.phone}\n`;
        txtContent += `   License: ${cred.licenseNumber}\n`;
        txtContent += `   Status: ${cred.verified ? "Verified" : cred.status}\n\n`;
      });
      txtContent += "\n";
    }

    fs.writeFileSync(txtPath, txtContent);
    console.log(`📄 Text file saved to: ${txtPath}\n`);

  } catch (error) {
    console.error("❌ Error seeding tour guides:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Run the seeder
seedTourGuides();
