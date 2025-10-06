import { useLocation } from "react-router-dom";
import { useState } from "react";
import BookingSteps from "../components/BookingSteps";

export default function BookingPage() {
  const { state } = useLocation();
  const [contact, setContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const step = 2;
const images = state.images || [];

  if (!state) {
    return <div className="p-6">⚠️ Không có dữ liệu booking</div>;
  }

  const handleSaveContact = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    setContact({
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      country: form.get("country"),
      phone: form.get("phone"),
      email: form.get("email"),
    });
    setShowModal(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Steps */}
      <BookingSteps step={step} />

      {/* MAIN CONTENT */}
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* LEFT CONTENT */}
          <div className="space-y-6">
            {/* Other info */}
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <h2 className="font-semibold mb-3">Other info</h2>
              <div className="flex items-center gap-4">
                <img
                  src={images[0]?.imageUrl || images[0]?.url || images[0]?.secure_url}
    alt={state.tourTitle}
    className="w-32 h-20 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{state.tourTitle}</p>
                  <p className="text-sm text-gray-500">Ngày: {state.selectedDate}</p>
                  <p className="text-sm text-gray-500">
                    Người lớn: {state.adults}, Trẻ em: {state.children}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Contact info</h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-sm text-[#02A0AA] font-medium"
                >
                  {contact ? "Edit" : "+ Add"}
                </button>
              </div>
              {contact ? (
                <div className="text-sm space-y-1">
                  <p>
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p>{contact.country}</p>
                  <p>{contact.phone}</p>
                  <p>{contact.email}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Chưa có thông tin liên hệ</p>
              )}
            </div>

            {/* Discounts */}
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <h2 className="font-semibold mb-3">Discounts</h2>
              <p className="text-sm text-gray-500">Chưa có mã giảm giá khả dụng</p>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button className="px-4 py-2 rounded-lg bg-gray-200 text-sm font-medium">
                  Redeem
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="bg-white rounded-2xl shadow-sm border p-5 h-fit">
            <h2 className="font-semibold mb-4">Tóm tắt đặt chỗ</h2>
            <p className="text-sm mb-1">
              Ngày: <strong>{state.selectedDate}</strong>
            </p>
            <p className="text-sm mb-1">
              Người lớn: <strong>{state.adults}</strong>, Trẻ em:{" "}
              <strong>{state.children}</strong>
            </p>
            <p className="text-sm mb-4">
              Tổng tiền: <strong>{state.subtotal?.toLocaleString()} ₫</strong>
            </p>

            <button
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: "#02A0AA" }}
            >
              Go to payment
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CONTACT FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Add contact info</h2>
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">First name *</label>
                  <input
                    name="firstName"
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Last name *</label>
                  <input
                    name="lastName"
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Country/region *</label>
                <select
                  name="country"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Please select</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="USA">USA</option>
                  <option value="Japan">Japan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Phone number *</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email address *</label>
                <input
                  name="email"
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: "#02A0AA" }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
