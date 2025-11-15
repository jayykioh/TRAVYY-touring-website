import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/auth/context";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import LocationCard from "@/components/LocationCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { trackBlogView } = useBehaviorTracking();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasTrackedView = useRef(false);

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
        
        // ✅ Track blog view immediately when blog loads
        if (user?.token && !hasTrackedView.current) {
          // Extract vibes from activities/sightseeing
          const vibes = [
            ...(data.activities?.map(a => a.name) || []),
            ...(data.sightseeing?.map(s => s.name) || [])
          ].filter(Boolean).slice(0, 5);
          
          // Extract province from region or location.address
          const provinces = [data.region, data.location?.address]
            .filter(Boolean)
            .map(p => p.split(',')[0].trim());
          
          trackBlogView(slug, {
            title: data.title,
            tags: vibes,
            provinces: [...new Set(provinces)] // Remove duplicates
          });
          hasTrackedView.current = true;
        }
      })
      .catch((err) => {
        console.error("Error fetching blog:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug, user?.token, trackBlogView]);

  if (loading) {
    return <BlogSkeleton />;
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
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            {blog.description && (
              <div className="bg-white rounded-lg p-6 shadow flex flex-col h-full transition-all duration-500 hover:shadow-xl hover:scale-[1.02] animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
                <p
                  className="text-gray-700 leading-[1.8] flex-1"
                  style={{
                    textAlign: "justify",
                    textJustify: "inter-word",
                    wordSpacing: "0.05em",
                    letterSpacing: "0.01em",
                  }}
                >
                  {blog.description}
                </p>
              </div>
            )}

            {/* Map — dùng LocationCard, bo góc + responsive, fit với card trắng */}
            {blog.location?.lat && blog.location?.lng && (
              <div
                className="flex flex-col h-full animate-fadeIn"
                style={{ animationDelay: "0.2s" }}
              >
                <LocationCard
                  lat={blog.location.lat}
                  lng={blog.location.lng}
                  title="📍 Vị trí"
                  variant="plain"
                  className="transition-all duration-500 hover:shadow-xl hover:scale-[1.02] h-full"
                />
              </div>
            )}
          </section>
        )}

        {/* Vui chơi & Trải nghiệm */}
        {blog.activities?.length > 0 && (
          <Section title="Vui chơi & Trải nghiệm" delay="0s">
            <CardGrid
              items={blog.activities.map((a) => ({
                name: a.name,
                price: a.price,
                description: a.description,
                img: a.image,
              }))}
            />
          </Section>
        )}

        {/* Điểm tham quan */}
        {blog.sightseeing?.length > 0 && (
          <Section title="Điểm tham quan" delay="0.1s">
            <CardGrid
              items={blog.sightseeing.map((a) => ({
                name: a.name,
                price: a.price,
                description: a.description,
                img: a.image,
              }))}
            />
          </Section>
        )}

        {/* Phương tiện */}
        {blog.transport?.length > 0 && (
          <Section title="Phương tiện" delay="0.2s">
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
          <Section title="Khách sạn" delay="0.3s">
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

/* ----------- Skeleton Component ----------- */
function BlogSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Banner Skeleton */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-gray-200">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <Skeleton className="h-8 md:h-12 w-3/4 bg-white/20" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Description + Map Skeleton */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-lg p-6 shadow">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </section>

        {/* Card Grid Sections Skeleton */}
        {[1, 2, 3].map((section) => (
          <section key={section}>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((card) => (
                <div
                  key={card}
                  className="rounded-lg shadow overflow-hidden bg-white"
                >
                  <Skeleton className="h-32 w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Quick Info Skeleton */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex flex-col bg-gray-50 rounded-lg p-3 space-y-2"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-56 mb-4" />
          {[1, 2, 3].map((faq) => (
            <div key={faq} className="border rounded-lg p-3 bg-white">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ----------- Các component phụ ----------- */

function Section({ title, children, delay = "0s" }) {
  return (
    <section className="animate-fadeIn" style={{ animationDelay: delay }}>
      <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-transparent hover:border-blue-600 transition-all duration-300 hover:text-blue-600 inline-block">
        {title}
      </h2>
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
          className="rounded-lg shadow hover:shadow-xl overflow-hidden bg-white transition-all duration-300 hover:scale-105 hover:-translate-y-1 group animate-slideUp flex flex-col h-full"
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          {item.img && (
            <div className="overflow-hidden h-32 flex-shrink-0">
              <img
                src={item.img}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
              />
            </div>
          )}
          <div className="p-3 flex flex-col flex-grow">
            <h3 className="font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600 line-clamp-2 min-h-[2.5rem]">
              {item.name}
            </h3>
            {item.price && (
              <p className="text-sm text-blue-600 font-medium mt-1">
                {item.price}
              </p>
            )}
            {item.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2 flex-grow">
                {item.description}
              </p>
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
    <div className="bg-white rounded-lg p-6 shadow-md transition-all duration-500 hover:shadow-xl animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-100">
        Thông tin nhanh
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {infoList.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 transition-all duration-300 hover:from-blue-50 hover:to-blue-100 hover:scale-105 hover:shadow-md animate-slideUp border border-gray-100"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <span className="text-2xl mb-2">{item.icon}</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              {item.label}
            </span>
            <span className="text-gray-800 font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQ({ items }) {
  return (
    <div className="space-y-4 animate-fadeIn bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-100">
        Câu hỏi thường gặp
      </h2>
      <div className="space-y-3">
        {items.map((faq, idx) => (
          <details
            key={idx}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300 hover:border-blue-300 animate-slideUp group"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <summary className="cursor-pointer font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">Q:</span>
                {faq.q}
              </span>
              <svg
                className="w-5 h-5 transition-transform duration-300 group-open:rotate-180 flex-shrink-0 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <p className="mt-3 text-gray-600 animate-fadeIn pl-6 border-l-2 border-blue-200">
              <span className="text-blue-600 font-bold">A:</span> {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ----------- Helper functions removed - tracking now handled by backend ----------- */
