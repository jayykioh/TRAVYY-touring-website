const mongoose = require('mongoose');

const DailyQuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  text: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['vibes', 'activity', 'duration', 'budget', 'exploration', 'region', 'season'],
    required: true
  },
  
  // For multiple choice questions
  options: [String],
  
  // Weight for profile calculation
  weight: {
    type: Number,
    default: 1,
    min: 0,
    max: 3
  },
  
  // For targeting specific user profiles
  targetConfidence: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 1 }
  },
  
  // Active status
  active: {
    type: Boolean,
    default: true
  },
  
  // Display frequency
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'once'],
    default: 'weekly'
  },
  
  // Order priority (lower = shown first)
  priority: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

// Index for queries
DailyQuestionSchema.index({ active: 1, priority: 1 });

module.exports = mongoose.model('DailyQuestion', DailyQuestionSchema);
