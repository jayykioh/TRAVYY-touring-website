import { useEffect, useState } from "react";
import { useAuth } from "../auth/context";

export default function BookingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("/api/bookings/my", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistory(data.data));
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Lịch sử Booking</h2>
      <div className="space-y-4">
        {history.map((bk) => (
          <div key={bk._id} className="border p-4 rounded-xl shadow-sm bg-white">
            <h3 className="font-bold">{bk.tourId?.title}</h3>
            <p>Mã vé: {bk.bookingCode}</p>
            <p>Tổng tiền: {bk.totalPrice.toLocaleString()} VND</p>
            <img src={bk.qrCode} alt="QR" className="w-32 h-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
