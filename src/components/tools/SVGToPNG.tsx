import React, { useState, useEffect } from 'react';
import { ProcessFile } from '../../types';
import FileDropzone from '../FileDropzone';
import JSZip from 'jszip';
import {
  Download,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  Settings,
  Sliders,
  Maximize2,
  FileCode,
  Palette
} from 'lucide-react';

export default function SVGToPNG() {
  const [queue, setQueue] = useState<ProcessFile[]>([]);
  const [width, setWidth] = useState<number>(1024);
  const [height, setHeight] = useState<number>(1024);
  const [aspectLock, setAspectLock] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'custom'>('transparent');
  const [customBgColor, setCustomBgColor] = useState<string>('#3b82f6');
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // When active item changes, pull its dimensions if available to populate inputs
  useEffect(() => {
    if (activeId) {
      const activeItem = queue.find((q) => q.id === activeId);
      if (activeItem && activeItem.originalWidth && activeItem.originalHeight) {
        const ratio = activeItem.originalWidth / activeItem.originalHeight;
        setAspectRatio(ratio);
        // Update input width/height to match
        setWidth(activeItem.originalWidth);
        setHeight(activeItem.originalHeight);
      }
    }
  }, [activeId]);

  // Trigger processing when files, width, height, or background options change
  useEffect(() => {
    queue.forEach((item) => {
      // Re-run if idle, or if completed and the settings changed, let's reprocess it!
      // In this case, we can simply reprocess the item if its output settings differ
      if (item.status === 'idle') {
        processSVG(item.id);
      }
    });
  }, [queue, width, height, bgMode, customBgColor]);

  const handleFilesSelected = (files: File[]) => {
    const newItems: ProcessFile[] = files.map((file) => {
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        file,
        name: file.name,
        originalSize: file.size,
        status: 'idle',
        progress: 0,
        previewUrl,
      };
    });
    setQueue((prev) => [...prev, ...newItems]);
    if (newItems.length > 0 && !activeId) {
      setActiveId(newItems[0].id);
    }
  };

  const processSVG = async (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'processing', progress: 15 } : item
      )
    );

    const item = queue.find((q) => q.id === id);
    if (!item) return;

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(item.file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load SVG. Ensure it is a valid SVG document.'));
        img.src = objectUrl;
      });

      // Intrinsic size
      const intrinsicWidth = img.naturalWidth || 512;
      const intrinsicHeight = img.naturalHeight || 512;
      const fileRatio = intrinsicWidth / intrinsicHeight;

      // Update item with original sizes if they weren't stored yet
      setQueue((prev) =>
        prev.map((q) =>
          q.id === id && !q.originalWidth
            ? { ...q, originalWidth: intrinsicWidth, originalHeight: intrinsicHeight }
            : q
        )
      );

      // Target size for this conversion based on general settings
      const targetWidth = width;
      const targetHeight = height;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to create canvas 2D rendering context.');
      }

      // Draw background if not transparent
      if (bgMode === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else if (bgMode === 'custom') {
        ctx.fillStyle = customBgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // Securely draw the SVG to the canvas. (Browser blocks scripts automatically since it is an <img> source)
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      setQueue((prev) =>
        prev.map((q) => (q.id === id ? { ...q, progress: 70 } : q))
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      URL.revokeObjectURL(objectUrl);

      if (!blob) {
        throw new Error('Failed to rasterize PNG image.');
      }

      const outputUrl = URL.createObjectURL(blob);
      const originalBaseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const finalOutputName = `${originalBaseName}.png`;

      setQueue((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                status: 'completed',
                progress: 100,
                outputUrl,
                outputName: finalOutputName,
                outputSize: blob.size,
                outputWidth: targetWidth,
                outputHeight: targetHeight,
              }
            : q
        )
      );
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: 'failed', error: err.message || 'Processing failed' }
            : q
        )
      );
    }
  };

  // Reprocess all items with the current active parameters
  const reprocessAll = () => {
    setQueue((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'idle',
        progress: 0,
      }))
    );
  };

  const handleWidthChange = (val: number) => {
    if (val <= 0) return;
    setWidth(val);
    if (aspectLock) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    if (val <= 0) return;
    setHeight(val);
    if (aspectLock) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const removeFile = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
      }
      return prev.filter((q) => q.id !== id);
    });
    if (activeId === id) {
      setActiveId(null);
    }
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });
    setQueue([]);
    setActiveId(null);
  };

  const downloadAll = async () => {
    const completedItems = queue.filter((q) => q.status === 'completed' && q.outputUrl);
    if (completedItems.length === 0) return;

    if (completedItems.length === 1) {
      const item = completedItems[0];
      const a = document.createElement('a');
      a.href = item.outputUrl!;
      a.download = item.outputName || 'image.png';
      a.click();
      return;
    }

    setIsProcessingAll(true);
    try {
      const zip = new JSZip();

      for (const item of completedItems) {
        const response = await fetch(item.outputUrl!);
        const blob = await response.blob();
        zip.file(item.outputName || 'image.png', blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = 'fastimage-svg-to-png-rasterized.zip';
      a.click();

      setTimeout(() => URL.revokeObjectURL(zipUrl), 5000);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      alert('Failed to generate ZIP. Please download files individually.');
    } finally {
      setIsProcessingAll(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const completedCount = queue.filter((q) => q.status === 'completed').length;
  const totalCount = queue.length;
  const activeItem = queue.find((q) => q.id === activeId);

  return (
    <div className="space-y-8">
      {/* File Upload Zone & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            accept=".svg"
            multiple={true}
            label="Drop SVG files here"
            subLabel="or click to upload SVG vector graphics from your device"
          />
        </div>

        {/* Options Panel */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-6 self-start">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Settings className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-zinc-900 text-sm">PNG Output Settings</h3>
          </div>

          {/* Width & Height */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="width-input" className="block text-xs font-semibold text-zinc-500">
                  Output Width
                </label>
                <div className="relative">
                  <input
                    id="width-input"
                    type="number"
                    min="1"
                    max="8192"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full text-sm px-3 py-2 pr-8 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-zinc-400 font-bold uppercase select-none">
                    px
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="height-input" className="block text-xs font-semibold text-zinc-500">
                  Output Height
                </label>
                <div className="relative">
                  <input
                    id="height-input"
                    type="number"
                    min="1"
                    max="8192"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full text-sm px-3 py-2 pr-8 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-zinc-400 font-bold uppercase select-none">
                    px
                  </span>
                </div>
              </div>
            </div>

            {/* Lock Aspect Ratio */}
            <div className="flex items-center justify-between py-1.5 bg-zinc-50 px-3 rounded-lg border border-zinc-100">
              <label htmlFor="aspect-lock" className="flex items-center gap-2 text-xs text-zinc-600 font-semibold cursor-pointer select-none">
                <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
                Aspect Ratio Lock
              </label>
              <input
                id="aspect-lock"
                type="checkbox"
                checked={aspectLock}
                onChange={(e) => setAspectLock(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Background settings */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-zinc-400" />
              Background Canvas
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['transparent', 'white', 'custom'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBgMode(mode)}
                  className={`py-2 text-[10px] font-bold rounded-lg border uppercase tracking-wider text-center transition-all ${
                    bgMode === mode
                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {bgMode === 'custom' && (
              <div className="flex items-center gap-2.5 pt-1.5 animate-in fade-in duration-200">
                <input
                  id="color-picker"
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="h-8 w-12 border-0 bg-transparent cursor-pointer rounded-lg shrink-0"
                />
                <input
                  id="color-input"
                  type="text"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase"
                />
              </div>
            )}
          </div>

          {totalCount > 0 && (
            <div className="pt-2 space-y-2.5 border-t border-zinc-100">
              <button
                type="button"
                onClick={reprocessAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Apply Settings to All
              </button>

              <button
                type="button"
                onClick={clearQueue}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors text-xs font-semibold text-zinc-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Queue
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main workspace queue */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/50 gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                {totalCount}
              </span>
              <h3 className="font-bold text-zinc-800 text-base">Renders Queue</h3>
              {completedCount === totalCount && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <Check className="h-3 w-3 shrink-0" />
                  All Rendered
                </span>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={downloadAll}
                  disabled={isProcessingAll}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isProcessingAll ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {totalCount > 1 ? 'Download All PNGs' : 'Download PNG'}
                </button>
              )}
            </div>
          </div>

          {/* Active File Preview Block */}
          {activeItem && activeItem.status === 'completed' && activeItem.outputUrl && (
            <div className="border-b border-zinc-100 p-6 flex flex-col items-center justify-center bg-zinc-50/30">
              <div className="text-center mb-4">
                <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Live Preview</span>
                <h4 className="text-sm font-semibold text-zinc-700 truncate max-w-sm mt-0.5">{activeItem.name}</h4>
              </div>
              <div className="relative max-w-full max-h-[320px] rounded-xl border border-zinc-200/80 p-3 bg-white shadow-inner flex items-center justify-center overflow-hidden">
                {/* Checkerboard pattern for transparent background */}
                <div
                  className="absolute inset-0 z-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      'radial-gradient(#000 20%, transparent 20%), radial-gradient(#000 20%, transparent 20%)',
                    backgroundPosition: '0 0, 8px 8px',
                    backgroundSize: '16px 16px',
                  }}
                />
                <img
                  src={activeItem.outputUrl}
                  alt="PNG Preview"
                  referrerPolicy="no-referrer"
                  className="relative z-10 max-w-full max-h-[280px] object-contain rounded-md"
                />
              </div>
              <div className="flex gap-3 text-xs text-zinc-500 mt-4 bg-white px-3.5 py-1.5 rounded-full border border-zinc-150 shadow-sm font-medium">
                <span>Output size: {width} × {height} px</span>
                <span className="text-zinc-300">•</span>
                <span>File: {formatSize(activeItem.outputSize || 0)}</span>
              </div>
            </div>
          )}

          {/* Queue List */}
          <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
            {queue.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  activeId === item.id ? 'bg-blue-50/20' : 'hover:bg-zinc-50/50'
                }`}
              >
                {/* SVG Thumbnail & Details */}
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 shrink-0 rounded-lg border border-zinc-200 bg-white p-1.5 flex items-center justify-center overflow-hidden shadow-sm">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt="SVG icon"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <FileCode className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-800 truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                      <span>Size: {formatSize(item.originalSize)}</span>
                      {item.originalWidth && (
                        <>
                          <span className="text-zinc-300">•</span>
                          <span>Original: {item.originalWidth} × {item.originalHeight} px</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status indicator and action row */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-zinc-50 sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    {item.status === 'processing' && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                        <span>Rendering...</span>
                      </div>
                    )}
                    {item.status === 'failed' && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{item.error || 'Failed'}</span>
                      </div>
                    )}
                    {item.status === 'completed' && (
                      <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                        <Check className="h-3.5 w-3.5" />
                        <span>Ready</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'completed' && item.outputUrl && (
                      <a
                        href={item.outputUrl}
                        download={item.outputName || 'image.png'}
                        className="p-2 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download PNG file"
                        onClick={(e) => e.stopPropagation()} // Prevent setting activeId again
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(item.id);
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
