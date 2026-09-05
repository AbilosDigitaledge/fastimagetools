import React from 'react';
import { AppRoute, FAQItem } from '../types';
import FAQSection from './FAQSection';
import { ShieldCheck, Cpu, Zap, ChevronRight } from 'lucide-react';

interface SEOContentProps {
  toolId: string;
  toolName: string;
  longDescription: string;
  faqItems: FAQItem[];
  onNavigate: (route: AppRoute) => void;
  categoryName: string;
  categoryRoute: AppRoute;
}

export default function SEOContent({
  toolId,
  toolName,
  longDescription,
  faqItems,
  onNavigate,
  categoryName,
  categoryRoute,
}: SEOContentProps) {
  // Define steps based on toolId
  const getSteps = (id: string): string[] => {
    switch (id) {
      case 'webp-to-jpg':
        return [
          'Choose or drag-and-drop one or more WebP files into the uploader.',
          'Adjust the JPG Quality Slider to select your preferred file size and fidelity balance (default is 90%).',
          'Review the live preview, showing original and output dimensions and sizes.',
          'Download individual JPG results or click "Download All JPGs as ZIP" to grab everything in a single click.'
        ];
      case 'svg-to-png':
        return [
          'Select your vector SVG graphics and drop them into the file queue.',
          'Set custom dimensions (width and height in pixels). The aspect ratio lock keeps your designs proportional.',
          'Choose your background option: fully Transparent, solid White, or select a custom brand color.',
          'Download your rasterized high-fidelity PNG image instantly.'
        ];
      case 'aspect-ratio-resizer':
        return [
          'Upload any image (JPG, PNG, or WebP) from your device.',
          'Select a preset ratio (such as 1:1 Square, 16:9 Landscape, or 9:16 Story) or enter custom dimensions.',
          'Select either "Crop" (scales to fill) or "Fit" (scales to preserve full visibility with letterboxing).',
          'Check the output in the interactive preview area and click "Download Resized Image".'
        ];
      case 'circle-crop':
        return [
          'Choose the image you want to crop and upload it to the canvas.',
          'Reposition your photo by dragging and adjust the Zoom slider to center your face or subject perfectly.',
          'Pick a target output size (e.g., 256x256, 512x512, or 1024x1024).',
          'Inspect the circular preview with the transparency checkerboard background and download your transparent PNG.'
        ];
      case 'remove-exif-data':
        return [
          'Drag or select an image file to analyze.',
          'View the metadata inspector which parses and displays embedded metadata like camera tags, GPS coords, and timestamps.',
          'Click "Strip Metadata" to let our local canvas engine filter out non-pixel data segmentations.',
          'Download your cleaned photo with absolute peace of mind.'
        ];
      case 'dpi-checker':
        return [
          'Upload any high-res or print image (such as JPG, PNG, or TIFF).',
          'The analyzer reads the file header segments looking for native physical resolution metadata (DPI/PPI).',
          'View detailed calculations of physical print sizes (in inches and centimeters) at 72, 150, and 300 DPI.',
          'Read our educational guide on DPI versus pixel dimensions for perfect commercial prints.'
        ];
      case 'image-color-extractor':
        return [
          'Upload any graphic, photography, or logo asset.',
          'Our pixel color quantization engine automatically extracts the dominant colors and highlights.',
          'Hover over or view the generated palette containing exact HEX, RGB, and HSL codes.',
          'Simply click on any color swatch to copy the HEX or RGB color string instantly to your clipboard.'
        ];
      default:
        return [
          'Select your image file and upload it.',
          'Configure your desired settings in the sidebar.',
          'Review the processed output preview.',
          'Click download to save your new asset locally.'
        ];
    }
  };

  const steps = getSteps(toolId);

  return (
    <div id="seo-content-container" className="mt-16 mx-auto w-full max-w-4xl text-left border-t border-zinc-100 pt-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-8 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-blue-600 transition-colors">
          Home
        </button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => onNavigate(categoryRoute)} className="hover:text-blue-600 transition-colors">
          {categoryName}
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-800 font-semibold">{toolName}</span>
      </nav>

      {/* Structured Copy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* H2 and Description */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            What is the {toolName}?
          </h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            {longDescription}
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight pt-2">
            How to use the {toolName} in 4 steps
          </h2>
          <ol className="space-y-4">
            {steps.map((step, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600">
                  {idx + 1}
                </span>
                <p className="text-sm md:text-base text-zinc-600 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Why FastImage Sidebar */}
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 tracking-tight">Why FastImage.tools?</h3>

          <div className="space-y-4 text-xs md:text-sm">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-zinc-800">100% Private</h4>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">Images stay local. Processing happens in-browser, never uploaded.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Cpu className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-zinc-800">Instant Speed</h4>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">No upload queue or network bottlenecks. Convert in milliseconds.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-zinc-800">Zero Signup</h4>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">No forced emails, credit cards, subscription popups, or limits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <FAQSection items={faqItems} title={`Frequently Asked Questions on ${toolName}`} />
    </div>
  );
}
