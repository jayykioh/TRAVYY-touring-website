import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, Globe } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Site Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Klook</span>
          </div>

          {/* Search Bar */}
          {/* <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm theo điểm đến, hoạt động"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div> */}

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              List Tours
            </a>
            {/* <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Destinations
            </a>
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              About
            </a> */}
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Search
            </a>
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Login/Sign Up
            </a>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <img src="/api/placeholder/24/16" alt="VN" className="w-6 h-4 rounded" />
              <span>VND</span>
            </div>
            <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button 
              className="lg:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white py-4">
            <div className="flex flex-col space-y-4">
              <div className="px-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm theo điểm đến, hoạt động"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <nav className="flex flex-col space-y-2 px-2">
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors py-2">Home</a>
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors py-2">List Tours</a>
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors py-2">Destinations</a>
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors py-2">About</a>
                <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors py-2">Contact</a>
                
                {/* Mobile Login/Register */}
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <button className="text-gray-700 hover:text-orange-600 transition-colors py-2 text-left">
                    Đăng nhập
                  </button>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-full transition-colors">
                    Đăng ký
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>


    </header>
);
}