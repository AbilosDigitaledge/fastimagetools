import React, { useRef, useState } from 'react';
import { Upload, FileWarning } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  subLabel?: string;
}

export default function FileDropzone({
  onFilesSelected,
  accept,
  multiple = true,
  maxSizeMB = 50,
  label = 'Drop your files here',
  subLabel = 'or click to browse from your device',
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Filter accept extension types
    const acceptList = accept.split(',').map((t) => t.trim().toLowerCase());

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileNameLower = file.name.toLowerCase();

      // Check file size
      if (file.size > maxSizeBytes) {
        setErrorMessage(`File "${file.name}" is too large. Max size is ${maxSizeMB}MB.`);
        continue;
      }

      // Check file type
      const isAccepted = acceptList.some((ext) => {
        if (ext === 'image/*') return file.type.startsWith('image/');
        if (ext.startsWith('.')) return fileNameLower.endsWith(ext);
        // MIME type match
        return file.type === ext;
      });

      if (!isAccepted) {
        setErrorMessage(`File "${file.name}" has an unsupported format. Expected: ${accept}`);
        continue;
      }

      validFiles.push(file);

      // If single file only, break after first valid
      if (!multiple && validFiles.length === 1) {
        break;
      }
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        id="dropzone-container"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative flex flex-col items-center justify-center w-full min-h-[220px] p-8 text-center rounded-2xl border-2 border-dashed cursor-pointer select-none transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/20 shadow-inner'
            : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/40 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="dropzone-file-input"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />

        <div className="p-4 rounded-full bg-zinc-50 border border-zinc-100/80 mb-4 text-zinc-400 group-hover:scale-105 transition-transform duration-200">
          <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-500 animate-bounce' : 'text-zinc-400'}`} />
        </div>

        <h3 className="text-lg font-semibold text-zinc-800 leading-snug">{label}</h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-sm">{subLabel}</p>

        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          Local Processing
        </div>
      </div>

      {errorMessage && (
        <div
          id="dropzone-error"
          className="mt-3 flex items-start gap-2 p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 text-sm text-rose-700"
        >
          <FileWarning className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
