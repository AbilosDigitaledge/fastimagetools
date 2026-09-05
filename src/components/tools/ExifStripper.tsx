import React, { useState, useEffect } from 'react';
import FileDropzone from '../FileDropzone';
import {
  Download,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface MetadataReport {
  hasExifSegment: boolean;
  fileType: string;
  detectedTags: { key: string; val: string }[];
}

export default function ExifStripper() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cleanUrl, setCleanUrl] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  const [metadata, setMetadata] = useState<MetadataReport | null>(null);
  const [isStripping, setIsStripping] = useState<boolean>(false);
  const [cleanSize, setCleanSize] = useState<number | null>(null);
  const [isStripped, setIsStripped] = useState<boolean>(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setIsStripped(false);
    setCleanUrl(null);
    setCleanSize(null);

    const rawUrl = URL.createObjectURL(f);
    setOriginalUrl(rawUrl);

    // Get dimensions
    const img = new Image();
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = rawUrl;

    // Scan binary structure
    scanExifHeaders(f);
  };

  // Scans JPEG headers client-side for EXIF APP1 markers
  const scanExifHeaders = async (f: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const view = new Uint8Array(buffer);

      const report: MetadataReport = {
        hasExifSegment: false,
        fileType: f.type || 'Unknown',
        detectedTags: [],
      };

      // Check if JPEG
      const isJpeg = view[0] === 0xff && view[1] === 0xd8;
      if (!isJpeg) {
        // PNG or WebP: we still can strip, but indicate that we are checking JPEG headers
        report.detectedTags.push({
          key: 'Format Info',
          val: 'Format processed as raster pixel data. Browser will recreate the canvas layer to discard non-pixel segments.',
        });
        setMetadata(report);
        return;
      }

      // Scan JPEG segments
      let offset = 2;
      const len = view.length;

      while (offset < len - 4) {
        if (view[offset] === 0xff) {
          const marker = view[offset + 1];

          // APP1 Marker (EXIF is always in APP1, marker byte 0xE1)
          if (marker === 0xe1) {
            report.hasExifSegment = true;
            report.detectedTags.push({
              key: 'EXIF Segment (APP1)',
              val: 'Detected! Likely contains camera profile, exposure variables, and GPS tags.',
            });

            // Try to extract standard EXIF strings if present in ASCII
            const segmentSize = (view[offset + 2] << 8) + view[offset + 3];
            let segmentAscii = '';
            for (let i = offset + 4; i < Math.min(offset + segmentSize, len); i++) {
              const charCode = view[i];
              if (charCode >= 32 && charCode <= 126) {
                segmentAscii += String.fromCharCode(charCode);
              } else {
                segmentAscii += ' ';
              }
            }

            // Look for camera tags (Make / Model / Software)
            const commonKeywords = ['Camera', 'Apple', 'Canon', 'Nikon', 'Sony', 'Samsung', 'Google', 'Adobe', 'Photoshop'];
            const foundKeywords: string[] = [];
            commonKeywords.forEach((kw) => {
              if (segmentAscii.toLowerCase().includes(kw.toLowerCase())) {
                foundKeywords.push(kw);
              }
            });

            if (foundKeywords.length > 0) {
              report.detectedTags.push({
                key: 'Metadata Signatures',
                val: `Identified embedded references: ${foundKeywords.join(', ')}`,
              });
            }

            break;
          }

          // If we reach SOS (Start of Scan 0xDA), we stop since pixel stream starts
          if (marker === 0xda) {
            break;
          }

          // Move offset past this segment
          const segmentSize = (view[offset + 2] << 8) + view[offset + 3];
          offset += segmentSize + 2;
        } else {
          offset++;
        }
      }

      if (!report.hasExifSegment) {
        report.detectedTags.push({
          key: 'Header Scan',
          val: 'No active APP1 EXIF metadata headers detected. The file appears to be clean.',
        });
      }

      setMetadata(report);
    };

    // We only need to parse the first 256KB of the image for headers
    const slice = f.slice(0, 256 * 1024);
    reader.readAsArrayBuffer(slice);
  };

  const stripMetadata = async () => {
    if (!file || !originalUrl || !imgDimensions) return;
    setIsStripping(true);

    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for rendering'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = imgDimensions.width;
      canvas.height = imgDimensions.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create canvas rendering context');

      ctx.drawImage(img, 0, 0);

      // Export as a fresh new image blob.
      // Canvas exports ONLY the pixel data, stripping out EXIF segments, APP blocks, and XML comments!
      const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), format, 0.95);
      });

      if (!blob) throw new Error('Clean image generation failed');

      if (cleanUrl) URL.revokeObjectURL(cleanUrl);
      const nextUrl = URL.createObjectURL(blob);
      setCleanUrl(nextUrl);
      setCleanSize(blob.size);
      setIsStripped(true);
    } catch (err) {
      console.error(err);
      alert('Metadata stripping failed. Try another format.');
    } finally {
      setIsStripping(false);
    }
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (cleanUrl) URL.revokeObjectURL(cleanUrl);
    setFile(null);
    setOriginalUrl(null);
    setCleanUrl(null);
    setImgDimensions(null);
    setMetadata(null);
    setCleanSize(null);
    setIsStripped(false);
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
          accept="image/jpeg,image/png,image/webp"
          multiple={false}
          label="Drop an image here"
          subLabel="Upload JPEG, PNG, or WebP to scan & strip EXIF metadata"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Inspection Workspace */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Image Asset Preview</h3>
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
                  src={isStripped && cleanUrl ? cleanUrl : originalUrl!}
                  alt="Stripper preview"
                  referrerPolicy="no-referrer"
                  className="max-h-[300px] max-w-full object-contain rounded-md shadow-sm border border-zinc-100"
                />

                {isStripped && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md">
                    <ShieldCheck className="h-3 w-3" />
                    Clean copy
                  </div>
                )}
              </div>

              {/* Status details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-500 border-t border-zinc-100 pt-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Original image file</span>
                  <span className="text-zinc-700 font-semibold">{formatSize(file.size)}</span>
                  {imgDimensions && (
                    <span className="text-zinc-400 block mt-0.5">{imgDimensions.width} × {imgDimensions.height} px</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Privacy Status</span>
                  {isStripped ? (
                    <div className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      <span>EXIF Stripped ({formatSize(cleanSize || 0)})</span>
                    </div>
                  ) : (
                    <span className="text-amber-600 font-bold flex items-center justify-end gap-1">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Unsafe for public upload</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-2">
                {!isStripped ? (
                  <button
                    type="button"
                    onClick={stripMetadata}
                    disabled={isStripping}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isStripping ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Layers className="h-5 w-5" />
                    )}
                    Strip EXIF Metadata Now
                  </button>
                ) : (
                  cleanUrl && (
                    <a
                      href={cleanUrl}
                      download={`fastimage-clean-${file.name}`}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Download className="h-5 w-5" />
                      Download Cleaned Copy
                    </a>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Metadata Inspector Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Eye className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-zinc-900 text-sm">Header Metadata Inspector</h4>
              </div>

              {metadata ? (
                <div className="space-y-4">
                  {/* General format */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 bg-zinc-50 rounded-lg border border-zinc-100 font-medium text-zinc-500">
                    <span>MIME Format</span>
                    <span className="font-bold text-zinc-800 uppercase">{metadata.fileType}</span>
                  </div>

                  {/* Header alert */}
                  <div className={`p-4 rounded-xl border flex gap-3 ${
                    metadata.hasExifSegment
                      ? 'border-rose-200 bg-rose-50/20 text-rose-800'
                      : 'border-emerald-200 bg-emerald-50/20 text-emerald-800'
                  }`}>
                    {metadata.hasExifSegment ? (
                      <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                    )}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider">
                        {metadata.hasExifSegment ? 'EXIF Header Found!' : 'EXIF Segment Clean'}
                      </h5>
                      <p className="text-xs mt-1 opacity-90 leading-relaxed">
                        {metadata.hasExifSegment
                          ? 'This JPEG file includes a physical EXIF APP1 block. It may contain precise GPS coordinates, serial numbers, camera model details, and timestamps.'
                          : 'Our scanner did not detect any active APP1 metadata segments. This file appears safe, but stripping is recommended to guarantee pixel-only cleanups.'}
                      </p>
                    </div>
                  </div>

                  {/* Detected items list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Scanned Records</span>
                    <div className="divide-y divide-zinc-100 border border-zinc-150 rounded-xl overflow-hidden bg-zinc-50/30">
                      {metadata.detectedTags.map((tag, idx) => (
                        <div key={idx} className="p-3 text-xs leading-relaxed">
                          <strong className="text-zinc-700 block mb-0.5">{tag.key}</strong>
                          <span className="text-zinc-500 font-medium">{tag.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 italic">
                  Parsing image headers...
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div className="bg-zinc-900 text-zinc-300 p-5 rounded-2xl border border-zinc-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-blue-400" />
                In-Browser Sanitization
              </h5>
              <p className="text-xs leading-relaxed opacity-85">
                FastImage.tools never uploads your photos to a server. Stripping is executed entirely inside your browser's virtual DOM canvas sandbox. The outputs are generated locally in milliseconds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
