import React from 'react';
import { AppRoute } from '../../types';
import { TOOLS } from '../../data';
import {
  Zap,
  RefreshCw,
  FileCode,
  Maximize2,
  Crop,
  Layers,
  Info,
  Sliders,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface AllToolsProps {
  onNavigate: (route: AppRoute) => void;
}

export default function AllTools({ onNavigate }: AllToolsProps) {
  const getIcon = (name: string) => {
    const props = { className: 'h-6 w-6 text-blue-600' };
    switch (name) {
      case 'RefreshCw': return <RefreshCw {...props} />;
      case 'FileCode': return <FileCode {...props} />;
      case 'Maximize2': return <Maximize2 {...props} />;
      case 'Crop': return <Crop {...props} />;
      case 'Layers': return <Layers {...props} />;
      case 'Info': return <Info {...props} />;
      case 'Sliders': return <Sliders {...props} />;
      default: return <Zap {...props} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto animate-in fade-in duration-200">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
          All Online Image Utilities
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Explore our suite of lightning-fast client-side micro-tools. Free to use, no account required, processing directly on your local device.
        </p>
      </div>

      {/* Grid containing everything */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {TOOLS.map((tool) => (
          <div
            key={tool.id}
            className="group flex flex-col p-6 rounded-2xl border border-zinc-200 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="p-3 rounded-xl bg-zinc-50 group-hover:bg-blue-50/50 group-hover:text-blue-600 transition-colors duration-150 self-start mb-4">
              {getIcon(tool.iconName)}
            </div>

            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
              {tool.name}
            </h3>

            <p className="text-sm text-zinc-500 mt-2 flex-grow leading-relaxed">
              {tool.description}
            </p>

            <div className="mt-6 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <button
                onClick={() => onNavigate(tool.route)}
                className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                Launch Tool
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-100">
                100% Free
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
