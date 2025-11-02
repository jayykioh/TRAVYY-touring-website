import React from "react";

export default function TourDetailDialog({ tour, open, onClose }) {
  if (!open || !tour) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-white hover:bg-[#02A0AA] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
          onClick={onClose}
          aria-label="Đóng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-36 h-36 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0 shadow-md hover:shadow-xl transition-shadow duration-300">
              {tour.image ? (
                <img 
                  src={tour.image} 
                  alt={tour.title} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">
                {tour.title}
              </h2>
              
              {tour.agency?.name && (
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 rounded-full px-3 py-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">{tour.agency.name}</span>
                </div>
              )}
              
              <p className="text-sm text-slate-700 mb-3 line-clamp-3 leading-relaxed">
                {tour.description}
              </p>

              {/* Price and Duration */}
              <div className="flex flex-wrap gap-2 mb-3">
                {typeof tour.durationDays === "number" && (
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg px-3 py-1.5 text-xs font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{tour.durationDays} ngày{tour.durationNights ? `/${tour.durationNights} đêm` : ""}</span>
                  </div>
                )}
                {typeof tour.basePrice === "number" && (
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-lg px-3 py-1.5 text-xs font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{tour.basePrice.toLocaleString("vi-VN")} {tour.currency || "VND"}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tour.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tour.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 text-xs font-medium hover:bg-slate-200 transition-colors duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Schedule */}
          {tour.schedule && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <svg className="w-5 h-5 text-[#02A0AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-slate-900">Lịch trình:</span>
                <span>{tour.schedule.startTime} - {tour.schedule.endTime}</span>
              </div>
            </div>
          )}

          {/* External Link */}
          {tour.externalUrl && (
            <div className="mt-5">
              <a 
                href={tour.externalUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 w-full justify-center bg-gradient-to-r from-[#02A0AA] to-[#028a93] hover:from-[#028a93] hover:to-[#02A0AA] text-white font-semibold text-sm rounded-xl px-6 py-3 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
              >
                <span>Xem chi tiết tour</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}