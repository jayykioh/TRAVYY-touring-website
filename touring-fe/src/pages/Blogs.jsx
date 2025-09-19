import { useParams } from "react-router-dom";
import { mockBlogs } from "../mockdata/blogs";
import MainLayout from "@/layout/MainLayout";

export default function DestinationPage() {
  const { slug } = useParams();
  const post = mockBlogs.find((b) => b.slug === slug);

  if (!post) {
    return (
      <div className="p-6 text-center text-lg text-red-500">
        404 — Không tìm thấy địa điểm: {slug}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
        <MainLayout>

        
  <div className="relative h-64 md:h-80 overflow-hidden">
  <img 
    src={post.banner}
    alt={post.title}
    className="w-full h-full object-cover"
    loading="lazy"
    decoding="async"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
    <h1 className="text-white text-2xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
      {post.title}
    </h1>
  </div>
</div>

      {/* Nội dung chính */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Mô tả ngắn */}
        {post.description && (
          <p className="md:text-lg p-4 text-muted-foreground text-xl">{post.description}</p>
        )}



        {/* Hoạt động & trải nghiệm */}
        {post.activities?.length > 0 && (
          <Section title="Vui chơi & Trải nghiệm">
            <CardGrid items={post.activities} />
          </Section>
        )}

        {/* Điểm tham quan */}
        {post.sightseeing?.length > 0 && (
          <Section title="Điểm tham quan">
            <CardGrid items={post.sightseeing} />
          </Section>
        )}

        {/* Phương tiện */}
        {post.transport?.length > 0 && (
          <Section title="Phương tiện di chuyển">
            <CardGrid items={post.transport} />
          </Section>
        )}

        {/* Khách sạn */}
        {post.hotels?.length > 0 && (
          <Section title="Khách sạn ở khu vực">
            <CardGrid items={post.hotels} />
          </Section>
        )}


        {/* Thông tin nhanh */}
        {post.quickInfo && Object.keys(post.quickInfo).length > 0 && (
          <QuickInfo info={post.quickInfo} />
        )}

        {/* FAQ */}
        {post.faq?.length > 0 && <FAQ items={post.faq} />}
      </main>
       </MainLayout>
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
    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Object.entries(info).map(([key, value]) => (
        <div key={key}>
          <p className="text-sm font-semibold text-gray-600 capitalize">
            {formatLabel(key)}
          </p>
          <p className="text-gray-800">{value}</p>
        </div>
      ))}
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

function formatLabel(key) {
  const map = {
    weather: "Thời tiết",
    bestSeason: "Mùa đẹp nhất",
    duration: "Thời gian gợi ý",
    language: "Ngôn ngữ",
    distance: "Khoảng cách"
  };
  return map[key] || key;
 
}
