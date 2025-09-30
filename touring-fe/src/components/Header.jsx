"use client";

import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, User, Menu, X, Search } from "lucide-react";
import { useAuth } from "../auth/context";


import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../components/ui/navigation-menu";
import UserMenu from "./UsersMenu";

const tours = [
  { 
    title: "Miền Bắc",
    href: "/tours/north",
    description: "Hà Nội, Sapa, Hạ Long và nhiều điểm đến nổi tiếng.",
  },
  {
    title: "Miền Trung",
    href: "/tours/central",
    description: "Đà Nẵng, Hội An, Huế với cảnh quan và di sản văn hoá.",
  },
  {
    title: "Miền Nam",
    href: "/tours/south",
    description: "TP.HCM, Cần Thơ, miền Tây sông nước và Côn Đảo.",
  },
];

const provinces = [
  {
    region: "Miền Bắc",
    items: [
      {
        name: "Hà Nội",
        slug: "ha-noi",
        img: "https://images.unsplash.com/photo-1542889601-3996e3c9f3b8?q=80&w=400",
      },
      {
        name: "Sapa - Lào Cai",
        slug: "sapa",
        img: "https://images.unsplash.com/photo-1509978778156-518eea009755?q=80&w=400",
      },
      {
        name: "Hạ Long - Quảng Ninh",
        slug: "ha-long",
        img: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=400",
      },
      {
        name: "Ninh Bình",
        slug: "ninh-binh",
        img: "https://images.unsplash.com/photo-1563245372-4315d6d78d66?q=80&w=400",
      },
      {
        name: "Hà Giang",
        slug: "ha-giang",
        img: "https://images.unsplash.com/photo-1595147389795-37094173bfd6?q=80&w=400",
      },
    ],
  },
  {
    region: "Miền Trung",
    items: [
      {
        name: "Đà Nẵng",
        slug: "da-nang",
        img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=400",
      },
      {
        name: "Hội An - Quảng Nam",
        slug: "hoi-an",
        img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=400",
      },
      {
        name: "Huế - Thừa Thiên",
        slug: "hue",
        img: "https://images.unsplash.com/photo-1583394293214-28f49b85b5e9?q=80&w=400",
      },
      {
        name: "Quy Nhơn - Bình Định",
        slug: "quy-nhon",
        img: "https://images.unsplash.com/photo-1627199999055-5a4d09bcf2c0?q=80&w=400",
      },
      {
        name: "Phú Yên",
        slug: "phu-yen",
        img: "https://images.unsplash.com/photo-1613553474177-6e8c5f0d9c75?q=80&w=400",
      },
    ],
  },
  {
    region: "Miền Nam",
    items: [
      {
        name: "TP. Hồ Chí Minh",
        slug: "ho-chi-minh",
        img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400",
      },
      {
        name: "Cần Thơ",
        slug: "can-tho",
        img: "https://images.unsplash.com/photo-1584776290844-7a5f8d4cf66a?q=80&w=400",
      },
      {
        name: "Vũng Tàu",
        slug: "vung-tau",
        img: "https://images.unsplash.com/photo-1558980664-10dfc86b3ad9?q=80&w=400",
      },
      {
        name: "Phan Thiết - Mũi Né",
        slug: "phan-thiet",
        img: "https://images.unsplash.com/photo-1558980663-1c0c8f7f3f07?q=80&w=400",
      },
      {
        name: "Phú Quốc",
        slug: "phu-quoc",
        img: "https://images.unsplash.com/photo-1596516109370-7a3dbfc2a76a?q=80&w=400",
      },
    ],
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();

const { isAuth } = useAuth();









  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Top bar grid: mobile 2 cols, md: auto | 1fr | auto */}
        <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-pink-500 grid place-items-center shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Travyy
            </span>
          </Link>

          {/* Navigation + Search (Tablet/Desktop). Ẩn trên mobile */}
          <div className="hidden md:flex items-center min-w-0">
            <NavigationMenu className="shrink-0">
              <NavigationMenuList className="items-center">
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    Địa danh nổi tiếng
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[280px] sm:w-[420px] md:w-[560px] lg:w-[700px] p-3">
                      <h3 className="text-sm font-medium mb-3 text-gray-700">
                        Khám phá theo tỉnh/thành
                      </h3>

                      {/* Responsive grid: 2 col mobile, 3 col md, 4 col lg+ */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {provinces.map((region) => (
                          <div key={region.region} className="space-y-1.5">
                            <h4 className="text-xs font-medium text-gray-600 px-1 uppercase tracking-wide">
                              {region.region}
                            </h4>

                            <ul className="space-y-0.5">
                              {region.items.map((p) => (
                                <li key={p.slug}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={`/destinations/${p.slug}`}
                                      className="group flex flex-row items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-150"
                                    >
                                      {/* Ảnh cố định, không co */}
                                      <img
                                        src={
                                          p.img ||
                                          `https://picsum.photos/seed/${p.slug}/80/80`
                                        }
                                        alt={p.name}
                                        loading="lazy"
                                        className="w-7 h-7 rounded object-cover flex-none"
                                      />

                                      {/* Text: không xuống dòng + truncate đúng trong flex */}
                                      <div className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-gray-700 whitespace-nowrap truncate group-hover:text-gray-900 transition-colors">
                                          {p.name}
                                        </span>
                                      </div>
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Tour nổi tiếng</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 md:w-[420px] lg:w-[520px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tours"
                            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline select-none focus:shadow-md"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">
                              Khám phá tour
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              Hàng trăm tour chất lượng, từ city tour đến nghỉ
                              dưỡng.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {tours.map((tour) => (
                        <ListItem
                          key={tour.title}
                          href={tour.href}
                          title={tour.title}
                        >
                          {tour.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Khám phá ngay</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 md:w-[420px] lg:w-[520px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tours"
                            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline select-none focus:shadow-md"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">
                              Khám phá tour
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              Hàng trăm tour chất lượng, từ city tour đến nghỉ
                              dưỡng.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {tours.map((tour) => (
                        <ListItem
                          key={tour.title}
                          href={tour.href}
                          title={tour.title}
                        >
                          {tour.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <form
              onSubmit={onSubmitSearch}
              className="ml-4 flex-1 max-w-md lg:max-w-xs"
            >
              <div className="relative">
                <input
                  type="search"
                  placeholder="Tìm tour, địa điểm..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full rounded-full border border-gray-300 bg-white/80 px-4 py-2 pr-9 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
                  aria-label="Search tours"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  aria-label="Submit search"
                  title="Tìm kiếm"
                >
                  <Search className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </form>
          </div>

          {/* Actions + Mobile toggle */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
           { (
    
        isAuth ? (
      // Đã login
          <UserMenu />
    ) : (
      // Chưa login
      <div className="hidden sm:flex items-center gap-3">
        <Link to="/login" className="text-sm hover:underline inline-flex items-center gap-1.5">
          <User className="w-4 h-4" /> Login
        </Link>
        <Link to="/register" className="text-sm hover:underline inline-flex items-center gap-1.5">
          <User className="w-4 h-4" /> Register
        </Link>
      </div>
    )
  )}

            <Link
              to="/booking"
              className="hidden md:inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-md transition"
            >
              Đặt tour ngay
            </Link>

            <button
              className="md:hidden inline-flex p-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <nav className="flex flex-col gap-2 px-3 sm:px-4">
              {/* Search (Mobile) */}
              <form onSubmit={onSubmitSearch} className="mb-2">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Tìm tour, địa điểm..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Search tours"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    aria-label="Submit search"
                    title="Tìm kiếm"
                  >
                    <Search className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </form>

              <Link to="/" className="py-2 text-gray-700 hover:text-blue-600">
                Home
              </Link>
              {tours.map((tour) => (
                <Link
                  key={tour.href}
                  to={tour.href}
                  className="py-2 text-gray-700 hover:text-blue-600"
                >
                  {tour.title}
                </Link>
              ))}
              <Link
                to="/about"
                className="py-2 text-gray-700 hover:text-blue-600"
              >
                About
              </Link>

              <Link
                to="/booking"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-full mt-2 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Đặt tour ngay
              </Link>

              <button className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm mt-2">
                <User className="w-4 h-4" />
                Login / Register
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function ListItem({ title, children, href }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className="block rounded-md p-2 hover:bg-gray-50 focus:bg-gray-50"
        >
          <div className="text-sm font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
