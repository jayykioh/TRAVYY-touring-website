import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BlogPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:4000/api/blogs/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log("Blog data from API:", data);
        setBlog(data);
      })
      .catch((err) => {
        console.error("Error fetching blog:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Hiển thị loading
  if (loading) {
    return <div className="p-6 text-center">⏳ Đang tải dữ liệu...</div>;
  }

  // Hiển thị lỗi hoặc không tìm thấy
  if (error || !blog) {
    return (
      <div className="p-6 text-center text-lg text-red-500">
        404 — Không tìm thấy blog: {slug}
      </div>
    );
  }

  // Hiển thị nội dung blog
  return (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={blog.banner}
          alt={blog.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <h1 className="text-white text-2xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
            {blog.title}
          </h1>
        </div>
      </div>

      {/* Nội dung chính */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Mô tả ngắn */}
        {blog.description && (
          <p className="md:text-lg p-4 text-muted-foreground text-xl">
            {blog.description}
          </p>
        )}

        {/* Hoạt động & trải nghiệm */}
        {blog.activities?.length > 0 && (
          <Section title="Vui chơi & Trải nghiệm">
            <CardGrid items={blog.activities} />
          </Section>
        )}

        {/* Điểm tham quan */}
        {blog.sightseeing?.length > 0 && (
          <Section title="Điểm tham quan">
            <CardGrid items={blog.sightseeing} />
          </Section>
        )}

        {/* Phương tiện */}
        {blog.transport?.length > 0 && (
          <Section title="Phương tiện di chuyển">
            <CardGrid items={blog.transport} />
          </Section>
        )}

        {/* Khách sạn */}
        {blog.hotels?.length > 0 && (
          <Section title="Khách sạn ở khu vực">
            <CardGrid items={blog.hotels} />
          </Section>
        )}

        {/* Thông tin nhanh */}
        {blog.quickInfo && Object.keys(blog.quickInfo).length > 0 && (
          <QuickInfo info={blog.quickInfo} />
        )}

        {/* FAQ */}
        {blog.faq?.length > 0 && <FAQ items={blog.faq} />}
      </main>
    </div>
  );
}

/* ----------- Các component phụ ----------- */

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function CardGrid({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-lg shadow hover:shadow-md overflow-hidden bg-white"
        >
          {item.img && (
            <img
              src={item.img}
              alt={item.name}
              className="h-32 w-full object-cover"
            />
          )}
          <div className="p-3">
            <h3 className="font-semibold text-gray-800">{item.name}</h3>
            {item.price && (
              <p className="text-sm text-blue-600 font-medium">{item.price}</p>
            )}
            {item.description && (
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickInfo({ info }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Thông tin nhanh</h2>

      {info.weather && <InfoRow label="☀️ Thời tiết" value={info.weather} />}
      {info.bestSeason && (
        <InfoRow label="📌 Mùa lý tưởng" value={info.bestSeason} />
      )}
      {info.duration && (
        <InfoRow label="⏳ Thời gian gợi ý" value={info.duration} />
      )}
      {info.language && <InfoRow label="💬 Ngôn ngữ" value={info.language} />}
      {info.distance && (
        <InfoRow label="📍 Khoảng cách" value={info.distance} />
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <p className="text-gray-800">{value}</p>
    </div>
  );
}

function FAQ({ items }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Câu hỏi thường gặp</h2>
      {items.map((faq, idx) => (
        <details
          key={idx}
          className="border rounded-lg p-3 bg-white hover:shadow"
        >
          <summary className="cursor-pointer font-semibold text-gray-700">
            {faq.q}
          </summary>
          <p className="mt-2 text-gray-600">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
