import React, { useState, useEffect, useRef } from 'react';
import FileDropzone from '../FileDropzone';
import {
  Download,
  Trash2,
  RefreshCw,
  Settings,
  Sliders,
  Crop as CropIcon,
  ZoomIn,
  Move,
  Check,
  ImageIcon
} from 'lucide-react';

const SIZES = [
  { name: '256 × 256', val: 256, label: 'Profile Small' },
  { name: '512 × 512', val: 512, label: 'Avatar Standard' },
  { name: '1024 × 1024', val: 1024, label: 'High Resolution' },
];

export default function CircleCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  const [outputSize, setOutputSize] = useState<number>(512);
  const [zoom, setZoom] = useState<number>(100); // percentage (100% to 400%)
  const [posX, setPosX] = useState<number>(50); // percentage (0 to 100)
  const [posY, setPosY] = useState<number>(50); // percentage (0 to 100)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [croppedSize, setCroppedSize] = useState<number | null>(null);

  // Drag state for mouse interaction
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 50, y: 50 });
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);

    const rawUrl = URL.createObjectURL(f);
    setOriginalUrl(rawUrl);

    const img = new Image();
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = rawUrl;
  };

  // Redraw circular crop whenever inputs change
  useEffect(() => {
    if (!originalUrl || !imgDimensions) return;
    drawCircleCrop();
  }, [originalUrl, imgDimensions, outputSize, zoom, posX, posY]);

  const drawCircleCrop = async () => {
    if (!file || !originalUrl || !imgDimensions) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create canvas 2D rendering context');

      // Clear with transparent pixels
      ctx.clearRect(0, 0, outputSize, outputSize);

      // Create a clipping path of a circle in the center of the canvas
      ctx.beginPath();
      const radius = outputSize / 2;
      ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Draw image adjusted by Zoom and Position sliders
      const imgW = imgDimensions.width;
      const imgH = imgDimensions.height;

      // Base scaling to cover the output circle (simulate "object-cover" behavior)
      const baseScale = Math.max(outputSize / imgW, outputSize / imgH);
      const zoomFactor = zoom / 100;
      const finalScale = baseScale * zoomFactor;

      const drawW = imgW * finalScale;
      const drawH = imgH * finalScale;

      // Center the image horizontally & vertically, then apply offset based on sliders
      // posX and posY are sliders between 0 and 100.
      // 50% means perfectly centered.
      const maxOffsetX = (drawW - outputSize) / 2;
      const maxOffsetY = (drawH - outputSize) / 2;

      // Sliders center at 50. Scale offset accordingly.
      // E.g. if posX = 0, we draw at -maxOffsetX, if posX = 100 we draw at +maxOffsetX
      const offsetX = -((posX - 50) / 50) * maxOffsetX;
      const offsetY = -((posY - 50) / 50) * maxOffsetY;

      const drawX = (outputSize - drawW) / 2 + offsetX;
      const drawY = (outputSize - drawH) / 2 + offsetY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (!blob) throw new Error('Blob generation failed');

      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
      const nextUrl = URL.createObjectURL(blob);
      setCroppedUrl(nextUrl);
      setCroppedSize(blob.size);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mouse drag to pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!file) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { x: posX, y: posY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imgDimensions) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    // Scale sensitivity based on container
    const widthFactor = 0.15; // tuning factor
    const heightFactor = 0.15;

    // Move in direction of drag (reversing sign because offsetting pushes image)
    const nextX = Math.max(0, Math.min(100, posStart.current.x - deltaX * widthFactor));
    const nextY = Math.max(0, Math.min(100, posStart.current.y - deltaY * heightFactor));

    setPosX(parseFloat(nextX.toFixed(1)));
    setPosY(parseFloat(nextY.toFixed(1)));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setFile(null);
    setOriginalUrl(null);
    setCroppedUrl(null);
    setImgDimensions(null);
    setCroppedSize(null);
    setOutputSize(512);
    setZoom(100);
    setPosX(50);
    setPosY(50);
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
          accept="image/*"
          multiple={false}
          label="Drop an image here"
          subLabel="Upload PNG, JPG, or WebP to create a circular crop"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Circular Interactive Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Visual Crop Workspace</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Drag on the crop circle to pan, or use sliders below</p>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Start Over
                </button>
              </div>

              {/* Crop Box Area */}
              <div
                ref={workspaceRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="relative aspect-square max-w-[400px] mx-auto rounded-2xl border border-zinc-200 bg-zinc-900/95 overflow-hidden flex items-center justify-center p-0 cursor-move select-none"
              >
                {/* Simulated checkerboard inside the cropped zone */}
                <div
                  className="absolute h-64 w-64 rounded-full z-0 border-2 border-dashed border-blue-500 overflow-hidden shadow-lg"
                  style={{
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                  }}
                >
                  {/* Checkerboard texture */}
                  <div
                    className="absolute inset-0 z-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        'radial-gradient(#fff 20%, transparent 20%), radial-gradient(#fff 20%, transparent 20%)',
                      backgroundPosition: '0 0, 8px 8px',
                      backgroundSize: '16px 16px',
                    }}
                  />
                  {/* Interactive rendered preview */}
                  {croppedUrl && (
                    <img
                      src={croppedUrl}
                      alt="Circle crop preview"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 z-10 h-full w-full object-contain pointer-events-none"
                    />
                  )}
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 text-[10px] text-zinc-200/90 font-medium">
                  <Move className="h-3 w-3" />
                  Drag circle to reposition
                </div>
              </div>

              {/* Resolution details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-500 border-t border-zinc-100 pt-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Original image</span>
                  <span className="text-zinc-700 font-semibold">
                    {imgDimensions ? `${imgDimensions.width} × ${imgDimensions.height} px` : 'Loading...'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Output File size</span>
                  <span className="text-blue-600 font-bold">
                    {outputSize} × {outputSize} px
                  </span>
                  {croppedSize && (
                    <span className="text-zinc-400 text-[10px] block mt-0.5">({formatSize(croppedSize)})</span>
                  )}
                </div>
              </div>

              {/* Download CTA */}
              {croppedUrl && (
                <div className="pt-2">
                  <a
                    href={croppedUrl}
                    download={`fastimage-avatar-${outputSize}x${outputSize}.png`}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Download className="h-5 w-5" />
                    Download Transparent PNG
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sliders and Configurations Sidebar */}
          <div className="space-y-6">
            {/* Output resolution options */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Settings className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-zinc-900 text-sm">Output Size</h4>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size.val}
                    type="button"
                    onClick={() => setOutputSize(size.val)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      outputSize === size.val
                        ? 'border-blue-500 bg-blue-50/20 text-blue-700 font-bold'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">{size.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 font-normal">Transparent PNG backdrop</div>
                    </div>
                    <span className="text-sm font-bold">{size.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fine Tuning Controls */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Sliders className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-zinc-900 text-sm">Fine-Tuning Controls</h4>
              </div>

              {/* Zoom Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="h-3.5 w-3.5 text-zinc-400" />
                    Zoom scale
                  </span>
                  <span className="text-blue-600 font-bold">{zoom}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="400"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Pan Horizontal (X) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500 font-semibold">
                  <span>Pan Horizontally</span>
                  <span className="text-blue-600 font-bold">{posX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posX}
                  onChange={(e) => setPosX(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Pan Vertical (Y) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500 font-semibold">
                  <span>Pan Vertically</span>
                  <span className="text-blue-600 font-bold">{posY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posY}
                  onChange={(e) => setPosY(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
                />
              </div>

              <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-xl text-[10px] text-zinc-500 leading-relaxed">
                <strong>💡 Pro-Tip:</strong> Zooming helps to capture the precise focal point. You can drag directly on the crop square to center visual objects instantly.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
