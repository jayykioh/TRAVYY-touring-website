import { useState } from "react";

export default function ItinerarySection({ itinerary }) {
  const [selectedPart, setSelectedPart] = useState(0);

  if (!itinerary || itinerary.length === 0)
    return (
      <p className="text-gray-500 italic text-sm">
        Chưa có lịch trình cho tour này.
      </p>
    );

  const selected = itinerary[selectedPart];

  return (
    <div className="space-y-6">
      {/* Tabs chọn ngày / phần */}
      <div className="flex flex-wrap gap-2">
        {itinerary.map((item, index) => (
          <button
            key={index}
            onClick={() => setSelectedPart(index)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedPart === index
                ? "bg-[#02A0AA] text-white shadow-md scale-[1.05]"
                : "bg-white text-[#02A0AA] border border-[#02A0AA]/30 hover:bg-[#02A0AA]/10"
            }`}
          >
            {item.part || `Phần ${index + 1}`}
          </button>
        ))}
      </div>

      {/* Nội dung chi tiết */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 bg-[#02A0AA] rounded-full"></div>
          <h3 className="text-lg font-semibold text-[#02A0AA]">
            {selected.part}
          </h3>
        </div>

        {/* Tiêu đề */}
        <p className="text-gray-700 italic mb-4">{selected.title}</p>

        {/* Danh sách mô tả */}
        {selected.description?.length > 0 ? (
          <ul className="relative border-l-2 border-[#02A0AA]/20 pl-5 space-y-3">
            {selected.description.map((desc, i) => (
              <li
                key={i}
                className="relative text-gray-800 leading-relaxed before:content-[''] before:absolute before:-left-[9px] before:top-2 before:w-2 before:h-2 before:bg-[#02A0AA] before:rounded-full"
              >
                {desc}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Không có mô tả chi tiết.</p>
        )}
      </div>
    </div>
  );
}
