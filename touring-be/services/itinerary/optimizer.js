const {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || "";
const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

// ✅ Correct initialization
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/** Build prompt */
function buildItineraryPrompt(itinerary, tripData) {
  const { zoneName, items = [], preferences = {} } = itinerary || {};
  const trip = tripData?.trips?.[0] || tripData || {};
  const distanceKm = trip?.distance
    ? (trip.distance / 1000).toFixed(1)
    : itinerary?.totalDistance ?? 0;
  const durationMin = trip?.duration
    ? Math.round(trip.duration / 60)
    : itinerary?.totalDuration ?? 0;
  const bestTime = preferences.bestTime || "anytime";
  const vibes = Array.isArray(preferences.vibes)
    ? preferences.vibes.join(", ")
    : "sightseeing";
  const names = items
    .slice(0, 5)
    .map((i, idx) => `${idx + 1}. ${i.name}`)
    .join(", ");

  return `Bạn là hướng dẫn viên du lịch Việt Nam. Phân tích nhanh hành trình:

- Khu vực: ${zoneName || "Việt Nam"}
- Quãng đường: ${distanceKm} km, thời gian di chuyển: ${durationMin} phút
- Khung giờ phù hợp: ${bestTime}
- Phong cách: ${vibes}
- Điểm dừng (tối đa 5): ${names}

Trả về CHỈ JSON (không markdown) theo đúng schema:
{
  "summary": "2-3 câu tóm tắt ngắn gọn (<200 ký tự)",
  "tips": ["mẹo 1 (<100 ký tự)", "mẹo 2", "mẹo 3", "mẹo 4", "mẹo 5"]
}

Ngôn ngữ: tiếng Việt.`;
}

/** Call LLM with proper error handling and logging */
async function callLLMAndParse(prompt) {
  if (!GEMINI_API_KEY) {
    console.error("❌ [LLM] GEMINI_API_KEY not set in environment");
    return null;
  }

  console.log("🔑 [LLM] API Key check:", {
    exists: !!GEMINI_API_KEY,
    length: GEMINI_API_KEY.length,
    prefix: GEMINI_API_KEY.substring(0, 10) + "...",
  });

  // ✅ Correct response schema (no additionalProperties)
  const responseSchema = {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "Short trip summary in Vietnamese",
      },
      tips: {
        type: "array",
        description: "Practical travel tips",
        items: { type: "string" },
      },
    },
    required: ["summary", "tips"],
  };

  // ✅ FIXED: Correct harm category names
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, // ✅ NOT SEXUAL_CONTENT
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  console.log(
    "🛡️ [LLM] Safety settings configured:",
    safetySettings.map((s) => s.category).join(", ")
  );

  const tryModel = async (modelName, attempt) => {
    console.log(`\n🤖 [LLM] Attempt #${attempt}: ${modelName}`);
    console.log("📝 [LLM] Prompt length:", prompt.length, "chars");

    try {
      // ✅ Get model with v1beta for JSON schema support
      const model = genAI.getGenerativeModel(
        {
          model: modelName,
          generationConfig: {
            temperature: attempt === 1 ? 0.3 : 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 768,
            candidateCount: 1,
            responseMimeType: "application/json",
            responseSchema,
          },
          safetySettings,
        },
        { apiVersion: "v1beta" }
      );

      console.log("📡 [LLM] Calling Gemini API...");
      const started = Date.now();

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("LLM timeout (12s)")), 12000)
        ),
      ]);

      const took = ((Date.now() - started) / 1000).toFixed(2);
      const resp = result?.response;
      const candidates = resp?.candidates || [];
      const c0 = candidates[0];

      console.log(`⏱️ [LLM] Response received in ${took}s`);
      console.log("📊 [LLM] Candidates:", candidates.length);

      if (!candidates.length || !c0?.content?.parts?.length) {
        const finish =
          c0?.finishReason ||
          resp?.promptFeedback?.blockReason ||
          "EMPTY_OR_BLOCKED";
        console.warn(`⚠️ [LLM] Empty/blocked response:`, {
          finishReason: finish,
          candidatesCount: candidates.length,
          hasContent: !!c0?.content,
          partsCount: c0?.content?.parts?.length || 0,
        });
        return null;
      }

      // Extract text from response
      const text =
        resp.text?.() ||
        c0.content.parts
          .map((p) => p.text || "")
          .join("")
          .trim();

      console.log("📄 [LLM] Response text length:", text?.length || 0);

      if (!text || !text.trim()) {
        console.warn("⚠️ [LLM] Empty response text after extraction");
        return null;
      }

      // Parse JSON
      let data;
      try {
        data = JSON.parse(text);
        console.log("✅ [LLM] JSON parsed successfully:", {
          hasSummary: !!data.summary,
          summaryLength: data.summary?.length,
          tipsCount: data.tips?.length,
        });
      } catch (parseErr) {
        console.error("❌ [LLM] JSON parse error:", parseErr.message);
        console.log("📄 [LLM] Raw text:", text.substring(0, 200));

        // Fallback: try parsing from first part
        try {
          const raw = c0.content.parts[0]?.text || "";
          data = JSON.parse(raw);
          console.log("✅ [LLM] Parsed from parts[0] successfully");
        } catch (fallbackErr) {
          console.error("❌ [LLM] Fallback parse also failed");
          return null;
        }
      }

      // Validate structure
      if (
        !data ||
        typeof data !== "object" ||
        !data.summary ||
        !Array.isArray(data.tips)
      ) {
        console.error("❌ [LLM] Invalid JSON structure:", {
          isObject: typeof data === "object",
          hasSummary: !!data?.summary,
          hasTips: !!data?.tips,
          tipsIsArray: Array.isArray(data?.tips),
        });
        return null;
      }

      const result_data = {
        summary: String(data.summary).trim().slice(0, 300),
        tips: data.tips
          .filter((t) => typeof t === "string" && t.trim())
          .map((t) => t.trim().slice(0, 120))
          .slice(0, 8),
      };

      console.log("✅ [LLM] Final result:", {
        summaryLength: result_data.summary.length,
        tipsCount: result_data.tips.length,
      });

      return result_data;
    } catch (err) {
      console.error(`❌ [LLM] Error in attempt #${attempt}:`, {
        model: modelName,
        message: err.message,
        name: err.name,
        stack: err.stack?.split("\n").slice(0, 3).join("\n"),
      });

      // Log specific error types
      if (err.message.includes("API key")) {
        console.error("🔑 [LLM] API Key issue detected");
      } else if (err.message.includes("safety_settings")) {
        console.error("🛡️ [LLM] Safety settings issue detected");
      } else if (err.message.includes("response_schema")) {
        console.error("📋 [LLM] Schema validation issue detected");
      }

      return null;
    }
  };

  // Try primary model, then fallback
  console.log("🚀 [LLM] Starting model chain:", [
    PRIMARY_MODEL,
    FALLBACK_MODEL,
  ]);

  for (const [i, m] of [PRIMARY_MODEL, FALLBACK_MODEL].entries()) {
    const out = await tryModel(m, i + 1);
    if (out) {
      console.log(`✅ [LLM] Success with ${m}`);
      return out;
    }

    if (i < 1) {
      console.log(`⏭️ [LLM] ${m} failed, trying fallback...`);
    }
  }

  console.error("❌ [LLM] All models failed");
  return null;
}

/** Generate smart fallback */
function generateSmartFallback(itinerary) {
  console.log("🔄 [Fallback] Generating smart fallback");

  const {
    zoneName,
    items = [],
    preferences = {},
    totalDistance = 0,
    totalDuration = 0,
  } = itinerary || {};
  const n = items.length;
  const dist = Number(totalDistance) || 0;
  const hours = Math.max(1, Math.ceil((Number(totalDuration) || 0) / 60));
  const bestTime = preferences.bestTime || "anytime";
  const vibes = Array.isArray(preferences.vibes) ? preferences.vibes : [];

  console.log("📊 [Fallback] Input data:", {
    zoneName,
    itemsCount: n,
    distance: dist,
    hours,
    bestTime,
    vibes,
  });

  const summaries = {
    morning: `Hành trình buổi sáng ${dist} km qua ${n} điểm tại ${
      zoneName || "khu vực này"
    }. Thời tiết mát, dễ đi bộ. Dự kiến ${hours} giờ.`,
    afternoon: `Lộ trình ${dist} km trong ${hours} giờ, ${n} điểm tại ${
      zoneName || "đây"
    }. Nhịp độ vừa phải, nên nghỉ trưa 12:00–14:00.`,
    evening: `Hành trình buổi tối ${dist} km, ${n} địa điểm tại ${
      zoneName || "khu vực"
    }. Không khí mát mẻ, thoải mái.`,
    sunset: `Tuyến ${dist} km ngắm hoàng hôn, ${n} điểm đẹp tại ${
      zoneName || "đây"
    }. Khung 17:00–18:30.`,
    anytime: `Hành trình linh hoạt ${dist} km, ${n} điểm tại ${
      zoneName || "khu vực"
    }. Thời gian khoảng ${hours} giờ.`,
  };

  const vibeTips = {
    nature: ["🌿 Mang nước & kem chống nắng", "👟 Đi giày thoải mái"],
    culture: [
      "👔 Ăn mặc lịch sự khi vào đền/chùa",
      "📚 Tìm hiểu sơ lịch sử trước khi đi",
    ],
    food: ["⏰ Đến sớm để tránh hết món", "💵 Mang tiền mặt"],
    local: ["🗣️ Học vài câu địa phương", "📱 Tải Google Translate offline"],
    beach: ["🏊 Mang đồ bơi/khăn", "☀️ Bôi lại kem chống nắng mỗi 2 giờ"],
    mountain: ["🧥 Áo ấm vì chênh nhiệt", "🥾 Giày đế chống trượt"],
  };

  const timeTips = {
    morning: ["Khởi hành 6:30–7:30 để mát mẻ", "Ăn sáng nhẹ trước khi đi"],
    afternoon: ["Nghỉ trưa 12:00–14:00", "Uống đủ nước (≥1.5L/người)"],
    evening: ["Mang áo khoác nhẹ", "Kiểm tra đèn pin điện thoại"],
    sunset: [
      "Đến sớm 30 phút chọn vị trí đẹp",
      "Sạc đầy pin máy ảnh/điện thoại",
    ],
  };

  let tips = [
    `⏱️ Dành khoảng ${hours} giờ cho hành trình`,
    "🕐 Kiểm tra giờ mở cửa trước khi đến",
    "🗺️ Dùng Google Maps để cập nhật giao thông",
  ];

  vibes.slice(0, 2).forEach((v) => {
    if (vibeTips[v]) {
      tips.push(...vibeTips[v]);
      console.log(`📌 [Fallback] Added tips for vibe: ${v}`);
    }
  });

  if (timeTips[bestTime]) {
    tips.push(...timeTips[bestTime]);
    console.log(`⏰ [Fallback] Added tips for time: ${bestTime}`);
  }

  tips.push("🔌 Mang sạc dự phòng điện thoại");

  const result = {
    summary: summaries[bestTime] || summaries.anytime,
    tips: tips.slice(0, 8),
  };

  console.log("✅ [Fallback] Generated:", {
    summaryLength: result.summary.length,
    tipsCount: result.tips.length,
  });

  return result;
}

/** Background AI insights generation */
async function generateAIInsightsAsync(itineraryId, itineraryData, tripData) {
  const Itinerary = require("../../models/Itinerary");

  console.log("\n🧠 [AI-bg] ========== Starting AI Processing ==========");
  console.log("🆔 [AI-bg] Itinerary ID:", itineraryId);
  console.log("📊 [AI-bg] Input data:", {
    zoneName: itineraryData?.zoneName,
    itemsCount: itineraryData?.items?.length,
    hasTrip: !!tripData,
    tripDistance: tripData?.trips?.[0]?.distance,
  });

  try {
    const prompt = buildItineraryPrompt(itineraryData, tripData);
    console.log("📝 [AI-bg] Prompt generated, length:", prompt.length);

    const llm = await callLLMAndParse(prompt);

    const doc = await Itinerary.findById(itineraryId);
    if (!doc) {
      console.error("❌ [AI-bg] Itinerary not found in DB:", itineraryId);
      return;
    }

    if (llm) {
      doc.aiInsights = llm;
      doc.aiProcessing = false;
      await doc.save();
      console.log("💾 [AI-bg] ✅ Saved LLM insights:", {
        id: itineraryId.toString(),
        summaryLen: llm.summary.length,
        tipsCount: llm.tips.length,
      });
    } else {
      console.log("🔄 [AI-bg] LLM returned null, using fallback");
      const fb = generateSmartFallback(itineraryData);
      doc.aiInsights = fb;
      doc.aiProcessing = false;
      await doc.save();
      console.log("💾 [AI-bg] ✅ Saved fallback insights:", {
        id: itineraryId.toString(),
        summaryLen: fb.summary.length,
        tipsCount: fb.tips.length,
      });
    }

    console.log("🧠 [AI-bg] ========== Completed Successfully ==========\n");
  } catch (e) {
    console.error("❌ [AI-bg] ========== Error Occurred ==========");
    console.error("❌ [AI-bg] Error details:", {
      message: e.message,
      name: e.name,
      stack: e.stack?.split("\n").slice(0, 5).join("\n"),
    });

    try {
      const doc = await Itinerary.findById(itineraryId);
      if (doc) {
        const fb = generateSmartFallback(itineraryData);
        doc.aiInsights = fb;
        doc.aiProcessing = false;
        await doc.save();
        console.log("💾 [AI-bg] ✅ Saved fallback after error");
      }
    } catch (e2) {
      console.error("❌ [AI-bg] Cannot save fallback:", e2.message);
    }

    console.log("❌ [AI-bg] ========== Error Recovery Complete ==========\n");
  }
}

module.exports = {
  buildItineraryPrompt,
  callLLMAndParse,
  generateSmartFallback,
  generateAIInsightsAsync,
};
