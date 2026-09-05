import React from 'react';
import { AppRoute } from '../../types';
import { ArrowLeft } from 'lucide-react';

interface TermsProps {
  onNavigate: (route: AppRoute) => void;
}

export default function Terms({ onNavigate }: TermsProps) {
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
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Effective Date: August 12, 2026</p>
      </div>

      <div className="space-y-6 text-zinc-600 leading-relaxed text-sm md:text-base">
        <p>
          Welcome to <strong>FastImage.tools</strong>. By accessing our tools, you agree to comply with and be bound by the following terms of service.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight pt-2">1. Acceptance of Terms</h2>
        <p>
          FastImage.tools provides free client-side image processing tools. These utilities are provided "as-is" without warranty of any kind, either express or implied.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight pt-2">2. Usage and Restrictions</h2>
        <p>
          You may use our tools for both personal and commercial projects. However, you are strictly prohibited from attempting to bypass visual limits, inject malicious scripts inside uploaded SVGs, or crawl the application files to perform denial-of-service (DoS) actions.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight pt-2">3. Limitation of Liability</h2>
        <p>
          Because all processing occurs locally in your browser sandbox, FastImage.tools has no access to your digital files. We are not liable for any file corruptions, hardware sluggishness, or memory crashes that may occur due to processing excessively large batch queues. It is your responsibility to manage your device’s browser resource limits.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight pt-2">4. Modifications to the Service</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue any specific tool, route, or feature of FastImage.tools at any time without prior notice.
        </p>
      </div>
    </div>
  );
}
