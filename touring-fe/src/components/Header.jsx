import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, UserPlus, User, Menu, X, Search, ShoppingCart } from "lucide-react";
import { useAuth } from "../auth/context";
import provinces from "@/mockdata/header_bestspot";
import { useCart } from "../hooks/useCart";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../components/ui/navigation-menu";
import UserMenu from "./UsersMenu";
import logo from "../assets/logo.png";
import CartBadge from "./CartBadge";
import SearchBar from "./SearchBar";

/* ----------------------------- Local helpers ----------------------------- */
const tours = [
  { title: "Miền Bắc", href: "/tours/north", description: "Hà Nội, Sapa, Hạ Long và nhiều điểm đến nổi tiếng." },
  { title: "Miền Trung", href: "/tours/central", description: "Đà Nẵng, Hội An, Huế với cảnh quan và di sản văn hoá." },
  { title: "Miền Nam", href: "/tours/south", description: "TP.HCM, Cần Thơ, miền Tây sông nước và Côn Đảo." },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ListItem = React.memo(function ListItem({ title, children, href, onNavigate }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link to={href} className="block rounded-md p-2 hover:bg-white/30 transition" onClick={onNavigate}>
          <div className="text-sm font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});

/* --------------------------------- Header -------------------------------- */
export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth } = useAuth();
  const { totals } = useCart();
  const cartCount = totals?.cartCountAll ?? 0;

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Scroll shadow / blur
  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close with Escape on mobile menu
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const onSubmitSearch = React.useCallback(
    (e) => {
      e.preventDefault();
      const query = q.trim();
      if (!query) return;
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setMobileOpen(false);
    },
    [q, navigate]
  );

  const onNavigate = React.useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-lg" : "bg-transparent"
      )}
    >
      {/* Skip link for accessibility */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black rounded px-3 py-1">
        Bỏ qua tới nội dung chính
      </a>

      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Top bar grid: mobile 2 cols, md: auto | 1fr | auto */}
        <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3 md:gap-4 h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3" aria-label="Trang chủ">
            <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden grid place-items-center">
              <img src={logo} alt="Travyy" loading="eager" className="w-full h-full object-contain" />
            </div>
          </Link>

          {/* Navigation + Search (Tablet/Desktop) */}
          <div className="hidden md:flex items-center min-w-0">
            <NavigationMenu className="shrink-0">
              <NavigationMenuList className="items-center">
                {/* Địa danh nổi tiếng */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-gray-800 hover:bg-white/40 transition">
                    Địa danh nổi tiếng
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-2xl">
                    <div className="w-[260px] sm:w-[420px] md:w-[560px] lg:w-[720px] p-3">
                      <h3 className="text-sm font-medium mb-3 text-gray-700">Khám phá theo tỉnh/thành</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {provinces.map((region) => (
                          <div key={region.region} className="space-y-1.5">
                            <h4 className="text-[11px] font-semibold text-gray-600 px-1 uppercase tracking-wide">{region.region}</h4>
                            <ul className="space-y-0.5">
                              {region.items.map((p) => (
                                <li key={p.slug}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={`/destinations/${p.slug}`}
                                      className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/40 transition-colors"
                                      onClick={onNavigate}
                                    >
                                      <img
                                        src={p.img || `https://picsum.photos/seed/${p.slug}/80/80`}
                                        alt={p.name}
                                        loading="lazy"
                                        className="w-7 h-7 rounded object-cover flex-none ring-1 ring-white/40"
                                      />
                                      <span className="block text-sm font-medium text-gray-800 whitespace-nowrap truncate group-hover:text-gray-900">
                                        {p.name}
                                      </span>
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
                  <NavigationMenuTrigger className="rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-gray-800 hover:bg-white/40 transition">
                    Tour nổi tiếng
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-2xl">
                    <ul className="grid gap-2 md:w-[420px] lg:w-[520px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tours"
                            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline select-none focus:shadow-md"
                            onClick={onNavigate}
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">Khám phá tour</div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              Hàng trăm tour chất lượng, từ city tour đến nghỉ dưỡng.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {tours.map((t) => (
                        <ListItem key={t.title} href={t.href} title={t.title} onNavigate={onNavigate}>
                          {t.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Khám phá ngay */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-gray-800 hover:bg-white/40 transition">
                    Khám phá ngay
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-2xl">
                    <ul className="grid gap-2 md:w-[320px] lg:w-[400px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/available-tours" className="block rounded-md p-4 hover:bg-white/40 transition" onClick={onNavigate}>
                            <div className="text-base font-semibold mb-1">Tours có sẵn</div>
                            <p className="text-muted-foreground text-sm leading-snug">
                              Khám phá các tour du lịch đã được thiết kế sẵn, đa dạng điểm đến và lịch trình.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/ai-tour-creator" className="block rounded-md p-4 hover:bg-white/40 transition" onClick={onNavigate}>
                            <div className="text-base font-semibold mb-1">Tự tạo tour</div>
                            <p className="text-muted-foreground text-sm leading-snug">
                              Tự lên kế hoạch và thiết kế tour du lịch theo ý thích của bạn.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Search (desktop) */}
            <form onSubmit={(e) => e.preventDefault()} className="ml-4 flex-1 max-w-md lg:max-w-xs">
              {/* SearchBar là component riêng, giữ nguyên behavior hiện tại */}
              <SearchBar className="h-4 w-4 text-gray-500" />
            </form>
          </div>

          {/* Actions + Mobile toggle */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-3">
            {isAuth ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <Link
                  to="/shoppingcarts"
                  className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-gray-800 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white/60 transition"
                  aria-label="Giỏ hàng"
                  title="Giỏ hàng"
                  state={{ scrollToTop: true }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Giỏ hàng</span>
                  <CartBadge count={cartCount} />
                </Link>
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#155DFC] transition hover:scale-[1.03] shadow-sm hover:shadow"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#155DFC] transition hover:scale-[1.03] shadow-sm hover:shadow"
                >
                  Đặt tour ngay !
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden inline-flex p-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Mở/đóng menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div id="mobile-menu" className="md:hidden border-t bg-white/80 backdrop-blur-xl py-4">
            <nav className="flex flex-col gap-2 px-3 sm:px-4">
              {/* Search (Mobile) */}
              <form onSubmit={onSubmitSearch} className="mb-2">
                <label htmlFor="m-search" className="sr-only">Tìm kiếm</label>
                <div className="relative">
                  <input
                    id="m-search"
                    type="search"
                    placeholder="Tìm tour, địa điểm..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full rounded-full border border-white/30 bg-white/90 px-4 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Search tours"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1" aria-label="Submit search" title="Tìm kiếm">
                    <Search className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </form>

              <Link to="/" className="py-2 text-gray-800 hover:text-blue-600" onClick={onNavigate}>
                Home
              </Link>

              {tours.map((t) => (
                <Link key={t.href} to={t.href} className="py-2 text-gray-800 hover:text-blue-600" onClick={onNavigate}>
                  {t.title}
                </Link>
              ))}

              <Link to="/about" className="py-2 text-gray-800 hover:text-blue-600" onClick={onNavigate}>
                About
              </Link>

              <Link
                to="/booking"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-full mt-2 text-center"
                onClick={onNavigate}
              >
                Đặt tour ngay
              </Link>

              {/* Cart trong mobile */}
              {isAuth && (
                <Link
                  to="/shoppingcarts"
                  className="relative inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm mt-2"
                  onClick={onNavigate}
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
                <div className="flex gap-2 mt-2">
                  <Link to="/login" className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm" onClick={onNavigate}>
                    <User className="w-4 h-4" />
                    Login / Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
