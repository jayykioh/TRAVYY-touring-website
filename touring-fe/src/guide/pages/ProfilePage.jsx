import React, { useState, useEffect } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/profile", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Không thể lấy thông tin hồ sơ");
        const data = await res.json();
        setProfile(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-6">Đang tải hồ sơ...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  }
  if (!profile) {
    return <div className="p-6">Không có dữ liệu hồ sơ.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hồ sơ</h1>
        <p className="text-gray-500">Quản lý hồ sơ và cài đặt của bạn</p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-6">
          <div className="relative">
            <img
              src={profile.avatar?.url || profile.avatar || "https://i.pravatar.cc/150?img=12"}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover ring-4 ring-[#02A0AA]/20"
            />
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#02A0AA] text-white rounded-full flex items-center justify-center hover:bg-[#018f95] transition-colors shadow-md">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  {profile.name}
                </h2>
                <p className="text-gray-500 text-lg">{profile.email}</p>
              </div>
              <Button
                variant={isEditing ? "success" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                size="md"
              >
                {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
              </Button>
            </div>

            <div className="flex items-center gap-6 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-xl">⭐</span>
                <span className="font-bold text-gray-900 text-lg">
                  {profile.rating}
                </span>
                <span className="text-gray-500 text-sm">Đánh giá</span>
              </div>
              <div className="w-px h-5 bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-lg">
                  {profile.totalTours}
                </span>
                <span className="text-gray-500 text-sm">Tour hoàn thành</span>
              </div>
              <div className="w-px h-5 bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-lg">
                  {profile.experience}
                </span>
                <span className="text-gray-500 text-sm">Kinh nghiệm</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang, index) => (
                <Badge key={index} variant="info">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="mb-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu</h3>
        {isEditing ? (
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#02A0AA] focus:outline-none text-gray-700"
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        ) : (
          <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
        )}
      </Card>

      {/* Specialties */}
      <Card className="mb-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Chuyên môn</h3>
        <div className="flex flex-wrap gap-3">
          {profile.specialties.map((specialty, index) => (
            <Badge key={index} variant="primary" size="md">
              {specialty}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="mb-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          Thông tin liên hệ
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Email</span>
            {isEditing ? (
              <input
                type="email"
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#02A0AA] focus:outline-none"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            ) : (
              <span className="font-medium text-gray-900">{profile.email}</span>
            )}
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 font-medium">Điện thoại</span>
            {isEditing ? (
              <input
                type="tel"
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#02A0AA] focus:outline-none"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            ) : (
              <span className="font-medium text-gray-900">{profile.phone}</span>
            )}
          </div>
        </div>
      </Card>

      {/* Settings */}
      <Card className="hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          Cài đặt thông báo
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer py-2">
            <span className="text-gray-700 font-medium">Yêu cầu tour mới</span>
            <input
              type="checkbox"
              className="w-5 h-5 text-[#02A0AA] focus:ring-[#02A0AA] focus:ring-2 rounded accent-[#02A0AA]"
              defaultChecked
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer py-2">
            <span className="text-gray-700 font-medium">
              Thông báo thanh toán
            </span>
            <input
              type="checkbox"
              className="w-5 h-5 text-[#02A0AA] focus:ring-[#02A0AA] focus:ring-2 rounded accent-[#02A0AA]"
              defaultChecked
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer py-2">
            <span className="text-gray-700 font-medium">Nhắc nhở về tour</span>
            <input
              type="checkbox"
              className="w-5 h-5 text-[#02A0AA] focus:ring-[#02A0AA] focus:ring-2 rounded accent-[#02A0AA]"
              defaultChecked
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer py-2">
            <span className="text-gray-700 font-medium">
              Tin nhắn khách hàng
            </span>
            <input
              type="checkbox"
              className="w-5 h-5 text-[#02A0AA] focus:ring-[#02A0AA] focus:ring-2 rounded accent-[#02A0AA]"
              defaultChecked
            />
          </label>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
