/**
 * Seed Daily Ask Questions
 * Run: node seed-daily-ask.js
 * 
 * This creates sample questions for the Daily Ask feature
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DailyQuestion = require('./models/DailyQuestion');

// Sample questions
const questions = [
  {
    id: 'daily_vibes_1',
    text: 'Hôm nay bạn muốn trải nghiệm loại tour nào?',
    type: 'vibes',
    options: [
      'Thư giãn',
      'Phiêu lưu',
      'Văn hóa',
      'Ẩm thực',
      'Thiên nhiên',
      'Lịch sử',
      'Mạo hiểm',
      'Tâm linh',
      'Nghệ thuật'
    ],
    weight: 2, // ×2.0 for AI matching
    active: true,
    frequency: 'daily',
    targetConfidence: { min: 0, max: 1 },
    priority: 1
  },
  {
    id: 'daily_activity_1',
    text: 'Bạn thích hoạt động nào trong chuyến đi?',
    type: 'activity',
    options: [
      'Leo núi',
      'Tắm biển',
      'Thăm bảo tàng',
      'Chụp ảnh',
      'Thử món ăn địa phương',
      'Khám phá chợ đêm',
      'Nghỉ dưỡng spa',
      'Tham gia lễ hội',
      'Du thuyền'
    ],
    weight: 2,
    active: true,
    frequency: 'weekly',
    targetConfidence: { min: 0, max: 1 },
    priority: 2
  },
  {
    id: 'daily_region_1',
    text: 'Bạn muốn khám phá vùng miền nào?',
    type: 'region',
    options: [
      'Miền Bắc',
      'Miền Trung',
      'Miền Nam',
      'Tây Bắc',
      'Tây Nguyên',
      'Đông Bắc',
      'Đồng bằng sông Cửu Long',
      'Duyên hải miền Trung'
    ],
    weight: 2,
    active: true,
    frequency: 'weekly',
    targetConfidence: { min: 0, max: 1 },
    priority: 3
  },
  {
    id: 'daily_season_1',
    text: 'Thời điểm nào bạn thích đi du lịch nhất?',
    type: 'season',
    options: [
      'Mùa xuân (Feb-Apr)',
      'Mùa hè (May-Jul)',
      'Mùa thu (Aug-Oct)',
      'Mùa đông (Nov-Jan)',
      'Tết Nguyên Đán',
      'Lễ 30/4',
      'Lễ 2/9'
    ],
    weight: 1.5,
    active: true,
    frequency: 'weekly',
    targetConfidence: { min: 0, max: 1 },
    priority: 4
  },
  {
    id: 'daily_budget_1',
    text: 'Mức ngân sách bạn dự định cho chuyến đi?',
    type: 'budget',
    options: [
      'Dưới 2 triệu',
      '2-5 triệu',
      '5-10 triệu',
      '10-20 triệu',
      'Trên 20 triệu'
    ],
    weight: 1.5,
    active: true,
    frequency: 'weekly',
    targetConfidence: { min: 0.3, max: 1 },
    priority: 5
  }
];

async function seedQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing questions (optional - comment out if you want to keep old ones)
    // await DailyQuestion.deleteMany({});
    // console.log('🗑️  Cleared existing questions');

    // Insert questions (upsert by id)
    for (const q of questions) {
      await DailyQuestion.findOneAndUpdate(
        { id: q.id },
        q,
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded: ${q.id} - "${q.text}"`);
    }

    console.log(`\n🎉 Successfully seeded ${questions.length} questions!`);
    console.log('\n📋 Summary:');
    console.log(`   - Vibes questions: ${questions.filter(q => q.type === 'vibes').length}`);
    console.log(`   - Activity questions: ${questions.filter(q => q.type === 'activity').length}`);
    console.log(`   - Region questions: ${questions.filter(q => q.type === 'region').length}`);
    console.log(`   - Season questions: ${questions.filter(q => q.type === 'season').length}`);
    console.log(`   - Budget questions: ${questions.filter(q => q.type === 'budget').length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedQuestions();
