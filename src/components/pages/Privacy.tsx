import React from 'react';
import { AppRoute } from '../../types';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface PrivacyProps {
  onNavigate: (route: AppRoute) => void;
}

export default function Privacy({ onNavigate }: PrivacyProps) {
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
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Last Updated: August 12, 2026</p>
      </div>

      <div className="space-y-6 text-zinc-600 leading-relaxed text-sm md:text-base">
        <p>
          Your privacy is our absolute highest priority. This policy outlines exactly how <strong>FastImage.tools</strong> handles your digital assets, files, and personal data.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight pt-2">1. Your Files Stay On Your Device</h2>
        <p>
          FastImage.tools operates as a client-side utility network. All image conversions, SVG rasterizations, aspect ratio scaling, cropping, EXIF header purging, and palette extractions are processed locally inside your native web browser. No image data is ever uploaded, transmitted, or stored on our servers. We do not have server-side databases holding user photographs.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight pt-2">2. What Analytics We Collect</h2>
        <p>
          To maintain, debug, and optimize our tools, we may track general product events (such as "Tool opened," "Conversion completed," or "Download clicked") using lightweight analytics hooks. These tracking details contain absolutely no personal file signatures, names, or pixel records. We only measure count metrics to understand which utilities are popular.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight pt-2">3. Cookies and Advertising</h2>
        <p>
          We may display elegant, non-intrusive advertisements on our layout blocks to support maintenance and hosting costs. These ad networks (such as Google AdSense) may place anonymous cookies in your browser to personalize promotional links. You can configure or block cookies directly via your browser preferences at any time.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight pt-2">4. Third-Party Links</h2>
        <p>
          This website may contain links to external web resources. Once you click outside FastImage.tools, you are governed by the privacy guidelines of those external destinations.
        </p>

        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100/60 text-blue-800 text-xs md:text-sm">
          <strong>🔒 Privacy Guarantee:</strong> Since we never receive your files, we physically have no way of sharing them, selling them, or losing them to remote server database breaches. You are in total control of your digital asset pipelines.
        </div>
      </div>
    </div>
  );
}
