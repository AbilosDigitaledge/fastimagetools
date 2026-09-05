import React from 'react';
import { AppRoute } from '../../types';
import { ShieldCheck, Zap, Cpu, ArrowLeft } from 'lucide-react';

interface AboutProps {
  onNavigate: (route: AppRoute) => void;
}

export default function About({ onNavigate }: AboutProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 text-left">
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">About FastImage.tools</h1>
        <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl">
          FastImage.tools was founded in 2026 on a simple, uncompromising core principle: **image processing tools should be lightning-fast, entirely free, and completely private.**
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white">
          <Zap className="h-6 w-6 text-blue-600 mb-3" />
          <h3 className="font-bold text-zinc-900 text-sm">Instant Rendering</h3>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            By avoiding network roundtrips to upload and download large files, our tools execute in milliseconds directly inside your local browser engine.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 bg-white">
          <ShieldCheck className="h-6 w-6 text-blue-600 mb-3" />
          <h3 className="font-bold text-zinc-900 text-sm">Perfect Privacy</h3>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            No remote logs. Your private photos stay inside your local hardware. We literally have no servers scanning or storing your files.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 bg-white">
          <Cpu className="h-6 w-6 text-blue-600 mb-3" />
          <h3 className="font-bold text-zinc-900 text-sm">Technical Prowess</h3>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Utilizing high-performance HTML5 Canvas APIs, sandbox DOM wrappers, and binary file-header stream parsers to keep things lightweight.
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Why we are different</h2>
        <p className="text-base text-zinc-600 leading-relaxed">
          Most image sites force you through a maze of promotional ads, paywalls, mandatory email signups, and artificial waiting screens (often showing fake "Optimizing..." spinners to look busy). We hate this as much as you do.
        </p>
        <p className="text-base text-zinc-600 leading-relaxed">
          At FastImage.tools, there are no signup walls, no forced accounts, no daily batch conversion limits, and no artificial delays. You drag your files, they convert instantly, and you download them. It’s that simple.
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-950 text-zinc-300 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Open and Monetization-Ready</h3>
        <p className="text-sm leading-relaxed opacity-90">
          FastImage.tools operates as a free developer utility. In the future, we plan to introduce premium capabilities (like advanced vector engines, larger batch streams, and custom presets) and display elegant, non-intrusive ad blocks to support our maintenance costs. Your standard processing will always remain 100% free.
        </p>
      </div>
    </div>
  );
}
