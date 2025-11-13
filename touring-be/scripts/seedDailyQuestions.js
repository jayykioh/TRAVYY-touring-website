const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const DailyQuestion = require('../models/DailyQuestion');

/**
 * Seed initial daily questions
 */
async function seedDailyQuestions() {
  console.log('🌱 [Seed] Seeding daily questions...');

  const questions = [
    {
      id: 'q1_vibes_preference',
      text: 'Hôm nay bạn muốn trải nghiệm gì?',
      type: 'vibes',
      options: ['Biển', 'Núi', 'Thành phố', 'Ẩm thực', 'Lịch sử', 'Thiên nhiên'],
      weight: 2,
      targetConfidence: { min: 0, max: 1 },
      active: true,
      frequency: 'weekly',
      priority: 1
    },
    {
      id: 'q2_activity_style',
      text: 'Bạn thích phong cách du lịch nào?',
      type: 'activity',
      options: ['Nghỉ ngơi, thư giãn', 'Khám phá, mạo hiểm', 'Chụp ảnh, check-in', 'Ẩm thực, trải nghiệm'],
      weight: 2,
      targetConfidence: { min: 0, max: 0.5 },
      active: true,
      frequency: 'once',
      priority: 2
    },
    {
      id: 'q3_duration',
      text: 'Bạn thường đi du lịch trong bao lâu?',
      type: 'duration',
      options: ['1 ngày', '2-3 ngày', '4-7 ngày', 'Trên 1 tuần'],
      weight: 1,
      targetConfidence: { min: 0, max: 0.3 },
      active: true,
      frequency: 'once',
      priority: 3
    },
    {
      id: 'q4_budget',
      text: 'Ngân sách dự kiến của bạn?',
      type: 'budget',
      options: ['Tiết kiệm (< 3 triệu)', 'Trung bình (3-7 triệu)', 'Cao cấp (> 7 triệu)'],
      weight: 1.5,
      targetConfidence: { min: 0, max: 0.5 },
      active: true,
      frequency: 'once',
      priority: 4
    },
    {
      id: 'q5_exploration',
      text: 'Bạn có muốn thử trải nghiệm mới hôm nay không?',
      type: 'exploration',
      options: ['Có, muốn khám phá điều mới', 'Không, thích những gì quen thuộc'],
      weight: 1,
      targetConfidence: { min: 0.3, max: 1 },
      active: true,
      frequency: 'weekly',
      priority: 5
    },
    {
      id: 'q6_region',
      text: 'Vùng miền nào bạn quan tâm nhất?',
      type: 'region',
      options: ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tất cả đều OK'],
      weight: 1.5,
      targetConfidence: { min: 0, max: 0.5 },
      active: true,
      frequency: 'once',
      priority: 6
    },
    {
      id: 'q7_season',
      text: 'Bạn thích đi du lịch vào mùa nào?',
      type: 'season',
      options: ['Mùa hè (biển)', 'Mùa thu (mát mẻ)', 'Mùa đông (lạnh)', 'Mùa xuân (ấm áp)'],
      weight: 1,
      targetConfidence: { min: 0, max: 0.3 },
      active: true,
      frequency: 'once',
      priority: 7
    }
  ];

  for (const q of questions) {
    await DailyQuestion.findOneAndUpdate(
      { id: q.id },
      q,
      { upsert: true }
    );
  }

  console.log(`✅ [Seed] Seeded ${questions.length} daily questions`);
}

// Run if called directly
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('✅ MongoDB connected');
      await seedDailyQuestions();
      await mongoose.connection.close();
      console.log('✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { seedDailyQuestions };
