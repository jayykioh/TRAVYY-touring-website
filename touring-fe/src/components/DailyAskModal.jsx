import { useState, useEffect } from "react";
import { X, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../auth/context";

/**
 * DailyAskModal - Gamified daily question to collect user preferences
 * Weight: ×2.0 for AI profile building (second highest after booking!)
 * 
 * Flow:
 * 1. Check localStorage for lastAnswered date
 * 2. If not answered today → Fetch question from API
 * 3. Show modal with vibes checkboxes
 * 4. Submit answer → Save to backend → Hide for 24h
 * 
 * Integration: Called from App.jsx after user login
 */

const DailyAskModal = ({ onClose }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if user already answered today
  useEffect(() => {
    const checkAndFetch = async () => {
      if (!user?.token) {
        onClose();
        return;
      }

      // Check localStorage first (avoid unnecessary API calls)
      const lastAnswered = localStorage.getItem("dailyAsk_lastAnswered");
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      console.log("📅 [DailyAsk] Check:", { lastAnswered, today });

      if (lastAnswered === today) {
        console.log("✅ [DailyAsk] Already answered today, skip modal");
        onClose();
        return;
      }

      // Fetch question from backend
      try {
        const response = await fetch('/api/daily-ask/question', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("❓ [DailyAsk] Question fetched:", data);

        if (data.alreadyAnswered) {
          console.log("✅ [DailyAsk] Backend says already answered");
          localStorage.setItem("dailyAsk_lastAnswered", today);
          onClose();
          return;
        }

        setQuestion(data);
      } catch (error) {
        console.error("❌ [DailyAsk] Fetch error:", error);
        onClose(); // Close modal on error
      } finally {
        setLoading(false);
      }
    };

    checkAndFetch();
  }, [user, onClose]);

  // Toggle vibe selection
  const toggleVibe = (vibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
    console.log("🎯 [DailyAsk] Toggled vibe:", vibe);
  };

  // Submit answer
  const handleSubmit = async () => {
    if (selectedVibes.length === 0) {
      alert("Vui lòng chọn ít nhất 1 vibe!");
      return;
    }

    setSubmitting(true);
    console.log("📤 [DailyAsk] Submitting answer:", {
      questionId: question.questionId,
      vibes: selectedVibes,
    });

    try {
      const response = await fetch('/api/daily-ask/answer', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
          body: JSON.stringify({
            questionId: question.questionId,
            selectedVibes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ [DailyAsk] Answer saved:", result);

      // Save to localStorage
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("dailyAsk_lastAnswered", today);

      // Show success animation
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("❌ [DailyAsk] Submit error:", error);
      alert("Lỗi khi lưu câu trả lời. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  // Skip question
  const handleSkip = () => {
    console.log("⏭️ [DailyAsk] User skipped question");
    // Don't save to localStorage (allow retry later in the day)
    onClose();
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <p className="text-gray-700">Đang tải câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  // No question (shouldn't happen, but safety check)
  if (!question) {
    return null;
  }

  // Success animation
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-8 shadow-xl text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-900" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cảm ơn bạn!
          </h3>
          <p className="text-sm text-gray-600">
            Câu trả lời giúp chúng tôi gợi ý tour phù hợp hơn
          </p>
        </div>
      </div>
    );
  }

  // Main modal UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Câu hỏi hôm nay</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Giúp chúng tôi hiểu bạn hơn
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
            <p className="text-base font-medium text-gray-900">
              {question.questionText}
            </p>
          </div>

          {/* Vibes Grid */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Chọn các vibes bạn thích (có thể chọn nhiều):
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {question.vibes.map((vibe) => (
                <button
                  key={vibe}
                  onClick={() => toggleVibe(vibe)}
                  className={`
                    p-3 rounded-lg border transition-all duration-200 text-left
                    ${
                      selectedVibes.includes(vibe)
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{vibe}</span>
                    {selectedVibes.includes(vibe) && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected count */}
          {selectedVibes.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-700">
                Đã chọn <span className="font-semibold">{selectedVibes.length}</span>:{" "}
                <span className="font-medium text-gray-900">
                  {selectedVibes.join(", ")}
                </span>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              disabled={submitting}
            >
              Bỏ qua
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedVibes.length === 0 || submitting}
              className={`
                flex-1 px-6 py-2.5 rounded-lg font-medium text-white transition-all text-sm
                ${
                  selectedVibes.length === 0 || submitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800"
                }
              `}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang lưu...
                </span>
              ) : (
                "Gửi câu trả lời"
              )}
            </button>
          </div>

          {/* Info footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              💡 Câu trả lời của bạn giúp AI gợi ý tour phù hợp hơn với sở thích
              của bạn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAskModal;
