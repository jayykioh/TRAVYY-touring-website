import React from 'react';
import { Heart, Github, Mail } from 'lucide-react';

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left Side - Copyright */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>© {currentYear} Travyy Admin Portal.</span>
            <span className="hidden md:inline">Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 hidden md:inline" />
            <span className="hidden md:inline">by Travyy Team</span>
          </div>

          {/* Center - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a 
              href="/docs" 
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Documentation
            </a>
            <a 
              href="/support" 
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Support
            </a>
            <a 
              href="/privacy" 
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Terms
            </a>
          </div>

          {/* Right Side - Social */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="mailto:admin@travyy.com"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom - Version Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Version 1.0.0</span>
            <span>Server Status: <span className="text-green-600 font-medium">● Online</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}