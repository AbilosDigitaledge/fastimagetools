import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';

export default function WebPToJPG() {
  const [queue, setQueue] = useState<ProcessFile[]>([]);
  const [quality, setQuality] = useState<number>(90);
  const [suffix, setSuffix] = useState<string>('');
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);

  // Trigger processing when files are added or quality changes
  useEffect(() => {
    queue.forEach((item) => {
      if (item.status === 'idle') {
        processFile(item.id, quality, suffix);
      }
    });
  }, [queue, quality, suffix]);

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
  };

  const processFile = async (id: string, jpgQuality: number, filenameSuffix: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'processing', progress: 10 } : item
      )
    );

    const item = queue.find((q) => q.id === id) || queue[queue.length - 1];
    if (!item) return;

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(item.file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load WebP image.'));
        img.src = objectUrl;
      });

      // Update resolution dimensions
      setQueue((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, originalWidth: img.naturalWidth, originalHeight: img.naturalHeight }
            : q
        )
      );

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get 2D canvas context.');
      }

      // Draw white background (JPG doesn't support transparency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      setQueue((prev) =>
        prev.map((q) => (q.id === id ? { ...q, progress: 60 } : q))
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          'image/jpeg',
          jpgQuality / 100
        );
      });

      // Cleanup raw object URL
      URL.revokeObjectURL(objectUrl);

      if (!blob) {
        throw new Error('Failed to generate JPG blob.');
      }

      const outputUrl = URL.createObjectURL(blob);
      const originalBaseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const finalOutputName = `${originalBaseName}${filenameSuffix}.jpg`;

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
                outputWidth: canvas.width,
                outputHeight: canvas.height,
              }
            : q
        )
      );
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: 'failed', error: err.message || 'Conversion failed' }
            : q
        )
      );
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
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });
    setQueue([]);
  };

  const downloadAll = async () => {
    const completedItems = queue.filter((q) => q.status === 'completed' && q.outputUrl);
    if (completedItems.length === 0) return;

    if (completedItems.length === 1) {
      // Direct download
      const item = completedItems[0];
      const a = document.createElement('a');
      a.href = item.outputUrl!;
      a.download = item.outputName || 'image.jpg';
      a.click();
      return;
    }

    setIsProcessingAll(true);
    try {
      const zip = new JSZip();

      for (const item of completedItems) {
        const response = await fetch(item.outputUrl!);
        const blob = await response.blob();
        zip.file(item.outputName || 'image.jpg', blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = 'fastimage-webp-to-jpg-batch.zip';
      a.click();

      setTimeout(() => URL.revokeObjectURL(zipUrl), 5000);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      alert('Failed to generate ZIP file. Please try downloading files individually.');
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

  return (
    <div className="space-y-8">
      {/* Settings Panel & Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            accept=".webp"
            multiple={true}
            label="Drop WebP files here"
            subLabel="or click to browse WebP images from your device"
          />
        </div>

        {/* Options Panel */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-6 self-start">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Settings className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-zinc-900 text-sm">Conversion Settings</h3>
          </div>

          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
              <label htmlFor="quality-slider" className="flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                JPG Quality
              </label>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {quality}%
              </span>
            </div>
            <input
              id="quality-slider"
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-zinc-400 leading-snug">
              90% is highly recommended for optimal ratio of file size to visual clarity.
            </p>
          </div>

          {/* Suffix input */}
          <div className="space-y-2">
            <label htmlFor="suffix-input" className="block text-xs font-medium text-zinc-500">
              Filename Suffix (optional)
            </label>
            <input
              id="suffix-input"
              type="text"
              placeholder="e.g. -converted, -optimized"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {totalCount > 0 && (
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={clearQueue}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Queue
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Queue Output Workspace */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/50 gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                {totalCount}
              </span>
              <h3 className="font-bold text-zinc-800 text-base">Processing Queue</h3>
              {completedCount === totalCount && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <Check className="h-3 w-3 shrink-0" />
                  All Converted
                </span>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={downloadAll}
                  disabled={isProcessingAll}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isProcessingAll ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {totalCount > 1 ? 'Download All JPGs' : 'Download JPG'}
                </button>
              )}
            </div>
          </div>

          {/* Queue List */}
          <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
            {queue.map((item) => {
              const savings =
                item.outputSize && item.originalSize
                  ? Math.round(((item.originalSize - item.outputSize) / item.originalSize) * 100)
                  : null;

              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Thumbnail & File Details */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt="preview"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-800 truncate max-w-xs sm:max-w-md">
                        {item.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-500">
                        <span>Original: {formatSize(item.originalSize)}</span>
                        {item.originalWidth && (
                          <span className="text-zinc-300">•</span>
                        )}
                        {item.originalWidth && (
                          <span>{item.originalWidth} × {item.originalHeight} px</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status, Savings, Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-zinc-50 sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right sm:space-y-1">
                      {item.status === 'processing' && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                          <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                          <span>Converting...</span>
                        </div>
                      )}
                      {item.status === 'failed' && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{item.error || 'Error'}</span>
                        </div>
                      )}
                      {item.status === 'completed' && (
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <Check className="h-3.5 w-3.5" />
                            <span>Done • {formatSize(item.outputSize || 0)}</span>
                          </div>
                          {savings !== null && (
                            <div className="text-[10px] text-zinc-400 font-medium">
                              {savings > 0 ? (
                                <span>Compressed: <strong className="text-emerald-600">{savings}% smaller</strong></span>
                              ) : (
                                <span>Size: <strong className="text-zinc-600">+{Math.abs(savings)}% larger</strong></span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'completed' && item.outputUrl && (
                        <a
                          href={item.outputUrl}
                          download={item.outputName || 'image.jpg'}
                          className="p-2 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download individual file"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove from queue"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
