// 📁 src/components/Guides/GuideCard.jsx
// ============================================

import React from 'react';
import {
  Eye,
  Edit,
  MoreVertical,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';
import { formatPrice } from '../../utils/guideHelpers';

const GuideCard = ({ guide, onView, onEdit, onVerify }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <img
            src={guide.avatar}
            alt={guide.name}
            className="w-16 h-16 rounded-full border-4 border-white"
          />
          <button className="p-1 hover:bg-white/20 rounded">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-xl font-bold">{guide.name}</h3>
        <div className="flex items-center mt-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{guide.location}</span>
          <span className="mx-2">•</span>
          <span className="text-sm">{guide.experience}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={guide.status} />
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium">{guide.rating}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            {guide.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {guide.phone}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{guide.totalTours}</p>
            <p className="text-xs text-gray-600">Tours</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{guide.completedTours}</p>
            <p className="text-xs text-gray-600">Hoàn thành</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">₫{formatPrice(guide.revenue)}</p>
            <p className="text-xs text-gray-600">Doanh thu</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Ngôn ngữ:</p>
          <div className="flex flex-wrap gap-1">
            {guide.languages.map((lang, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {lang}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Chuyên môn:</p>
          <div className="flex flex-wrap gap-1">
            {guide.specialties.map((specialty, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <button 
            onClick={() => onView(guide)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            Chi tiết
          </button>
          {guide.status === 'pending' && (
            <button 
              onClick={() => onVerify(guide)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Xác minh
            </button>
          )}
          {guide.status === 'verified' && (
            <button 
              onClick={() => onEdit(guide)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideCard;
