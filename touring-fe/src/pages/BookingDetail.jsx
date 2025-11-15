import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import logger from '@/utils/logger';
import { useAuth } from '@/auth/context';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { withAuth } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const resp = await withAuth(`/api/bookings/${bookingId}`);
      setBooking(resp.booking || resp);
    } catch (err) {
      logger.error('Error loading booking', err);
      toast.error('Không thể tải thông tin booking');
      navigate('/booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  );

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center">Không tìm thấy booking</div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Link to="/booking" className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600">
          <ArrowLeft /> Quay lại
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-2">Chi tiết booking</h1>

      <div className="bg-white border rounded p-4">
        <div className="mb-3">
          <strong>Mã booking:</strong> {booking._id}
        </div>
        <div className="mb-3">
          <strong>Trạng thái:</strong> {booking.status}
        </div>
        <div className="mb-3">
          <strong>Tổng cộng:</strong> {booking.payment?.totalVND?.toLocaleString('vi-VN') || '—'} ₫
        </div>
        <div className="mb-3">
          <strong>Người đặt:</strong> {booking.user?.name || booking.userName || '—'}
        </div>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
}
