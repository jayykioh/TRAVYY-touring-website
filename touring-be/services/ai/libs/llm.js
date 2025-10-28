require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { extractFlexibleKeywords } = require('./keyword-matcher');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const LLM_ENABLED = process.env.LLM_ENABLED !== "false";
const LLM_PROVIDER = process.env.LLM_PROVIDER || "gemini";

console.log(`🧠 LLM Config: enabled=${LLM_ENABLED}, provider=${LLM_PROVIDER}, model=${GEMINI_MODEL}`);
console.log(`🔑 Gemini API key: ${GEMINI_API_KEY ? "configured" : "missing"}`);

let genAI = null;
let model = null;

function getAiModel() {
  if (!LLM_ENABLED || LLM_PROVIDER !== "gemini" || !GEMINI_API_KEY) return null;
  try {
    if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    if (!model) {
      model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: { temperature: 0.1, maxOutputTokens: 128 }
      });
      console.log("✅ Gemini AI initialized successfully");
    }
    return model;
  } catch (err) {
    console.error("❌ Failed to initialize Gemini AI:", err.message);
    return null;
  }
}

/* ---------------- Utils ---------------- */

function extractJsonFromText(text) {
  try {
    // Bóc trong ```json ...``` hoặc block ``` ... ```
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      const t = fenced[1].trim();
      const firstJson = t.match(/{[\s\S]*}/);
      if (firstJson) return JSON.parse(firstJson[0]);
    }
    // Fallback: lấy JSON đầu tiên trong đoạn
    const first = text.match(/{[\s\S]*}/);
    if (first) return JSON.parse(first[0]);
    return null;
  } catch {
    return null;
  }
}

// Trả số ngày; hỗ trợ "2 tuần", "2-3 ngày" (lấy upper), "3 days"
function extractDuration(text) {
  const lower = text.toLowerCase();
  const week = lower.match(/(\d+)\s*(?:tuần|weeks?)/);
  if (week) return parseInt(week[1], 10) * 7;

  // "2-3 ngày" -> 3; "2 ~ 4 days" -> 4
  const dayRange = lower.match(/(\d+)\s*[-~–]\s*(\d+)\s*(?:ngày|hôm|days?)/);
  if (dayRange) return Math.max(parseInt(dayRange[1], 10), parseInt(dayRange[2], 10));

  const day = lower.match(/(\d+)\s*(?:ngày|hôm|days?)/);
  if (day) return parseInt(day[1], 10);

  return null;
}

/**
 * ✅ Extract budget from text
 */
function extractBudget(text) {
  const lower = text.toLowerCase();
  
  // Low/Budget
  if (/tiết kiệm|rẻ|bình dân|budget|cheap|affordable|ít tiền|giá rẻ/i.test(lower)) {
    return 'low';
  }
  
  // High/Luxury
  if (/sang trọng|cao cấp|xa xỉ|luxury|expensive|high.?end|đắt/i.test(lower)) {
    return 'high';
  }
  
  // Mid
  if (/trung bình|vừa phải|mid.?range|moderate/i.test(lower)) {
    return 'mid';
  }
  
  // Default: mid (balanced budget)
  return 'mid';
}

/**
 * ✅ UPDATED: Extract vibes AND keywords (semantic)
 */
function heuristicExtractVibes(text) {
  const lower = text.toLowerCase();
  const vibes = [];
  const avoid = [];
  
  // Vibe patterns (broad categories)
  const vibePatterns = {
    beach: /biển|beach|bơi|tắm biển|bãi biển/,
    mountain: /núi|mountain|leo núi|đồi/,
    food: /ẩm thực|món ăn|đặc sản|food|hải sản|ăn uống/,
    culture: /văn hóa|culture|lịch sử|di tích|phố cổ|bảo tàng/,
    nature: /thiên nhiên|nature|cảnh đẹp|rừng|thác/,
    relax: /nghỉ ngơi|thư giãn|relax|spa|resort/,
    romantic: /lãng mạn|romantic|cặp đôi|người yêu|honeymoon/,
    adventure: /mạo hiểm|adventure|khám phá|explore/,
    photo: /chụp ảnh|sống ảo|check.?in|photo/,
    sunset: /hoàng hôn|sunset|bình minh|sunrise/,
    nightlife: /đêm|bar|pub|club|nightlife/,
    shopping: /mua sắm|shopping|chợ|market/,
    temple: /chùa|đền|miếu|tâm linh|spiritual|temple/,
    family: /gia đình|kids|children|trẻ em/,
    local: /local|địa phương|dân địa|bản địa/,
    island: /đảo|island|cù lao/
  };
  
  // Avoid patterns
  const avoidPatterns = {
    crowded: /đông|đông người|chỗ đông|đông đúc|crowded|nhiều người/,
    touristy: /du lịch|tourist|thương mại/,
    expensive: /đắt|expensive|giá cao/,
    traffic: /xe cộ|tắc đường|traffic|ùn tắc/,
    noisy: /ồn|ồn ào|noisy/,
    hot: /nóng|hot weather|nóng nực/,
    walking: /đi bộ|đi bộ xa|đi bộ nhiều|mệt|tránh đi bộ|không thích đi bộ/ // ✅ Enhanced
  };
  
  // Extract vibes
  for (const [vibe, regex] of Object.entries(vibePatterns)) {
    if (regex.test(lower)) {
      vibes.push(vibe);
    }
  }
  
  // ✅ FIXED: Extract avoids (check for negative context around keywords)
  const hasAvoidMarker = /tránh|không thích|không muốn|avoid|ghét|ko|không|hate/i.test(lower);
  
  if (hasAvoidMarker) {
    // Split by avoid markers to get context
    const avoidSegments = lower.split(/(?:tránh|không thích|không muốn|avoid|ghét|ko |không |hate)/i);
    
    for (let i = 1; i < avoidSegments.length; i++) {
      const segment = avoidSegments[i];
      
      // Check each avoid pattern in this segment
      for (const [avoidKey, regex] of Object.entries(avoidPatterns)) {
        if (regex.test(segment)) {
          avoid.push(avoidKey);
        }
      }
    }
  }
  
  // ✅ Use semantic keyword extraction
  const keywords = extractFlexibleKeywords(text);
  
  return {
    vibes: [...new Set(vibes)],
    avoid: [...new Set(avoid)],
    keywords: keywords
  };
}

// Heuristic enrich tiếng Việt (mở rộng interest/pace/budget/duration)
function enrichFromVietnamese(text) {
  const res = { interests: [], avoid: [], pace: null, budget: null, durationDays: null };
  const t = text.toLowerCase();

  const push = (arr, v) => { if (!arr.includes(v)) arr.push(v); };

  if (/(biển|bơi|bãi biển)/.test(t)) push(res.interests, "beach");
  if (/(ẩm thực|món ăn|đặc sản|hải sản)/.test(t)) push(res.interests, "food");
  if (/(núi|thiên nhiên|cảnh đẹp|rừng|thác)/.test(t)) push(res.interests, "nature");
  if (/(lịch sử|di tích|phố cổ|bảo tàng|văn hóa)/.test(t)) push(res.interests, "culture");

  if (/(không thích đông|tránh chỗ đông)/.test(t)) push(res.avoid, "crowded");
  if (/(không thích nóng|tránh nóng)/.test(t)) push(res.avoid, "hot");
  if (/(không thích đi bộ|tránh đi bộ)/.test(t)) push(res.avoid, "walking");

  if (/(chậm|từ từ|thư thả)/.test(t)) res.pace = "light";
  else if (/(vừa phải|không vội|nhẹ nhàng)/.test(t)) res.pace = "medium";
  else if (/(nhanh|nhiều địa điểm|dày đặc)/.test(t)) res.pace = "intense";

  if (/(tiết kiệm|rẻ|ít tiền|budget)/.test(t)) res.budget = "low";
  else if (/(trung bình|vừa phải|mid)/.test(t)) res.budget = "mid";
  else if (/(cao cấp|sang trọng|luxury)/.test(t)) res.budget = "luxury";

  res.durationDays = extractDuration(text);
  return res;
}

// Chuẩn hoá output cuối
function sanitizePrefs(parsed) {
  const out = {
    interests: Array.isArray(parsed.interests) ? parsed.interests : [],
    avoid: Array.isArray(parsed.avoid) ? parsed.avoid : [],
    pace: parsed.pace ?? null,
    budget: parsed.budget ?? null,
    durationDays: parsed.durationDays ?? null
  };

  const norm = (x) => (typeof x === "string" ? x.toLowerCase().trim() : x);
  out.interests = out.interests.map(norm).filter(Boolean);
  out.avoid = out.avoid.map(norm).filter(Boolean);

  // limit noise
  if (out.interests.length > 5) out.interests = out.interests.slice(0, 5);
  if (out.avoid.length > 5) out.avoid = out.avoid.slice(0, 5);

  if (out.pace && !["light", "medium", "intense"].includes(out.pace)) out.pace = null;
  if (out.budget && !["budget", "mid", "luxury"].includes(out.budget)) out.budget = null;

  if (out.durationDays != null) {
    const n = parseInt(out.durationDays, 10);
    out.durationDays = Number.isFinite(n) ? n : null;
  }

  return out;
}

// Hợp nhất 2 kết quả (giữ giá trị đã có, fill nếu thiếu)
function mergePrefs(base, extra) {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  return sanitizePrefs({
    interests: uniq([...(base.interests || []), ...(extra.interests || [])]),
    avoid: uniq([...(base.avoid || []), ...(extra.avoid || [])]),
    pace: base.pace || extra.pace || null,
    budget: base.budget || extra.budget || null,
    durationDays: base.durationDays || extra.durationDays || null
  });
}

/* --------------- Main --------------- */
/**
 * Smart parse with fast heuristics, optional AI, and strict sanitation.
 * @param {string} text free-text preferences (VN/EN)
 * @returns {{interests:string[], avoid:string[], pace:"light"|"medium"|"intense"|null, budget:"budget"|"mid"|"luxury"|null, durationDays:number|null}}
 */
async function parsePrefsSmart(text) {
  // 1) Heuristics (song song VN/EN patterns)
  const h1 = heuristicExtractVibes(text);        // {vibes, avoid}
  const h2 = enrichFromVietnamese(text);         // {interests, avoid, pace, budget, durationDays}
  const seed = mergePrefs(
    { interests: h1.vibes, avoid: h1.avoid, pace: null, budget: null, durationDays: null },
    h2
  );

  // Nếu seed đã đủ mạnh (>=2 interests hoặc có pace/budget/duration) → bỏ qua AI
  const hasSignal =
    (seed.interests?.length ?? 0) >= 2 ||
    !!seed.pace || !!seed.budget || !!seed.durationDays;

  if (hasSignal || !GEMINI_API_KEY) {
    console.log(`   ✅ Using heuristic only (interests=${seed.interests.length}, pace=${seed.pace}, budget=${seed.budget}, duration=${seed.durationDays})`);
    return sanitizePrefs(seed);
  }

  // 2) Gọi AI (chỉ khi thật sự cần)
  console.log('🤖 Enhancing with AI...');
  try {
    const ai = getAiModel();
    if (!ai) return sanitizePrefs(seed);

    const shortText = text.slice(0, 160);
    const prompt = `Extract concise travel prefs from: "${shortText}"
Hãy trả về JSON với cấu trúc:
{
  "vibes": ["beach", "romantic", ...],  // Sở thích: beach, nature, culture, adventure, food, photo, sunset, nightlife, romantic, shopping, relax, spiritual, local
  "avoid": ["crowded", "noisy", ...],   // Tránh: crowded, noisy, touristy, expensive, far
  "pace": "slow" | "moderate" | "fast" | null,  // Nhịp độ: slow (thư thái), moderate (vừa phải), fast (gấp gáp)
  "budget": "low" | "medium" | "high" | null,   // Ngân sách: low (tiết kiệm), medium (vừa), high (sang trọng)
  "durationDays": 3,  // Số ngày (extract từ "3 ngày", "1 tuần" = 7, etc)
  "groupType": "solo" | "couple" | "family" | "friends" | null  // Loại nhóm
}

Lưu ý:
- Nhận diện phủ định: "không ồn", "đừng đông đúc", "tránh xa" → thêm vào "avoid"
- Budget: "tiết kiệm", "ít tiền" → low; "sang trọng", "xa xỉ" → high
- Pace: "thư thái", "yên tĩnh" → slow; "khám phá", "năng động" → fast
- Group: "người yêu", "bạn gái" → couple; "gia đình" → family; "bạn bè" → friends

CHỈ trả về JSON, không giải thích.`;

    const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error('AI_TIMEOUT')), 3000));
    const result = await Promise.race([ai.generateContent(prompt), timeoutPromise]);

    const responseText = result?.response?.text?.() || "";
    const parsed = extractJsonFromText(responseText) || {};
    const merged = mergePrefs(seed, parsed);

    return sanitizePrefs(merged);
  } catch (e) {
    console.warn('   ⚠️ AI failed, fallback to heuristics:', e.message || e);
    return sanitizePrefs(seed);
  }
}

/**
 * Enhanced heuristic fallback with smart defaults
 */
function heuristicParse(text) {
  const lower = text.toLowerCase();
  
  // Vibe patterns (broad categories)
  const vibePatterns = {
    beach: /biển|beach|bơi|tắm biển|bãi biển/,
    mountain: /núi|mountain|leo núi|đồi/,
    food: /ẩm thực|món ăn|đặc sản|food|hải sản|ăn uống/,
    culture: /văn hóa|culture|lịch sử|di tích|phố cổ|bảo tàng/,
    nature: /thiên nhiên|nature|cảnh đẹp|rừng|thác/,
    relax: /nghỉ ngơi|thư giãn|relax|spa|resort/,
    romantic: /lãng mạn|romantic|cặp đôi|người yêu|honeymoon/,
    adventure: /mạo hiểm|adventure|khám phá|explore/,
    photo: /chụp ảnh|sống ảo|check.?in|photo/,
    sunset: /hoàng hôn|sunset|bình minh|sunrise/,
    nightlife: /đêm|bar|pub|club|nightlife/,
    shopping: /mua sắm|shopping|chợ|market/,
    temple: /chùa|đền|miếu|tâm linh|spiritual|temple/,
    family: /gia đình|kids|children|trẻ em/,
    local: /local|địa phương|dân địa|bản địa/,
    island: /đảo|island|cù lao/
  };
  
  // Avoid patterns
  const avoidPatterns = {
    crowded: /đông|đông người|chỗ đông|đông đúc|crowded|nhiều người/,
    touristy: /du lịch|tourist|thương mại/,
    expensive: /đắt|expensive|giá cao/,
    traffic: /xe cộ|tắc đường|traffic|ùn tắc/,
    noisy: /ồn|ồn ào|noisy/,
    hot: /nóng|hot weather|nóng nực/,
    walking: /đi bộ|đi bộ xa|đi bộ nhiều|mệt|tránh đi bộ|không thích đi bộ/ // ✅ Enhanced
  };
  
  const vibes = [];
  const avoid = [];
  
  // Extract vibes
  for (const [vibe, regex] of Object.entries(vibePatterns)) {
    if (regex.test(lower)) {
      vibes.push(vibe);
    }
  }
  
  // ✅ FIXED: Extract avoids (check for negative context around keywords)
  const hasAvoidMarker = /tránh|không thích|không muốn|avoid|ghét|ko|không|hate/i.test(lower);
  
  if (hasAvoidMarker) {
    // Split by avoid markers to get context
    const avoidSegments = lower.split(/(?:tránh|không thích|không muốn|avoid|ghét|ko |không |hate)/i);
    
    for (let i = 1; i < avoidSegments.length; i++) {
      const segment = avoidSegments[i];
      
      // Check each avoid pattern in this segment
      for (const [avoidKey, regex] of Object.entries(avoidPatterns)) {
        if (regex.test(segment)) {
          avoid.push(avoidKey);
        }
      }
    }
  }
  
  // ✅ Pace detection with DEFAULT
  let pace = null;
  if (/thư giãn|yên tĩnh|chậm rãi|slow|chill/i.test(lower)) {
    pace = 'slow';
  } else if (/năng động|nhanh|gấp|khám phá|fast|active/i.test(lower)) {
    pace = 'fast';
  } else if (/vừa phải|moderate|balanced/i.test(lower)) {
    pace = 'moderate';
  }
  // ✅ DEFAULT: moderate if not detected
  if (!pace) {
    pace = 'moderate';
  }
  
  // ✅ Budget detection with DEFAULT
  let budget = null;
  if (/tiết kiệm|ít tiền|rẻ|bình dân|budget|cheap/i.test(lower)) {
    budget = 'low';
  } else if (/sang trọng|xa xỉ|đắt|cao cấp|luxury|premium/i.test(lower)) {
    budget = 'high';
  } else if (/vừa|trung bình|medium/i.test(lower)) {
    budget = 'medium';
  }
  // ✅ DEFAULT: medium if not detected
  if (!budget) {
    budget = 'medium';
  }
  
  // ✅ Duration with DEFAULT
  let durationDays = null;
  const dayMatch = lower.match(/(\d+)\s*ngày/);
  const weekMatch = lower.match(/(\d+)\s*tuần/);
  if (dayMatch) {
    durationDays = parseInt(dayMatch[1]);
  } else if (weekMatch) {
    durationDays = parseInt(weekMatch[1]) * 7;
  }
  // ✅ DEFAULT: 4 days if not detected
  if (!durationDays) {
    durationDays = 4;
  }
  
  // Group type detection (basic)
  let groupType = null;
  if (/(solo|một mình|độc thân)/i.test(lower)) {
    groupType = 'solo';
  } else if (/(cặp đôi|người yêu|bạn gái|bạn trai)/i.test(lower)) {
    groupType = 'couple';
  } else if (/(gia đình|trẻ em|kids|children)/i.test(lower)) {
    groupType = 'family';
  } else if (/(bạn bè|nhóm bạn|friends)/i.test(lower)) {
    groupType = 'friends';
  }
  
  console.log(`   ✅ Heuristic parse: ${vibes.length} vibes, ${avoid.length} avoid, pace=${pace}, budget=${budget}, duration=${durationDays}`);
  
  return {
    vibes,
    avoid,
    pace,
    budget,
    durationDays,
    groupType,
    _rawText: text,
    _source: 'heuristic'
  };
}

/* --------------- Exports --------------- */
module.exports = {
  parsePrefsSmart,
  enrichFromVietnamese,
  sanitizePrefs,
  extractJsonFromText,
  heuristicExtractVibes,
  extractDuration
};
