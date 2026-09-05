import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types';
import { TOOLS } from '../data';
import {
  Menu,
  X,
  ChevronDown,
  Zap,
  RefreshCw,
  FileCode,
  Maximize2,
  Crop,
  Layers,
  Info,
  Sliders,
  Grid
} from 'lucide-react';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export default function Navbar({ currentRoute, onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  // Close menus on navigation
  const handleNavigation = (route: AppRoute) => {
    onNavigate(route);
    setIsMobileMenuOpen(false);
    setIsToolsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#tools-dropdown-container')) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getIcon = (name: string) => {
    const props = { className: 'h-4 w-4 shrink-0' };
    switch (name) {
      case 'RefreshCw': return <RefreshCw {...props} />;
      case 'FileCode': return <FileCode {...props} />;
      case 'Maximize2': return <Maximize2 {...props} />;
      case 'Crop': return <Crop {...props} />;
      case 'Layers': return <Layers {...props} />;
      case 'Info': return <Info {...props} />;
      case 'Sliders': return <Sliders {...props} />;
      default: return <Grid {...props} />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2.5 font-bold text-xl text-zinc-900 tracking-tight group focus:outline-none"
            >
              <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors duration-150">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span>
                FastImage<span className="text-blue-600">.tools</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNavigation('/')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === '/'
                  ? 'bg-zinc-50 text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/60'
              }`}
            >
              Home
            </button>

            {/* Tools Dropdown */}
            <div id="tools-dropdown-container" className="relative">
              <button
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isToolsDropdownOpen ||
                  ['/webp-to-jpg', '/svg-to-png', '/aspect-ratio-resizer', '/remove-exif-data', '/image-color-extractor', '/circle-crop', '/dpi-checker'].includes(currentRoute)
                    ? 'text-zinc-900 font-semibold bg-zinc-50'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/60'
                }`}
              >
                Tools
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-zinc-200 shadow-lg p-2.5 space-y-0.5 animate-in fade-in slide-in-from-top-3 duration-150">
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                    All Utilities
                  </div>
                  {TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleNavigation(tool.route)}
                      className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-all ${
                        currentRoute === tool.route
                          ? 'bg-blue-50/50 text-blue-700'
                          : 'hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md mt-0.5 ${
                        currentRoute === tool.route ? 'bg-blue-100/50 text-blue-600' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {getIcon(tool.iconName)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{tool.name}</div>
                        <div className="text-[10px] text-zinc-400 line-clamp-1">{tool.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavigation('/about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === '/about'
                  ? 'bg-zinc-50 text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/60'
              }`}
            >
              About
            </button>

            <button
              onClick={() => handleNavigation('/privacy')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === '/privacy'
                  ? 'bg-zinc-50 text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/60'
              }`}
            >
              Privacy
            </button>

            {/* CTA Button */}
            <button
              onClick={() => handleNavigation('/all-tools')}
              className="ml-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
            >
              All Image Tools
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white py-3 px-4 space-y-2 animate-in fade-in duration-200">
          <div className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase px-3 py-1">
            General Pages
          </div>
          <button
            onClick={() => handleNavigation('/')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentRoute === '/' ? 'bg-zinc-50 text-zinc-900 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavigation('/all-tools')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentRoute === '/all-tools' ? 'bg-zinc-50 text-zinc-900 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            All Image Tools
          </button>

          <div className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase px-3 py-1 pt-2">
            Interactive Tools
          </div>
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleNavigation(tool.route)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                currentRoute === tool.route ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <span className={currentRoute === tool.route ? 'text-blue-600' : 'text-zinc-400'}>
                {getIcon(tool.iconName)}
              </span>
              <span>{tool.name}</span>
            </button>
          ))}

          <div className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase px-3 py-1 pt-2">
            Company
          </div>
          <button
            onClick={() => handleNavigation('/about')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentRoute === '/about' ? 'bg-zinc-50 text-zinc-900 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => handleNavigation('/privacy')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentRoute === '/privacy' ? 'bg-zinc-50 text-zinc-900 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            Privacy Policy
          </button>
        </div>
      )}
    </nav>
  );
}
