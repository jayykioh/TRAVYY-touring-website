const mongoose = require('mongoose');

const DailyAskAnswerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  questionId: {
    type: String,
    required: true
  },
  
  questionText: {
    type: String,
    required: true
  },
  
  questionType: {
    type: String,
    enum: ['vibes', 'activity', 'duration', 'budget', 'exploration', 'region', 'season'],
    required: true
  },
  
  // Answer can be string, array, or object
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // If question type is vibes, store selected vibes
  vibesSelected: [String],
  
  // Metadata
  answeredAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index
DailyAskAnswerSchema.index({ userId: 1, answeredAt: -1 });
DailyAskAnswerSchema.index({ userId: 1, questionId: 1 });

// Prevent duplicate answer on same day
DailyAskAnswerSchema.index(
  { userId: 1, questionId: 1, answeredAt: 1 },
  { unique: true, partialFilterExpression: { answeredAt: { $exists: true } } }
);

module.exports = mongoose.model('DailyAskAnswer', DailyAskAnswerSchema);
