import { Facebook, Instagram, Youtube, Twitter, MapPin, Mail, Phone } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <footer className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Main Content */}
      <div className="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section - Takes 2 columns */}
          <div className="sm:col-span-2">
            <div className="inline-flex items-center mb-4">
              <div className="relative">
                <MapPin className="w-8 h-8 text-cyan-500 stroke-[2.5]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              </div>
              <span className="ml-2 text-xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TRAVVY
              </span>
            </div>
            
            <div className="mt-6 lg:max-w-sm">
              <p className="text-sm text-gray-700">
                Nền tảng đặt tour và khám phá du lịch hiện đại. Khám phá thế giới theo cách của bạn với Travvy.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Đơn giản, Nhanh chóng, Đáng tin cậy - Travvy đồng hành cùng mọi hành trình của bạn.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-2 text-sm">
            <p className="text-base font-bold tracking-wide text-gray-900">Contacts</p>
            <div className="flex">
              <p className="mr-1 text-gray-700">Phone:</p>
              <a 
                href="tel:+84123456789" 
                aria-label="Our phone" 
                title="Our phone" 
                className="transition-colors duration-300 text-cyan-600 hover:text-cyan-700"
              >
                +84 123 456 789
              </a>
            </div>
            <div className="flex">
              <p className="mr-1 text-gray-700">Email:</p>
              <a 
                href="mailto:contact@travvy.com" 
                aria-label="Our email" 
                title="Our email" 
                className="transition-colors duration-300 text-cyan-600 hover:text-cyan-700"
              >
                contact@travvy.com
              </a>
            </div>
            <div className="flex">
              <p className="mr-1 text-gray-700">Address:</p>
              <a 
                href="https://www.google.com/maps" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Our address" 
                title="Our address" 
                className="transition-colors duration-300 text-cyan-600 hover:text-cyan-700"
              >
                Da Nang, Vietnam
              </a>
            </div>
          </div>

          {/* Social Section */}
          <div>
            <span className="text-base font-bold tracking-wide text-gray-900">Social</span>
            
            {/* Social Links */}
            <div className="flex items-center mt-1 space-x-3">
              <a 
                href="https://www.twitter.com" 
                className="text-gray-500 transition-colors duration-300 hover:text-cyan-600"
                aria-label="Twitter"
              >
                <Twitter className="h-5" />
              </a>
              <a 
                href="https://www.instagram.com" 
                className="text-gray-500 transition-colors duration-300 hover:text-cyan-600"
                aria-label="Instagram"
              >
                <Instagram className="h-6" />
              </a>
              <a 
                href="https://www.facebook.com" 
                className="text-gray-500 transition-colors duration-300 hover:text-cyan-600"
                aria-label="Facebook"
              >
                <Facebook className="h-5" />
              </a>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-gray-500">
              Khám phá những điểm đến tuyệt vời và trải nghiệm du lịch độc đáo cùng Travvy.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t border-gray-200 lg:flex-row">
          <p className="text-sm text-gray-600">
            © Copyright 2025 Travvy Inc. All rights reserved.
          </p>
          <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
            <li>
              <Link 
                to="/help" 
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-cyan-600"
              >
                F.A.Q
              </Link>
            </li>
            <li>
              <a 
                href="/privacy" 
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-cyan-600"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a 
                href="/terms" 
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-cyan-600"
              >
                Terms &amp; Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}