import React, { useState, useEffect, useRef } from 'react';
import FileDropzone from '../FileDropzone';
import {
  Download,
  Trash2,
  RefreshCw,
  Settings,
  Sliders,
  Maximize2,
  ImageIcon,
  Crop as CropIcon,
  Palette
} from 'lucide-react';

interface Preset {
  name: string;
  label: string;
  ratio: number;
}

const PRESETS: Preset[] = [
  { name: '1:1', label: 'Square (Instagram, Profile)', ratio: 1 },
  { name: '16:9', label: 'Landscape (YouTube, HD)', ratio: 16 / 9 },
  { name: '9:16', label: 'Portrait (TikTok, Stories)', ratio: 9 / 16 },
  { name: '4:3', label: 'Classic TV / Print', ratio: 4 / 3 },
  { name: '3:2', label: 'DSLR Photo / Print', ratio: 3 / 2 },
  { name: '2:3', label: 'Vertical Pinterest', ratio: 2 / 3 },
  { name: '3:4', label: 'Pinterest Pins', ratio: 3 / 4 },
];

export default function AspectRatioResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  const [activePreset, setActivePreset] = useState<string>('1:1');
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(800);
  const [mode, setMode] = useState<'crop' | 'fit'>('crop');
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'black'>('transparent');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  // Load and analyze the uploaded file
  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);

    const rawUrl = URL.createObjectURL(f);
    setOriginalUrl(rawUrl);

    const img = new Image();
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      // Default dimensions based on natural size but locked to preset ratio
      handlePresetChange('1:1', img.naturalWidth, img.naturalHeight);
    };
    img.src = rawUrl;
  };

  const handlePresetChange = (presetName: string, naturalWidth?: number, naturalHeight?: number) => {
    setActivePreset(presetName);
    const w = naturalWidth || imgDimensions?.width || 800;
    const h = naturalHeight || imgDimensions?.height || 800;

    if (presetName === 'custom') {
      setWidth(w);
      setHeight(h);
      return;
    }

    const selectedPreset = PRESETS.find((p) => p.name === presetName);
    if (!selectedPreset) return;

    const ratio = selectedPreset.ratio;
    // Set a reasonable target width and height matching ratio
    if (ratio >= 1) {
      const targetW = Math.min(w, 2000);
      setWidth(targetW);
      setHeight(Math.round(targetW / ratio));
    } else {
      const targetH = Math.min(h, 2000);
      setHeight(targetH);
      setWidth(Math.round(targetH * ratio));
    }
  };

  // Generate output on settings change
  useEffect(() => {
    if (!originalUrl || !imgDimensions) return;
    generateResizedImage();
  }, [originalUrl, imgDimensions, width, height, mode, bgMode]);

  const generateResizedImage = async () => {
    if (!file || !originalUrl || !imgDimensions) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load original image'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create 2D canvas context');

      // 1. Draw Background
      if (bgMode === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      } else if (bgMode === 'black') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      } else {
        // Transparent PNG
        ctx.clearRect(0, 0, width, height);
      }

      // 2. Draw scaled image centered
      const imgW = imgDimensions.width;
      const imgH = imgDimensions.height;

      if (mode === 'crop') {
        // Crop: Fill and clip
        const scale = Math.max(width / imgW, height / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        // Fit: Fit and letterbox
        const scale = Math.min(width / imgW, height / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }

      const format = bgMode === 'transparent' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), format, 0.95);
      });

      if (!blob) throw new Error('Blob generation failed');

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const nextUrl = URL.createObjectURL(blob);
      setOutputUrl(nextUrl);
      setOutputSize(blob.size);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomWidthChange = (wVal: number) => {
    if (wVal <= 0) return;
    setWidth(wVal);
    if (activePreset !== 'custom') {
      const selectedPreset = PRESETS.find((p) => p.name === activePreset);
      if (selectedPreset) {
        setHeight(Math.round(wVal / selectedPreset.ratio));
      }
    }
  };

  const handleCustomHeightChange = (hVal: number) => {
    if (hVal <= 0) return;
    setHeight(hVal);
    if (activePreset !== 'custom') {
      const selectedPreset = PRESETS.find((p) => p.name === activePreset);
      if (selectedPreset) {
        setWidth(Math.round(hVal * selectedPreset.ratio));
      }
    }
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFile(null);
    setOriginalUrl(null);
    setOutputUrl(null);
    setImgDimensions(null);
    setOutputSize(null);
    setActivePreset('1:1');
    setWidth(800);
    setHeight(800);
    setMode('crop');
    setBgMode('transparent');
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {!file ? (
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          accept="image/*"
          multiple={false}
          label="Drop an image here"
          subLabel="Upload PNG, JPG, BMP, or WebP to resize"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main workspace interactive canvas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Resizing Preview</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{file.name}</p>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Start Over
                </button>
              </div>

              {/* Preview Container */}
              <div className="relative aspect-video w-full rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center p-6 shadow-inner min-h-[300px]">
                {/* Checkerboard backdrop */}
                {bgMode === 'transparent' && (
                  <div
                    className="absolute inset-0 z-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        'radial-gradient(#000 20%, transparent 20%), radial-gradient(#000 20%, transparent 20%)',
                      backgroundPosition: '0 0, 8px 8px',
                      backgroundSize: '16px 16px',
                    }}
                  />
                )}
                {isProcessing ? (
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                    <span className="text-xs font-bold text-zinc-500">Processing...</span>
                  </div>
                ) : outputUrl ? (
                  <img
                    src={outputUrl}
                    alt="Resized preview"
                    referrerPolicy="no-referrer"
                    className="relative z-10 max-h-[340px] max-w-full object-contain rounded-md shadow-md border border-zinc-100"
                  />
                ) : (
                  <ImageIcon className="h-10 w-10 text-zinc-300" />
                )}
              </div>

              {/* Status details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-500 border-t border-zinc-100 pt-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Original size</span>
                  <span className="text-zinc-700 font-semibold text-sm">
                    {imgDimensions ? `${imgDimensions.width} × ${imgDimensions.height} px` : 'Analyzing...'}
                  </span>
                  <span className="text-zinc-400 text-xs block mt-0.5">({formatSize(file.size)})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Output Target</span>
                  <span className="text-blue-600 font-bold text-sm">
                    {width} × {height} px
                  </span>
                  {outputSize && (
                    <span className="text-zinc-500 text-xs block mt-0.5">({formatSize(outputSize)})</span>
                  )}
                </div>
              </div>

              {/* Download Button */}
              {outputUrl && (
                <div className="pt-2">
                  <a
                    href={outputUrl}
                    download={`fastimage-resized-${file.name}`}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Download className="h-5 w-5" />
                    Download Resized Image
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Settings panel sidebar */}
          <div className="space-y-6">
            {/* Presets Grid */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Maximize2 className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-zinc-900 text-sm">Select Aspect Ratio</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetChange(preset.name)}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      activePreset === preset.name
                        ? 'border-blue-500 bg-blue-50/20 text-blue-700 font-bold'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50/50'
                    }`}
                  >
                    <div className="font-bold text-sm">{preset.name}</div>
                    <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                      {preset.label.replace(/.*\(|\)/g, '')}
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePresetChange('custom')}
                  className={`p-3 text-left rounded-xl border text-xs transition-all ${
                    activePreset === 'custom'
                      ? 'border-blue-500 bg-blue-50/20 text-blue-700 font-bold'
                      : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50/50'
                  }`}
                >
                  <div className="font-bold text-sm">Custom</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 font-normal">Free dimensions</div>
                </button>
              </div>
            </div>

            {/* Scale dimensions input */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Sliders className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-zinc-900 text-sm">Target Resolution</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="custom-width" className="text-[11px] font-semibold text-zinc-400 uppercase">Width</label>
                  <div className="relative">
                    <input
                      id="custom-width"
                      type="number"
                      min="1"
                      max="4096"
                      value={width}
                      onChange={(e) => handleCustomWidthChange(parseInt(e.target.value) || 0)}
                      disabled={activePreset !== 'custom'}
                      className="w-full text-sm px-3 py-2 pr-8 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-zinc-50 disabled:text-zinc-400 font-semibold"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-zinc-400 font-bold uppercase select-none">px</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="custom-height" className="text-[11px] font-semibold text-zinc-400 uppercase">Height</label>
                  <div className="relative">
                    <input
                      id="custom-height"
                      type="number"
                      min="1"
                      max="4096"
                      value={height}
                      onChange={(e) => handleCustomHeightChange(parseInt(e.target.value) || 0)}
                      disabled={activePreset !== 'custom'}
                      className="w-full text-sm px-3 py-2 pr-8 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-zinc-50 disabled:text-zinc-400 font-semibold"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-zinc-400 font-bold uppercase select-none">px</span>
                  </div>
                </div>
              </div>

              {activePreset !== 'custom' && (
                <p className="text-[10px] text-zinc-400 italic">
                  Dimensions are synchronized automatically with the {activePreset} aspect ratio. Choose "Custom" preset to change values independently.
                </p>
              )}
            </div>

            {/* Sizing Behavior (Crop vs Fit) */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <CropIcon className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-zinc-900 text-sm">Crop vs Fit Behavior</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('crop')}
                  className={`py-3 text-center rounded-xl border transition-all ${
                    mode === 'crop'
                      ? 'border-blue-500 bg-blue-50/20 text-blue-700 font-bold shadow-sm'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider">Crop & Fill</div>
                  <div className="text-[9px] text-zinc-400 mt-1 leading-snug px-2 font-normal">
                    Fills entire area, clips overflow. No black bars.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('fit')}
                  className={`py-3 text-center rounded-xl border transition-all ${
                    mode === 'fit'
                      ? 'border-blue-500 bg-blue-50/20 text-blue-700 font-bold shadow-sm'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider">Fit / Letterbox</div>
                  <div className="text-[9px] text-zinc-400 mt-1 leading-snug px-2 font-normal">
                    Pulls whole image into view. Adds border padding.
                  </div>
                </button>
              </div>

              {/* Canvas Background for Fit mode */}
              {mode === 'fit' && (
                <div className="pt-2 border-t border-zinc-100 space-y-2 animate-in fade-in duration-200">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Border Fill Color
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['transparent', 'white', 'black'] as const).map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBgMode(bg)}
                        className={`py-2 text-[10px] font-bold rounded-lg border uppercase tracking-wider text-center transition-all ${
                          bgMode === bg
                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                            : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
