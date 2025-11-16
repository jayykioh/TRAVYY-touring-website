import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { MapPin, Mail, Phone, Twitter, Instagram, Facebook, Youtube } from "lucide-react";
import routesConfig from "../utils/routesConfig";
import logo from "../assets/logo.png"; // Lấy logo từ Header

// Thứ tự hiển thị các nhóm trong footer
const FOOTER_GROUPS_ORDER = ["Khám Phá", "Sản Phẩm", "Hỗ Trợ", "Tài Khoản"];

function flattenFooterRoutes(routes) {
  const allowed = routes.filter((r) => r.showInFooter);
  const groups = {};

  allowed.forEach((r) => {
    const safePath = r.path.split('/:')[0];
    const g = r.group || "other";
    groups[g] = groups[g] || [];
    if (!groups[g].some((item) => item.path === r.path)) {
      groups[g].push({ ...r, safePath });
    }
  });

  return groups;
}

export default function Footer() {
  const location = useLocation();
  const groups = useMemo(() => flattenFooterRoutes(routesConfig), []);

  const CONTACT = {
    phone: "+84 093614790",
    email: "travy92@gmail.com",
    addressLabel: "Da Nang, Vietnam",
    addressUrl: "https://maps.app.goo.gl/example",
  };

  const SOCIAL = [
    { href: "https://www.twitter.com", icon: <Twitter className="h-5 w-5" /> },
    { href: "https://www.instagram.com", icon: <Instagram className="h-5 w-5" /> },
    { href: "https://www.facebook.com", icon: <Facebook className="h-5 w-5" /> },
    { href: "https://www.youtube.com", icon: <Youtube className="h-5 w-5" /> },
  ];

  const footerGroups = FOOTER_GROUPS_ORDER
    .map((groupName) => ({ name: groupName, items: groups[groupName] || [] }))
    .filter((g) => g.items.length > 0)
    .slice(0, 3);

  const gridClass = footerGroups.length === 3 ? "lg:grid-cols-5" : "lg:grid-cols-4";

  return (
    <footer className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className={`grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 ${gridClass}`}>

          {/* Logo & Intro (chiếm 2 cột trên màn hình lớn) */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Travvy logo" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-xl font-extrabold tracking-tight text-gray-900">TRAVVY</div>
                <div className="text-xs text-gray-600">Explore. Book. Travel.</div>
              </div>
            </div>

            <div className="mt-4 lg:max-w-sm">
              <p className="text-sm text-gray-700">
                Nền tảng đặt tour và khám phá du lịch hiện đại. Khám phá thế giới theo
                cách của bạn với Travvy.
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Đơn giản, nhanh chóng, đáng tin cậy — Travvy đồng hành cùng mọi hành
                trình của bạn.
              </p>
            </div>
          </div>

          {/* Dynamic Link Groups */}
          {footerGroups.map((group) => (
            <div key={group.name} className="space-y-2 text-sm">
              <p className="text-base font-semibold tracking-wide text-gray-900">{group.name}</p>
              <div className="flex flex-col mt-2 space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.safePath}
                    className={`text-sm text-gray-600 transition-colors duration-200 hover:text-cyan-600 ${
                      location.pathname === item.safePath ? "font-semibold text-cyan-700" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Contact & Social */}
          <div>
            <span className="text-base font-semibold tracking-wide text-gray-900">Liên hệ</span>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-cyan-600" />
                <a href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`} className="hover:text-cyan-700">
                  {CONTACT.phone}
                </a>
              </div>

              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-cyan-600" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-cyan-700">
                  {CONTACT.email}
                </a>
              </div>

              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-cyan-600" />
                <a href={CONTACT.addressUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-700">
                  {CONTACT.addressLabel}
                </a>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-base font-semibold tracking-wide text-gray-900">Theo dõi</span>
              <div className="flex items-center mt-2 space-x-3">
                {SOCIAL.map((s, idx) => (
                  <a key={idx} href={s.href} target="_blank" rel="noopener noreferrer" aria-label="social" className="text-gray-500 hover:text-cyan-600 transition">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t border-gray-200 lg:flex-row">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} Travvy Inc. All rights reserved.</p>

          <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
            {(groups["Pháp Lý"] || []).map((link) => (
              <li key={link.path}>
                <Link to={link.safePath} className="text-sm text-gray-600 transition-colors duration-200 hover:text-cyan-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
</footer>
  );
}
