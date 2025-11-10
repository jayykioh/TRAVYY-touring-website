import React from "react";
import { Award } from "lucide-react";

const GuideInfoCard = ({ guideData, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-center mb-2">
        <div className="relative">
          <img
            src={guideData.avatar}
            alt={guideData.name}
            className="w-14 h-14 rounded-full border-2 border-[#02A0AA]"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#02A0AA] rounded-full flex items-center justify-center border-2 border-white">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center mb-2">
        <h3 className="text-base font-semibold text-gray-900 mb-0.5">
          {guideData.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2 flex items-center justify-center gap-1">
          <Award className="w-3 h-3" />
          Tour Guide
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1 text-center">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {guideData.totalTours}
          </div>
          <div className="text-xs text-gray-500">Tours</div>
        </div>
        <div className="border-l border-r border-gray-200">
          <div className="text-sm font-semibold text-gray-900">
            {guideData.rating}★
          </div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {guideData.experience}
          </div>
          <div className="text-xs text-gray-500 leading-tight">Exp</div>
        </div>
      </div>
    </div>
  );
};

export default GuideInfoCard;
