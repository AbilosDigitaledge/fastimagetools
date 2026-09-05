import React from 'react';
import { AppRoute } from '../../types';
import { TOOLS, FAQS } from '../../data';
import FAQSection from '../FAQSection';
import AdPlaceholder from '../AdPlaceholder';
import {
  Zap,
  ShieldCheck,
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

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
}

export default function Home({ onNavigate }: HomeProps) {
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

  const convertTools = TOOLS.filter((t) => t.category === 'convert');
  const resizeTools = TOOLS.filter((t) => t.category === 'resize-crop');
  const metadataTools = TOOLS.filter((t) => t.category === 'metadata-info' || t.category === 'color');

  return (
    <div className="space-y-16 py-4 md:py-10">
      {/* Hero Section */}
      <section id="hero-section" className="text-center max-w-4xl mx-auto px-4 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          100% Client-Side Privacy
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-tight">
          Fast, Free Image Tools <br />
          <span className="text-blue-600">That Run in Your Browser</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Convert, resize, crop, inspect, and optimize images instantly. Your files never leave your device. No signups, no watermarks, and no artificial delays.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('/webp-to-jpg')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/15 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            WebP to JPG Converter
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigate('/svg-to-png')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-bold hover:bg-zinc-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            SVG to PNG Converter
          </button>
        </div>

        <div className="text-xs text-zinc-400 pt-2 font-medium flex items-center justify-center gap-4">
          <span>✔ No Email Required</span>
          <span>•</span>
          <span>✔ Batch Support</span>
          <span>•</span>
          <span>✔ Zero Upload Limits</span>
        </div>
      </section>

      {/* Ad Space below Hero */}
      <AdPlaceholder slot="homepage-top" />

      {/* Visual Tools Grid Groupings */}
      <section id="tools-showcase" className="max-w-6xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Our Local Tool Suite</h2>
          <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto">
            Choose from a set of lightning-fast utilities crafted to process files securely on your device.
          </p>
        </div>

        {/* Category: Convert */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-2.5">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Convert
            </span>
            <span className="text-xs font-semibold text-zinc-400">Batch Format Converters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {convertTools.map((tool) => (
              <div
                key={tool.id}
                className="group relative flex flex-col p-6 rounded-2xl border border-zinc-200/80 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-200"
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
                <div className="mt-5 pt-3 border-t border-zinc-50 flex items-center justify-between text-xs font-bold text-blue-600">
                  <button
                    onClick={() => onNavigate(tool.route)}
                    className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Open Utility
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-100">
                    Offline Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: Resize & Crop */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-2.5">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Resize & Crop
            </span>
            <span className="text-xs font-semibold text-zinc-400">Layout & Cropping utilities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resizeTools.map((tool) => (
              <div
                key={tool.id}
                className="group relative flex flex-col p-6 rounded-2xl border border-zinc-200/80 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-200"
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
                <div className="mt-5 pt-3 border-t border-zinc-50 flex items-center justify-between text-xs font-bold text-blue-600">
                  <button
                    onClick={() => onNavigate(tool.route)}
                    className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Open Utility
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-100">
                    Aspect Lock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: Metadata & Color */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-2.5">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Inspect & Analyze
            </span>
            <span className="text-xs font-semibold text-zinc-400">Metadata removal and color palette tools</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metadataTools.map((tool) => (
              <div
                key={tool.id}
                className="group relative flex flex-col p-5 rounded-2xl border border-zinc-200/80 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-200"
              >
                <div className="p-2.5 rounded-xl bg-zinc-50 group-hover:bg-blue-50/50 group-hover:text-blue-600 transition-colors duration-150 self-start mb-3">
                  {getIcon(tool.iconName)}
                </div>
                <h3 className="text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {tool.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5 flex-grow leading-relaxed line-clamp-3">
                  {tool.description}
                </p>
                <div className="mt-4 pt-3 border-t border-zinc-50 flex items-center justify-between text-xs font-bold text-blue-600">
                  <button
                    onClick={() => onNavigate(tool.route)}
                    className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Open
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Space above FAQs */}
      <AdPlaceholder slot="homepage-bottom" />

      {/* Structured SEO Copy / Editorial */}
      <section id="homepage-seo-content" className="max-w-4xl mx-auto px-4 md:px-6 text-left border-t border-zinc-100 pt-16 space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Free Online Image & Photo Tools</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            FastImage.tools provides a lightweight micro-tool network engineered directly around speed and privacy. Traditional online image converters and crop tools compel you to upload private photographs to distant server networks. This causes significant latency bottlenecks and exposes your sensitive photos to remote storage tracking logs.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed">
            FastImage.tools operates 100% locally. By utilizing advanced client-side web technologies like HTML5 canvas structures, binary array processing layers, and sandbox-isolated DOM nodes, the processing happens inside your native web browser sandbox. This gives you instant rendering, offline capabilities, and perfect digital privacy.
          </p>
        </div>

        {/* FAQ Section */}
        <FAQSection items={FAQS.homepage} title="Frequently Asked Questions" />
      </section>
    </div>
  );
}
