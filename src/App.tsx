import React, { useState, useEffect } from 'react';
import { AppRoute, ImageTool } from './types';
import { TOOLS, FAQS } from './data';

// Layout & Static components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RelatedTools from './components/RelatedTools';
import FAQSection from './components/FAQSection';
import AdPlaceholder from './components/AdPlaceholder';
import SEOContent from './components/SEOContent';

// Tool interactive workspaces
import WebPToJPG from './components/tools/WebPToJPG';
import SVGToPNG from './components/tools/SVGToPNG';
import AspectRatioResizer from './components/tools/AspectRatioResizer';
import CircleCrop from './components/tools/CircleCrop';
import ExifStripper from './components/tools/ExifStripper';
import DpiChecker from './components/tools/DpiChecker';
import ColorExtractor from './components/tools/ColorExtractor';

// General Pages
import Home from './components/pages/Home';
import AllTools from './components/pages/AllTools';
import About from './components/pages/About';
import Privacy from './components/pages/Privacy';
import Terms from './components/pages/Terms';
import Contact from './components/pages/Contact';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    const path = window.location.pathname as AppRoute;
    const validRoutes: AppRoute[] = [
      '/',
      '/webp-to-jpg',
      '/svg-to-png',
      '/aspect-ratio-resizer',
      '/remove-exif-data',
      '/image-color-extractor',
      '/circle-crop',
      '/dpi-checker',
      '/all-tools',
      '/about',
      '/privacy',
      '/terms',
      '/contact'
    ];
    return validRoutes.includes(path) ? path : '/';
  });

  // Track browser navigation popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as AppRoute;
      const validRoutes: AppRoute[] = [
        '/',
        '/webp-to-jpg',
        '/svg-to-png',
        '/aspect-ratio-resizer',
        '/remove-exif-data',
        '/image-color-extractor',
        '/circle-crop',
        '/dpi-checker',
        '/all-tools',
        '/about',
        '/privacy',
        '/terms',
        '/contact'
      ];
      setCurrentRoute(validRoutes.includes(path) ? path : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: AppRoute) => {
    window.history.pushState(null, '', route);
    setCurrentRoute(route);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Find tool configurations for active route
  const activeTool = TOOLS.find((t) => t.route === currentRoute);

  const getToolWorkspace = (id: string) => {
    switch (id) {
      case 'webp-to-jpg':
        return <WebPToJPG />;
      case 'svg-to-png':
        return <SVGToPNG />;
      case 'aspect-ratio-resizer':
        return <AspectRatioResizer />;
      case 'circle-crop':
        return <CircleCrop />;
      case 'remove-exif-data':
        return <ExifStripper />;
      case 'dpi-checker':
        return <DpiChecker />;
      case 'image-color-extractor':
        return <ColorExtractor />;
      default:
        return <div className="text-center p-8 text-zinc-500 font-semibold">Workspace Loading...</div>;
    }
  };

  const getCategoryDetails = (catName: string) => {
    switch (catName) {
      case 'convert':
        return { name: 'Convert', route: '/' as AppRoute };
      case 'resize-crop':
        return { name: 'Resize & Crop', route: '/' as AppRoute };
      case 'metadata-info':
        return { name: 'Image Information', route: '/' as AppRoute };
      case 'color':
        return { name: 'Color Palette', route: '/' as AppRoute };
      default:
        return { name: 'Utilities', route: '/' as AppRoute };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/40 text-zinc-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-800">
      {/* Navigation Header */}
      <Navbar currentRoute={currentRoute} onNavigate={navigateTo} />

      {/* Main Container */}
      <main className="flex-grow">
        {activeTool ? (
          /* Tool View Hierarchy layout */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header / Titles Section */}
            <header className="max-w-4xl mx-auto text-left space-y-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-xs font-bold text-blue-600 uppercase tracking-wide">
                ⚡ Client-Side Utility
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">
                {activeTool.name}
              </h1>
              <p className="text-sm md:text-base text-zinc-500 leading-relaxed max-w-2xl font-medium">
                {activeTool.description}
              </p>
            </header>

            {/* Interactive workspace space */}
            <section id="interactive-tool-workspace" className="max-w-5xl mx-auto p-1 bg-transparent rounded-2xl">
              {getToolWorkspace(activeTool.id)}
            </section>

            {/* In-content advertisement marker */}
            <AdPlaceholder slot={`tool-page-mid-${activeTool.id}`} />

            {/* Educational content blocks / SEO structured data */}
            <SEOContent
              toolId={activeTool.id}
              toolName={activeTool.name}
              longDescription={activeTool.longDescription}
              faqItems={FAQS[activeTool.id] || []}
              onNavigate={navigateTo}
              categoryName={getCategoryDetails(activeTool.category).name}
              categoryRoute={getCategoryDetails(activeTool.category).route}
            />

            {/* Related Tools Recommendation */}
            <RelatedTools currentToolId={activeTool.id} onNavigate={navigateTo} />
          </div>
        ) : (
          /* Non-tool / Static Page Views */
          <div className="max-w-7xl mx-auto py-4">
            {currentRoute === '/' && <Home onNavigate={navigateTo} />}
            {currentRoute === '/all-tools' && <AllTools onNavigate={navigateTo} />}
            {currentRoute === '/about' && <About onNavigate={navigateTo} />}
            {currentRoute === '/privacy' && <Privacy onNavigate={navigateTo} />}
            {currentRoute === '/terms' && <Terms onNavigate={navigateTo} />}
            {currentRoute === '/contact' && <Contact onNavigate={navigateTo} />}
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
