import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Globe, User } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Touring</span>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">List Tours</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Search</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Dropdown ngôn ngữ & tiền tệ */}
            <select className="hidden md:block border border-gray-300 rounded-md text-sm px-2 py-1">
              <option>VN - VND</option>
              <option>EN - USD</option>
            </select>

            {/* Cart */}
            <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile/Login */}
            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium">
              <User className="w-5 h-5" />
              <span>Login/Sign Up</span>
            </button>

            {/* CTA */}
            <button className="hidden md:inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-300">
              Đặt tour ngay
            </button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white py-4">
            <nav className="flex flex-col space-y-2 px-2">
              <a href="#" className="text-gray-700 hover:text-blue-600 py-2">Home</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 py-2">List Tours</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 py-2">Search</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 py-2">About</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 py-2">Contact</a>

              {/* CTA trong mobile */}
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-full mt-2">
                Đặt tour ngay
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
