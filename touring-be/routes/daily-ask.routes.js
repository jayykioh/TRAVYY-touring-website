const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');
const DailyQuestion = require('../models/DailyQuestion');
const DailyAskAnswer = require('../models/DailyAskAnswer');
const UserProfile = require('../models/UserProfile');

/**
 * GET /api/daily-ask/question
 * Get daily question for user
 */
router.get('/question', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // ✅ FIX: Use req.userId from middleware

    // Check if user already answered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const answeredToday = await DailyAskAnswer.findOne({
      userId,
      answeredAt: { $gte: today }
    });

    if (answeredToday) {
      console.log(`✅ [DailyAsk] User ${userId} already answered today`);
      return res.json({
        alreadyAnswered: true, // ✅ Match frontend field name
        message: 'You have already answered today. Come back tomorrow!'
      });
    }

    // Get user profile to target appropriate questions
    const profile = await UserProfile.findOne({ userId });
    const confidence = profile?.confidence || 0;

    // Find suitable question
    const question = await DailyQuestion.findOne({
      active: true,
      'targetConfidence.min': { $lte: confidence },
      'targetConfidence.max': { $gte: confidence }
    }).sort({ priority: 1 });

    if (!question) {
      console.log(`⚠️ [DailyAsk] No questions available for user ${userId}`);
      return res.json({
        alreadyAnswered: false,
        questionId: null,
        questionText: 'Không có câu hỏi nào khả dụng',
        vibes: []
      });
    }

    console.log(`❓ [DailyAsk] Serving question to user ${userId}:`, {
      questionId: question.id,
      type: question.type
    });

    // ✅ Match frontend expected format
    res.json({
      alreadyAnswered: false,
      questionId: question.id,
      questionText: question.text,
      vibes: question.options || [], // Options become vibes for selection
      questionType: question.type
    });

  } catch (error) {
    console.error('❌ [DailyAsk] get question error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/daily-ask/answer
 * Submit answer to daily question
 */
router.post('/answer', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // ✅ FIX: Use req.userId from middleware
    const { questionId, selectedVibes } = req.body; // ✅ Match frontend field name

    if (!questionId || !selectedVibes || !Array.isArray(selectedVibes)) {
      return res.status(400).json({ 
        error: 'questionId and selectedVibes (array) are required' 
      });
    }

    console.log(`📤 [DailyAsk] Saving answer from user ${userId}:`, {
      questionId,
      vibes: selectedVibes
    });

    // Get question details
    const question = await DailyQuestion.findOne({ id: questionId });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Save answer
    const dailyAnswer = new DailyAskAnswer({
      userId,
      questionId,
      questionText: question.text,
      questionType: question.type,
      answer: selectedVibes.join(', '), // Store as comma-separated string
      vibesSelected: selectedVibes,
      answeredAt: new Date()
    });

    await dailyAnswer.save();

    // Update user profile (increment interactions, set lastSyncedAt for next cron)
    await UserProfile.findOneAndUpdate(
      { userId },
      {
        $inc: { totalInteractions: question.weight || 2 }, // Daily ask has ×2.0 weight
        $set: { lastSyncedAt: new Date() }
      },
      { upsert: true }
    );

    console.log(`✅ [DailyAsk] Answer saved for user ${userId}, weight: ${question.weight || 2}`);

    res.json({
      success: true,
      message: 'Answer saved! Your preferences have been updated.',
      weight: question.weight || 2
    });

  } catch (error) {
    console.error('❌ [DailyAsk] answer error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/daily-ask/history
 * Get user's answer history
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // ✅ FIX: Use req.userId from middleware
    const { limit = 30 } = req.query;

    console.log(`📜 [DailyAsk] Fetching history for user ${userId}`);

    const history = await DailyAskAnswer.find({ userId })
      .sort({ answeredAt: -1 })
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ [DailyAsk] Found ${history.length} answers`);

    res.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('❌ [DailyAsk] history error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
