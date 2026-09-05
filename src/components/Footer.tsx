import React from 'react';
import { AppRoute } from '../types';
import { TOOLS } from '../data';
import { Zap, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const categories = [
    { title: 'Convert', key: 'convert' },
    { title: 'Resize & Crop', key: 'resize-crop' },
    { title: 'Metadata & Info', key: 'metadata-info' },
    { title: 'Color', key: 'color' },
  ];

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          {/* Logo Column */}
          <div className="md:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 font-bold text-xl text-white tracking-tight focus:outline-none"
            >
              <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span>
                FastImage<span className="text-blue-500">.tools</span>
              </span>
            </button>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Fast, free, and private image tools running entirely in your browser. Your images remain on your device. No remote uploads, no waiting.
            </p>
            <div className="pt-4 border-t border-zinc-800 max-w-xs space-y-1">
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Have questions?</p>
              <a 
                href="mailto:abilosdigitaledge1@gmail.com" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                abilosdigitaledge1@gmail.com
              </a>
            </div>
          </div>

          {/* Tools Categories Columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">{cat.title}</h3>
                <ul className="space-y-2">
                  {TOOLS.filter((t) => t.category === cat.key).map((tool) => (
                    <li key={tool.id}>
                      <button
                        onClick={() => onNavigate(tool.route)}
                        className="text-sm text-zinc-400 hover:text-white transition-colors duration-150 text-left"
                      >
                        {tool.name.replace(' Batch Converter', '').replace(' & Inspector', '').replace(' Tool', '')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Support / Info Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Product</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/all-tools')} className="text-sm text-zinc-400 hover:text-white transition-colors duration-150">
                  All Image Tools
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="text-sm text-zinc-400 hover:text-white transition-colors duration-150">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="text-sm text-zinc-400 hover:text-white transition-colors duration-150">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="text-sm text-zinc-400 hover:text-white transition-colors duration-150">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="text-sm text-zinc-400 hover:text-white transition-colors duration-150">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 space-y-4 md:space-y-0">
          <div>
            <p>© 2026 FastImage.tools. All tools run client-side in your browser.</p>
          </div>
          <div className="flex items-center gap-1">
            <span>Built client-side with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>using React & TypeScript.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
