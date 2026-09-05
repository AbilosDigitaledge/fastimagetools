import React, { useState, useEffect } from 'react';
import FileDropzone from '../FileDropzone';
import {
  Info,
  Trash2,
  RefreshCw,
  Cpu,
  Laptop,
  Check,
  Printer,
  Search,
  FileImage,
  Layers
} from 'lucide-react';

interface DpiReport {
  fileType: string;
  hasDpiMetadata: boolean;
  detectedDpi: number | null;
  densityUnit: string;
  originalWidth: number;
  originalHeight: number;
}

export default function DpiChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [report, setReport] = useState<DpiReport | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setReport(null);

    const rawUrl = URL.createObjectURL(f);
    setOriginalUrl(rawUrl);

    parseDpiAndDimensions(f, rawUrl);
  };

  const parseDpiAndDimensions = async (f: File, rawUrl: string) => {
    setIsParsing(true);

    try {
      // 1. Get exact pixel dimensions using standard Image loading
      const img = new Image();
      img.src = rawUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // 2. Binary parsing for JPEG/PNG headers
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const view = new Uint8Array(buffer);

        const result: DpiReport = {
          fileType: f.type || 'Unknown',
          hasDpiMetadata: false,
          detectedDpi: null,
          densityUnit: 'None',
          originalWidth: w,
          originalHeight: h,
        };

        // Detect JPEG
        const isJpeg = view[0] === 0xff && view[1] === 0xd8;
        // Detect PNG
        const isPng =
          view[0] === 0x89 &&
          view[1] === 0x50 &&
          view[2] === 0x4e &&
          view[3] === 0x47;

        if (isJpeg) {
          // Parse JPEG markers
          let offset = 2;
          const len = view.length;

          while (offset < len - 18) {
            if (view[offset] === 0xff) {
              const marker = view[offset + 1];

              // APP0 Marker (contains JFIF)
              if (marker === 0xe0) {
                // Ensure JFIF identifier exists
                if (
                  view[offset + 6] === 0x4a && // J
                  view[offset + 7] === 0x46 && // F
                  view[offset + 8] === 0x49 && // I
                  view[offset + 9] === 0x46 && // F
                  view[offset + 10] === 0x00
                ) {
                  const units = view[offset + 13];
                  const xDensity = (view[offset + 14] << 8) + view[offset + 15];
                  const yDensity = (view[offset + 16] << 8) + view[offset + 17];

                  if (units === 1 && xDensity > 0) {
                    result.hasDpiMetadata = true;
                    result.detectedDpi = xDensity;
                    result.densityUnit = 'Dots Per Inch (DPI)';
                  } else if (units === 2 && xDensity > 0) {
                    // dots per cm. Convert to DPI (1 cm = 0.3937 inches -> 1 inch = 2.54 cm)
                    result.hasDpiMetadata = true;
                    result.detectedDpi = Math.round(xDensity * 2.54);
                    result.densityUnit = 'Dots Per Centimeter (converted to DPI)';
                  }
                  break;
                }
              }

              // APP1 Marker (EXIF can also hold DPI)
              if (marker === 0xe1) {
                // EXIF segments might have tags 0x011A (XResolution) and 0x011B (YResolution)
                // Since EXIF directory parsing is complex, if we didn't find JFIF we denote EXIF segment availability
                // Usually JPEGs with APP1 are written by Photoshop/Cameras.
              }

              if (marker === 0xda) {
                break; // Start of Scan, stop parsing
              }

              // Move past segment
              const segSize = (view[offset + 2] << 8) + view[offset + 3];
              offset += segSize + 2;
            } else {
              offset++;
            }
          }
        } else if (isPng) {
          // Parse PNG Chunks
          let offset = 8; // skip signature
          const len = view.length;

          while (offset < len - 16) {
            const chunkLength =
              (view[offset] << 24) +
              (view[offset + 1] << 16) +
              (view[offset + 2] << 8) +
              view[offset + 3];

            // Chunk type ASCII
            const chunkType = String.fromCharCode(
              view[offset + 4],
              view[offset + 5],
              view[offset + 6],
              view[offset + 7]
            );

            if (chunkType === 'pHYs') {
              // pHYs chunk data:
              // - Pixels per unit, X: 4 bytes
              // - Pixels per unit, Y: 4 bytes
              // - Unit specifier: 1 byte (0: unknown, 1: meter)
              const ppuX =
                (view[offset + 8] << 24) +
                (view[offset + 9] << 16) +
                (view[offset + 10] << 8) +
                view[offset + 11];

              const unitSpec = view[offset + 16];

              if (unitSpec === 1 && ppuX > 0) {
                // Pixels per meter. Convert to DPI (1 meter = 39.3701 inches)
                // ppuX / 39.3701 = pixels per inch (DPI)
                const computedDpi = Math.round(ppuX * 0.0254);
                result.hasDpiMetadata = true;
                result.detectedDpi = computedDpi;
                result.densityUnit = 'Pixels Per Meter (converted to DPI)';
              }
              break;
            }

            if (chunkType === 'IDAT') {
              break; // Pixel stream starts, stop scanning
            }

            offset += chunkLength + 12; // Length + Type + Data + CRC
          }
        }

        setReport(result);
      };

      // Only slice first 128KB of the image containing headers
      const slice = f.slice(0, 128 * 1024);
      reader.readAsArrayBuffer(slice);
    } catch (err) {
      console.error(err);
      alert('DPI verification failed. Try uploading a standard JPEG or PNG file.');
    } finally {
      setIsParsing(false);
    }
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(null);
    setOriginalUrl(null);
    setReport(null);
  };

  const calculatePrintDimension = (pixels: number, dpi: number) => {
    const inches = pixels / dpi;
    const cm = inches * 2.54;
    return {
      in: parseFloat(inches.toFixed(2)),
      cm: parseFloat(cm.toFixed(2)),
    };
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    return parseFloat((bytes / k).toFixed(1)) + ' KB';
  };

  return (
    <div className="space-y-8">
      {!file ? (
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          accept="image/jpeg,image/png"
          multiple={false}
          label="Drop your image here"
          subLabel="Upload JPEG or PNG files to inspect embedded DPI tags"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workspace Image Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Image Asset Metadata</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{file.name}</p>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Clear Inspect
                </button>
              </div>

              {/* Preview Container */}
              <div className="relative aspect-video w-full rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center p-6 shadow-inner min-h-[250px]">
                <img
                  src={originalUrl!}
                  alt="DPI preview asset"
                  referrerPolicy="no-referrer"
                  className="max-h-[300px] max-w-full object-contain rounded-md shadow-sm border border-zinc-100"
                />
              </div>

              {/* Resolution metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium text-zinc-500 border-t border-zinc-100 pt-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">File Size</span>
                  <span className="text-zinc-700 font-bold text-sm">{formatSize(file.size)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Pixel Dimensions</span>
                  {report ? (
                    <span className="text-zinc-700 font-bold text-sm">
                      {report.originalWidth} × {report.originalHeight} px
                    </span>
                  ) : (
                    <span className="text-zinc-400 italic">Reading...</span>
                  )}
                </div>
                <div className="col-span-2 md:col-span-1 text-left md:text-right">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Aspect Ratio</span>
                  {report ? (
                    <span className="text-blue-600 font-bold text-sm">
                      {parseFloat((report.originalWidth / report.originalHeight).toFixed(2))}:1
                    </span>
                  ) : (
                    <span className="text-zinc-400 italic">Reading...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DPI Metadata analysis sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Search className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-zinc-900 text-sm">DPI Header Inspection</h4>
              </div>

              {report ? (
                <div className="space-y-5">
                  {/* Embedded DPI display */}
                  <div className={`p-4 rounded-xl border flex gap-3 ${
                    report.hasDpiMetadata
                      ? 'border-blue-200 bg-blue-50/20 text-blue-800'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-500'
                  }`}>
                    {report.hasDpiMetadata ? (
                      <Check className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                    ) : (
                      <Info className="h-5 w-5 shrink-0 text-zinc-400 mt-0.5" />
                    )}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider">
                        {report.hasDpiMetadata ? 'Embedded DPI Tag Found!' : 'No DPI Tag Detected'}
                      </h5>
                      <p className="text-xs mt-1 opacity-95 leading-relaxed font-semibold">
                        {report.hasDpiMetadata && report.detectedDpi
                          ? `This image is tagged with: ${report.detectedDpi} DPI (${report.densityUnit})`
                          : 'This image does not contain any native DPI metadata in its file header. This is completely standard for web assets.'}
                      </p>
                    </div>
                  </div>

                  {/* Print Density Dimensions Grid */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Physical Print Sizes at Densities:
                    </span>

                    <div className="space-y-2.5">
                      {/* Current tag or standard densities */}
                      {report.hasDpiMetadata && report.detectedDpi && (
                        <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-blue-700 block">Tagged Ratio ({report.detectedDpi} DPI)</span>
                            <span className="text-[10px] text-zinc-400 uppercase">Native File Instruction</span>
                          </div>
                          <div className="text-right font-bold text-zinc-700">
                            <div>{calculatePrintDimension(report.originalWidth, report.detectedDpi).in}″ × {calculatePrintDimension(report.originalHeight, report.detectedDpi).in}″</div>
                            <div className="text-[10px] text-zinc-400 font-medium">{calculatePrintDimension(report.originalWidth, report.detectedDpi).cm} × {calculatePrintDimension(report.originalHeight, report.detectedDpi).cm} cm</div>
                          </div>
                        </div>
                      )}

                      {/* 300 DPI */}
                      <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-150 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 block">High Print (300 DPI)</span>
                          <span className="text-[10px] text-emerald-600 font-bold uppercase">Commercial Print Standard</span>
                        </div>
                        <div className="text-right font-semibold text-zinc-600">
                          <div>{calculatePrintDimension(report.originalWidth, 300).in}″ × {calculatePrintDimension(report.originalHeight, 300).in}″</div>
                          <div className="text-[10px] text-zinc-400 font-normal">{calculatePrintDimension(report.originalWidth, 300).cm} × {calculatePrintDimension(report.originalHeight, 300).cm} cm</div>
                        </div>
                      </div>

                      {/* 150 DPI */}
                      <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-150 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 block">Medium Print (150 DPI)</span>
                          <span className="text-[10px] text-zinc-400 uppercase">Standard Flyers / Posters</span>
                        </div>
                        <div className="text-right font-semibold text-zinc-600">
                          <div>{calculatePrintDimension(report.originalWidth, 150).in}″ × {calculatePrintDimension(report.originalHeight, 150).in}″</div>
                          <div className="text-[10px] text-zinc-400 font-normal">{calculatePrintDimension(report.originalWidth, 150).cm} × {calculatePrintDimension(report.originalHeight, 150).cm} cm</div>
                        </div>
                      </div>

                      {/* 72 DPI */}
                      <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-150 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 block">Screen Resolution (72 DPI)</span>
                          <span className="text-[10px] text-zinc-400 uppercase">Legacy Web Display</span>
                        </div>
                        <div className="text-right font-semibold text-zinc-600">
                          <div>{calculatePrintDimension(report.originalWidth, 72).in}″ × {calculatePrintDimension(report.originalHeight, 72).in}″</div>
                          <div className="text-[10px] text-zinc-400 font-normal">{calculatePrintDimension(report.originalWidth, 72).cm} × {calculatePrintDimension(report.originalHeight, 72).cm} cm</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 italic">
                  Parsing image file layers...
                </div>
              )}
            </div>

            {/* DPI vs Pixels educational text */}
            <div className="bg-zinc-900 text-zinc-300 p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-sm">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Printer className="h-4 w-4 text-blue-400" />
                DPI vs Pixels Guide
              </h5>
              <p className="text-xs leading-relaxed opacity-85">
                DPI (Dots Per Inch) is merely a instruction tag written into the file headers to configure how tightly packed pixels are printed on physical paper. On monitor screens, only pure pixels dictate clarity and sizes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
