"use client";

import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  Globe,
  User,
  Menu,
  X,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "../auth/context";
import provinces from "@/mockdata/header_bestspot";

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

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [cartCount, setCartCount] = React.useState(0);
  const navigate = useNavigate();

  const { isAuth } = useAuth();

  // scroll shadow / blur
  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---- Cart badge: đọc từ localStorage + lắng nghe update ----
  const getCartCount = React.useCallback(() => {
    try {
      const raw =
        localStorage.getItem("cart") || localStorage.getItem("cartItems");
      if (!raw) return 0;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr.reduce((sum, item) => sum + (item?.quantity ?? 1), 0);
      }
      return 0;
    } catch {
      return 0;
    }
  }, []);

  React.useEffect(() => {
    setCartCount(getCartCount());

    const onStorage = (e) => {
      if (e.key === "cart" || e.key === "cartItems") {
        setCartCount(getCartCount());
      }
    };
    const onCartUpdated = () => setCartCount(getCartCount());
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart:updated", onCartUpdated);

    // Optional: khi tab lấy lại focus, refresh badge
    const onFocus = () => setCartCount(getCartCount());
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:updated", onCartUpdated);
      window.removeEventListener("focus", onFocus);
    };
  }, [getCartCount]);

  // search
  const onSubmitSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300
        ${
          isScrolled
            ? "bg-white/15 backdrop-blur-xl border-b border-white/20 shadow-lg"
            : "bg-transparent"
        }`}
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Top bar grid: mobile 2 cols, md: auto | 1fr | auto */}
        <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 grid place-items-center shrink-0 ring-1 ring-white/50">
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
                {/* Địa danh nổi tiếng */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/40 transition"
                  >
                    Địa danh nổi tiếng
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
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
                                      className="group flex flex-row items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/30 transition-colors duration-150"
                                    >
                                      {/* Ảnh cố định, không co */}
                                      <img
                                        src={
                                          p.img ||
                                          `https://picsum.photos/seed/${p.slug}/80/80`
                                        }
                                        alt={p.name}
                                        loading="lazy"
                                        className="w-7 h-7 rounded object-cover flex-none ring-1 ring-white/40"
                                      />

                                      {/* Text: không xuống dòng + truncate đúng trong flex */}
                                      <div className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-gray-800 whitespace-nowrap truncate group-hover:text-gray-900 transition-colors">
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

                {/* Tour nổi tiếng */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/40 transition"
                  >
                    Tour nổi tiếng
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
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

                {/* Khám phá ngay */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/40 transition"
                  >
                    Khám phá ngay
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
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

            {/* Search */}
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
                  className="w-full rounded-full border border-white/30 bg-white/20 backdrop-blur-md px-4 py-2 pr-9 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition focus:ring-2 focus:ring-blue-500/60 focus:border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,.3)]"
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
            {isAuth ? (
              // Đã login: có Cart + UserMenu
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/shoppingcarts"
                  className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-gray-800 bg-white/30 backdrop-blur-md border border-white/40 hover:bg-white/40 transition"
                  aria-label="Giỏ hàng"
                  title="Giỏ hàng"
                  state={{ scrollToTop: true }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Giỏ hàng</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[11px] grid place-items-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
                <UserMenu />
              </div>
            ) : (
              // Chưa login
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#155DFC] transition-all hover:scale-110 shadow-sm hover:shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>

                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#155DFC] transition-all hover:scale-110 shadow-sm hover:shadow-md"
                >
                  Đặt tour ngay !
                </Link>
              </div>
            )}

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
          <div className="md:hidden border-t bg-white/70 backdrop-blur-xl py-4">
            <nav className="flex flex-col gap-2 px-3 sm:px-4">
              {/* Search (Mobile) */}
              <form onSubmit={onSubmitSearch} className="mb-2">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Tìm tour, địa điểm..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full rounded-full border border-white/30 bg-white/80 px-4 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Cart trong mobile */}
              {isAuth && (
                <Link
                  to="/shoppingcarts"
                  className="relative inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Giỏ hàng
                  {cartCount > 0 && (
                    <span className="ml-2 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[11px] grid place-items-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {!isAuth && (
                <button className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm mt-2">
                  <User className="w-4 h-4" />
                  Login / Register
                </button>
              )}
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
          className="block rounded-md p-2 hover:bg-white/30 transition"
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
