/**
 * Shared Type Definitions for FastImage.tools
 */

export type AppRoute =
  | '/'
  | '/webp-to-jpg'
  | '/svg-to-png'
  | '/aspect-ratio-resizer'
  | '/remove-exif-data'
  | '/image-color-extractor'
  | '/circle-crop'
  | '/dpi-checker'
  | '/all-tools'
  | '/about'
  | '/privacy'
  | '/terms'
  | '/contact';

export type ToolCategory = 'convert' | 'resize-crop' | 'metadata-info' | 'color';

export interface ImageTool {
  id: string;
  name: string;
  description: string;
  route: AppRoute;
  iconName: string;
  category: ToolCategory;
  longDescription: string;
}

export interface ProcessFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth?: number;
  originalHeight?: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  previewUrl?: string; // URL for rendering raw/original file
  outputUrl?: string;  // URL for rendering completed output
  outputName?: string;
  outputSize?: number;
  outputWidth?: number;
  outputHeight?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ExtractedColor {
  hex: string;
  rgb: string;
  hsl: string;
  percentage: number;
}
