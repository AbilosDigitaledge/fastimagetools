import React, { useState, useEffect } from 'react';
import FileDropzone from '../FileDropzone';
import { ExtractedColor } from '../../types';
import {
  Copy,
  Check,
  RefreshCw,
  Palette,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

export default function ColorExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<ExtractedColor[]>([]);
  const [paletteStyle, setPaletteStyle] = useState<'vibrant' | 'muted' | 'pastel'>('vibrant');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);

    const rawUrl = URL.createObjectURL(f);
    setOriginalUrl(rawUrl);

    extractPalette(rawUrl, paletteStyle);
  };

  useEffect(() => {
    if (originalUrl) {
      extractPalette(originalUrl, paletteStyle);
    }
  }, [paletteStyle, originalUrl]);

  // Extract color palettes client-side
  const extractPalette = async (imgUrl: string, style: 'vibrant' | 'muted' | 'pastel') => {
    setIsExtracting(true);
    setPalette([]);

    try {
      const img = new Image();
      img.src = imgUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      const canvas = document.createElement('canvas');
      // Downsample image significantly to optimize quantization speed and ignore noise
      const size = 32;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get 2D canvas context');

      ctx.drawImage(img, 0, 0, size, size);
      const imgData = ctx.getImageData(0, 0, size, size).data;

      // Color clustering map
      const colorMap: Record<string, { r: number; g: number; b: number; count: number }> = {};

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        // Skip fully transparent pixels
        if (a < 128) continue;

        // Group colors by rounding RGB to nearest 24 to group similar colors
        const roundFactor = 24;
        const rRound = Math.round(r / roundFactor) * roundFactor;
        const gRound = Math.round(g / roundFactor) * roundFactor;
        const bRound = Math.round(b / roundFactor) * roundFactor;
        const key = `${rRound},${gRound},${bRound}`;

        if (!colorMap[key]) {
          colorMap[key] = { r, g, b, count: 0 };
        }
        colorMap[key].count++;
      }

      // Convert map to array and sort by frequency
      const uniqueColors = Object.values(colorMap);
      uniqueColors.sort((a, b) => b.count - a.count);

      // Convert colors to format
      let formattedColors: ExtractedColor[] = uniqueColors.map((col) => {
        const hex = rgbToHex(col.r, col.g, col.b);
        const rgb = `rgb(${col.r}, ${col.g}, ${col.b})`;
        const hslArr = rgbToHsl(col.r, col.g, col.b);
        const hsl = `hsl(${hslArr[0]}, ${hslArr[1]}%, ${hslArr[2]}%)`;
        const percentage = Math.round((col.count / (size * size)) * 100);

        return {
          hex,
          rgb,
          hsl,
          percentage,
        };
      });

      // Filter colors based on style selection
      if (style === 'muted') {
        // Sort by saturation ascending, luminosity balanced
        formattedColors = formattedColors.filter((col) => {
          const hslArr = parseHslString(col.hsl);
          return hslArr[1] < 45; // Low saturation
        });
      } else if (style === 'vibrant') {
        // Sort by saturation descending, lightness balanced
        formattedColors = formattedColors.sort((a, b) => {
          const hslA = parseHslString(a.hsl);
          const hslB = parseHslString(b.hsl);
          return hslB[1] * hslB[2] - hslA[1] * hslA[2]; // high saturation + lightness factor
        });
      } else if (style === 'pastel') {
        // Filter Pastel colors: light and soft
        formattedColors = formattedColors.filter((col) => {
          const hslArr = parseHslString(col.hsl);
          return hslArr[2] >= 70 && hslArr[1] <= 60; // Lightness > 70, Saturation <= 60
        });
      }

      // Ensure we have at least some colors
      if (formattedColors.length === 0) {
        // Fallback to original sorted list if filters are too strict
        formattedColors = uniqueColors.slice(0, 6).map((col) => {
          const hex = rgbToHex(col.r, col.g, col.b);
          const rgb = `rgb(${col.r}, ${col.g}, ${col.b})`;
          const hslArr = rgbToHsl(col.r, col.g, col.b);
          const hsl = `hsl(${hslArr[0]}, ${hslArr[1]}%, ${hslArr[2]}%)`;
          const percentage = Math.round((col.count / (size * size)) * 100);
          return { hex, rgb, hsl, percentage };
        });
      }

      // Cap palette to top 6 distinct colors
      const finalPalette: ExtractedColor[] = [];
      const hexThreshold = 45; // prevent duplicate/identical looking colors close to each other

      for (const col of formattedColors) {
        if (finalPalette.length >= 6) break;

        const isSimilar = finalPalette.some((addedCol) => {
          const rgbA = parseRgbString(col.rgb);
          const rgbB = parseRgbString(addedCol.rgb);
          const distance = Math.sqrt(
            Math.pow(rgbA[0] - rgbB[0], 2) +
            Math.pow(rgbA[1] - rgbB[1], 2) +
            Math.pow(rgbA[2] - rgbB[2], 2)
          );
          return distance < hexThreshold;
        });

        if (!isSimilar) {
          finalPalette.push(col);
        }
      }

      // If we fell short of 5-6 due to threshold, append some back
      let idx = 0;
      while (finalPalette.length < Math.min(6, formattedColors.length) && idx < formattedColors.length) {
        const cand = formattedColors[idx++];
        if (!finalPalette.some((f) => f.hex === cand.hex)) {
          finalPalette.push(cand);
        }
      }

      setPalette(finalPalette);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    const toHexStr = (c: number) => {
      const hexStr = c.toString(16);
      return hexStr.length === 1 ? '0' + hexStr : hexStr;
    };
    return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(b)}`.toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const parseHslString = (hslStr: string): [number, number, number] => {
    const parts = hslStr.replace('hsl(', '').replace(')', '').split(',');
    const h = parseInt(parts[0]) || 0;
    const s = parseInt(parts[1]) || 0;
    const l = parseInt(parts[2]) || 0;
    return [h, s, l];
  };

  const parseRgbString = (rgbStr: string): [number, number, number] => {
    const parts = rgbStr.replace('rgb(', '').replace(')', '').split(',');
    const r = parseInt(parts[0]) || 0;
    const g = parseInt(parts[1]) || 0;
    const b = parseInt(parts[2]) || 0;
    return [r, g, b];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => {
      setCopiedValue(null);
    }, 2000);
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(null);
    setOriginalUrl(null);
    setPalette([]);
    setPaletteStyle('vibrant');
  };

  return (
    <div className="space-y-8">
      {!file ? (
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          accept="image/*"
          multiple={false}
          label="Drop your image here"
          subLabel="Upload PNG, JPG, or WebP to extract color palettes"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visual Canvas Block */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Image Color Extracting</h3>
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

              {/* Preview */}
              <div className="relative aspect-video w-full rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center p-6 shadow-inner min-h-[250px]">
                <img
                  src={originalUrl!}
                  alt="Color palette preview"
                  referrerPolicy="no-referrer"
                  className="max-h-[300px] max-w-full object-contain rounded-md shadow-sm border border-zinc-100"
                />
              </div>

              <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                <Info className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>Pixel quantization downsamples the asset locally to isolate primary colors and remove visual pixel noise.</span>
              </div>
            </div>
          </div>

          {/* Color Palettes Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Palette className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-zinc-900 text-sm">Extracted Palette</h4>
              </div>

              {/* Style Swapper */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Palette Style</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['vibrant', 'muted', 'pastel'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setPaletteStyle(style)}
                      className={`py-2 text-[10px] font-bold rounded-lg border uppercase tracking-wider text-center transition-all ${
                        paletteStyle === style
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette Display List */}
              {isExtracting ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                  <span className="text-xs text-zinc-400 font-semibold">Analyzing color clusters...</span>
                </div>
              ) : palette.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Dominant Tones (Click to copy)
                  </span>

                  <div className="space-y-2.5">
                    {palette.map((col, idx) => {
                      const isHexCopied = copiedValue === col.hex;
                      const isRgbCopied = copiedValue === col.rgb;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-150 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            {/* Color Block Swatch */}
                            <div
                              className="h-10 w-10 rounded-lg shadow-sm border border-zinc-200/50 shrink-0"
                              style={{ backgroundColor: col.hex }}
                            />
                            <div>
                              {/* Hex string */}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(col.hex)}
                                className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 hover:text-blue-600 text-left"
                                title="Copy HEX value"
                              >
                                <span>{col.hex}</span>
                                {isHexCopied ? (
                                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                ) : (
                                  <Copy className="h-3 w-3 text-zinc-400 group-hover:opacity-100 opacity-0 transition-opacity shrink-0" />
                                )}
                              </button>

                              {/* RGB string */}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(col.rgb)}
                                className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-blue-600 text-left font-semibold mt-0.5"
                                title="Copy RGB value"
                              >
                                <span>{col.rgb}</span>
                                {isRgbCopied ? (
                                  <Check className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Copy className="h-2.5 w-2.5 text-zinc-400 group-hover:opacity-100 opacity-0 transition-opacity shrink-0" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Weight</span>
                            <div className="text-xs font-bold text-zinc-500">{col.percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 italic">
                  Upload an image to extract color swatches.
                </div>
              )}
            </div>

            {/* Educational Copy */}
            <div className="bg-zinc-900 text-zinc-300 p-5 rounded-2xl border border-zinc-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Color Harmony Guide
              </h5>
              <p className="text-xs leading-relaxed opacity-85">
                Extracting cohesive palettes directly from photographs is a standard design workflow to establish matching page components, background colors, and typography contrast scales.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
