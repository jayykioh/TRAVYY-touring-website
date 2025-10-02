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

    fetch(`/api/blogs/${slug}`)
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

  if (loading) {
    return <div className="p-6 text-center">⏳ Đang tải dữ liệu...</div>;
  }

  if (error || !blog) {
    return (
      <div className="p-6 text-center text-lg text-red-500">
        404 — Không tìm thấy blog: {slug}
      </div>
    );
  }

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
        {/* Description + Map side by side */}
        {(blog.description || (blog.location?.lat && blog.location?.lng)) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-white rounded-lg ">
            {/* Description */}
            {blog.description && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
                <p className="text-gray-700 leading-relaxed">
                  {blog.description}
                </p>
              </div>
            )}

            {/* Map */}
            {blog.location?.lat && blog.location?.lng && (
              <div>
                <h2 className="text-2xl font-bold mb-4">📍 Vị trí</h2>
                <div className="rounded-lg overflow-hidden ">
                  <iframe
                    src={`https://maps.google.com/maps?q=${blog.location.lat},${blog.location.lng}&z=14&output=embed`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                  ></iframe>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${blog.location.lat},${blog.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-600 hover:underline text-sm"
                >
                  🔗 Xem trên Google Maps
                </a>
              </div>
            )}
          </section>
        )}

        {/* Vui chơi & Trải nghiệm */}
        {blog.activities?.length > 0 && (
          <Section title="Vui chơi & Trải nghiệm">
            <CardGrid
              items={blog.activities.map((a) => ({
                name: a.name,
                price: a.price,
                description: a.description,
                img: a.image, // đổi key từ image → img
              }))}
            />
          </Section>
        )}

        {/* Điểm tham quan */}
        {blog.sightseeing?.length > 0 && (
          <Section title="Vui chơi & Trải nghiệm">
            <CardGrid
              items={blog.sightseeing.map((a) => ({
                name: a.name,
                price: a.price,
                description: a.description,
                img: a.image, // đổi key từ image → img
              }))}
            />
          </Section>
        )}

        {/* Phương tiện */}
        {blog.transport?.length > 0 && (
          <Section title="Vui chơi & Trải nghiệm">
            <CardGrid
              items={blog.transport.map((a) => ({
                name: a.name,
                price: a.price,
                description: a.description,
                img: a.image,
              }))}
            />
          </Section>
        )}

        {/* Khách sạn */}
        {blog.hotels?.length > 0 && (
          <Section title="Vui chơi & Trải nghiệm">
            <CardGrid
              items={blog.hotels.map((a) => ({
                name: a.name,
                price: a.price,
                description: a.description,
                img: a.image,
              }))}
            />
          </Section>
        )}

        {/* QuickInfo */}
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
  const infoList = [
    { icon: "☀️", label: "Thời tiết", value: info.weather },
    { icon: "📌", label: "Mùa lý tưởng", value: info.bestSeason },
    { icon: "⏳", label: "Thời gian gợi ý", value: info.duration },
    { icon: "💬", label: "Ngôn ngữ", value: info.language },
  ].filter((i) => i.value);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin nhanh</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {infoList.map((item, idx) => (
          <div key={idx} className="flex flex-col bg-gray-50 rounded-lg p-3">
            <span className="text-sm font-semibold text-gray-600">
              {item.icon} {item.label}
            </span>
            <span className="text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
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
