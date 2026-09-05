import React from 'react';
import { AppRoute, ImageTool } from '../types';
import { TOOLS } from '../data';
import {
  RefreshCw,
  FileCode,
  Maximize2,
  Crop,
  Layers,
  Info,
  Sliders,
  ChevronRight,
  Grid
} from 'lucide-react';

interface RelatedToolsProps {
  currentToolId: string;
  onNavigate: (route: AppRoute) => void;
}

export default function RelatedTools({ currentToolId, onNavigate }: RelatedToolsProps) {
  // Get other tools
  const related = TOOLS.filter((t) => t.id !== currentToolId).slice(0, 3);

  const getIcon = (name: string) => {
    const props = { className: 'h-5 w-5 text-zinc-500' };
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
    <section id="related-tools-section" className="my-16 mx-auto w-full max-w-4xl border-t border-zinc-100 pt-16">
      <h2 className="text-xl font-bold text-zinc-800 mb-6 tracking-tight">You may also like these tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {related.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onNavigate(tool.route)}
            className="group flex flex-col items-start p-5 text-left rounded-2xl border border-zinc-200/80 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 focus:outline-none"
          >
            <div className="p-2.5 rounded-xl bg-zinc-50 group-hover:bg-blue-50/50 group-hover:text-blue-600 transition-colors duration-150 mb-3">
              {getIcon(tool.iconName)}
            </div>
            <h3 className="text-sm font-bold text-zinc-800 group-hover:text-blue-600 transition-colors duration-150">
              {tool.name}
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 flex-grow line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:translate-x-1 transition-transform duration-150">
              Open Tool
              <ChevronRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
