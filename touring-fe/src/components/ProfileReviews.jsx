export default function ProfileReviews() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Đánh giá của bạn</h1>
      <div className="space-y-3">
        <div className="p-4 border rounded-lg">
          <p className="font-semibold">Tour Đà Nẵng - Hội An</p>
          <p className="text-sm text-gray-600">⭐️⭐️⭐️⭐️☆ - Rất hài lòng!</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="font-semibold">Tour Hạ Long</p>
          <p className="text-sm text-gray-600">⭐️⭐️⭐️☆☆ - Tàu hơi đông.</p>
        </div>
      </div>
    </div>
  );
}
