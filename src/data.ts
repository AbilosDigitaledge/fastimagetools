import { ImageTool, FAQItem } from './types';

export const TOOLS: ImageTool[] = [
  {
    id: 'webp-to-jpg',
    name: 'WebP to JPG Batch Converter',
    description: 'Convert WebP images to JPG format instantly in your browser. Supports multiple files.',
    longDescription: 'Our WebP to JPG Batch Converter processes your WebP images locally on your computer. By utilizing modern web tech, you can convert dozens of images simultaneously with full quality control, maintaining perfect privacy without uploading a single byte to an external server.',
    route: '/webp-to-jpg',
    iconName: 'RefreshCw',
    category: 'convert'
  },
  {
    id: 'svg-to-png',
    name: 'SVG to PNG Converter',
    description: 'Convert SVG graphics to high-quality PNG images directly in your browser. Select custom dimensions.',
    longDescription: 'The SVG to PNG Converter transforms scalable vector graphics into crisp, rasterized PNG files. Perfect for web developers and designers, you can set custom output dimensions, maintain aspect ratios, and choose transparent or solid color backdrops instantly in the browser.',
    route: '/svg-to-png',
    iconName: 'FileCode',
    category: 'convert'
  },
  {
    id: 'aspect-ratio-resizer',
    name: 'Image Aspect Ratio Resizer',
    description: 'Resize images while maintaining, forcing, or adjusting standard aspect ratios for social media.',
    longDescription: 'Quickly scale and fit your photos into specific aspect ratio presets (like Square, Landscape, Portrait, and popular social dimensions like Instagram or YouTube). Lock your aspect ratio to prevent distortions, and choose whether to Crop or Fit the content.',
    route: '/aspect-ratio-resizer',
    iconName: 'Maximize2',
    category: 'resize-crop'
  },
  {
    id: 'circle-crop',
    name: 'Circle Crop Tool',
    description: 'Turn square or rectangular photos into circular crops for clean profile pictures and avatars.',
    longDescription: 'The Circle Crop tool allows you to visually pan, zoom, and crop any image into a perfect circle. Generates transparent PNG outputs ideal for forum avatars, Slack profiles, Instagram profile photos, or professional web graphics.',
    route: '/circle-crop',
    iconName: 'Crop',
    category: 'resize-crop'
  },
  {
    id: 'remove-exif-data',
    name: 'EXIF Metadata Stripper',
    description: 'Remove hidden camera settings, locations, and timestamps from your images to protect your privacy.',
    longDescription: 'Image files often carry invisible metadata (EXIF) containing GPS coordinates, camera models, dates, and times. Our EXIF Metadata Stripper inspects these values locally and outputs a clean copy of your image, safeguarding your privacy before you post online.',
    route: '/remove-exif-data',
    iconName: 'Layers',
    category: 'metadata-info'
  },
  {
    id: 'dpi-checker',
    name: 'DPI Checker & Inspector',
    description: 'Read the native pixel resolution and check the embedded DPI (dots per inch) metadata of any image.',
    longDescription: 'The DPI Checker identifies physical resolution tags (DPI/PPI) on supported formats (JPEG/PNG/TIFF) and calculates physical print dimensions. This tool helps designers and marketers verify if an asset meets strict high-resolution printing requirements (such as 300 DPI).',
    route: '/dpi-checker',
    iconName: 'Info',
    category: 'metadata-info'
  },
  {
    id: 'image-color-extractor',
    name: 'Image Color Extractor',
    description: 'Extract dominant colors and generate an elegant palette with HEX and RGB codes from any image.',
    longDescription: 'The Image Color Extractor analyzes the pixels of your uploaded image locally, finding dominant hues and building a balanced color palette. Copy HEX, RGB, or HSL color values in a single click, which is ideal for web development, UI design, and branding projects.',
    route: '/image-color-extractor',
    iconName: 'Sliders',
    category: 'color'
  }
];

export const FAQS: Record<string, FAQItem[]> = {
  homepage: [
    {
      question: 'Are my images uploaded to FastImage.tools servers?',
      answer: 'No. FastImage.tools is designed as a browser-first, client-side application. All image conversions, resizing, color extractions, and metadata stripping happen locally on your computer or phone using modern browser technology. Your images are never sent to a remote server.'
    },
    {
      question: 'Is FastImage.tools really free to use?',
      answer: 'Yes, 100% free. You can convert, crop, resize, and inspect as many images as you want without creating an account, entering an email, or running into daily limits.'
    },
    {
      question: 'Which image formats are supported?',
      answer: 'Our tools support popular web and design formats including WebP, SVG, PNG, JPG/JPEG, GIF, ICO, and BMP, depending on the specific tool. For example, the WebP converter processes WebP files into JPEG, while the SVG tool processes Vector graphics.'
    },
    {
      question: 'How is browser-based processing faster?',
      answer: 'Traditional online tools make you upload files to a server, wait in a processing queue, wait for the server to process, and then download the results. FastImage.tools processes images instantly in your local browser engine. There is zero upload waiting time, making it exceptionally fast.'
    },
    {
      question: 'Can I use these tools on my mobile phone?',
      answer: 'Absolutely. FastImage.tools is designed mobile-first. It is fully responsive and supports touchscreen controls, touch-friendly sliders, and standard mobile file-choosers.'
    }
  ],
  'webp-to-jpg': [
    {
      question: 'What is a WebP image, and why convert it to JPG?',
      answer: 'WebP is a modern image format developed by Google that provides superior lossy and lossless compression. However, older software, certain email clients, offline document systems, and specific web platforms do not support WebP. Converting WebP to JPG ensures universal compatibility.'
    },
    {
      question: 'Does converting WebP to JPG reduce image quality?',
      answer: 'Both WebP and JPG are lossy formats. While some visual fidelity is technically altered during re-encoding, you can adjust our Quality Slider (e.g., to 90% or 95%) to ensure the conversion remains visually indistinguishable from the original WebP while maintaining an optimized file size.'
    },
    {
      question: 'How many WebP files can I convert at once?',
      answer: 'FastImage.tools supports batch conversions! You can drag and drop dozens of WebP files at once. Since the processing runs entirely inside your browser, the limit depends purely on your device\'s available RAM.'
    },
    {
      question: 'Do you keep a copy of my converted JPGs?',
      answer: 'Never. The entire WebP conversion process happens in your browser using the Canvas and Blob APIs. No data is sent to our server, so we physically have no way of viewing or saving your files.'
    },
    {
      question: 'What does the Quality Slider do?',
      answer: 'The quality slider determines the balance between visual details and output file size. Lower values (e.g., 50-70) result in smaller files with noticeable artifacts, while higher values (e.g., 90-100) maintain pristine image clarity at the expense of larger file sizes.'
    }
  ],
  'svg-to-png': [
    {
      question: 'What is an SVG, and why convert it to PNG?',
      answer: 'SVG stands for Scalable Vector Graphics. It is code-based and scales infinitely. PNG is a rasterized pixel format. You convert SVG to PNG when you need to use the asset in an environment that only supports standard raster images, like standard social media posts, mobile UI elements, presentation slides, or print documents.'
    },
    {
      question: 'Can I choose the output resolution of the PNG?',
      answer: 'Yes! Unlike simple converters, our tool lets you specify exact Output Width and Height in pixels. When you change one value, the Aspect Ratio Lock keeps the dimensions perfectly proportional.'
    },
    {
      question: 'Is transparent background preserved during conversion?',
      answer: 'Yes. By default, the output PNG background is set to "Transparent". If your SVG has a transparent background, the resulting PNG will too. You can also force a solid White background or a custom color of your choice.'
    },
    {
      question: 'What safety measures do you take with SVG files?',
      answer: 'SVG files are written in XML, which means they can technically contain malicious scripts or tracking tags. Our tool sanitizes and renders SVGs safely in sandboxed Canvas contexts, preventing any code execution or external resource leaks.'
    }
  ],
  'aspect-ratio-resizer': [
    {
      question: 'What is an Aspect Ratio?',
      answer: 'Aspect ratio is the proportional relationship between an image\'s width and height. It is written as two numbers separated by a colon, like 16:9 for landscape widescreen, or 1:1 for a perfect square.'
    },
    {
      question: 'What is the difference between "Crop" and "Fit"?',
      answer: '"Crop" will scale the image to completely fill the new dimensions, clipping any parts that fall outside the target ratio. "Fit" scales the image so the entire file remains visible, adding blank space (or letterboxing) around the edges if the ratios don\'t match.'
    },
    {
      question: 'What are the common aspect ratios for social media?',
      answer: '• 1:1 - Ideal for standard Instagram posts and profile grids.\n• 9:16 - Best for vertical video, Instagram Stories, TikTok, and YouTube Shorts.\n• 16:9 - Standard for widescreen landscapes, YouTube video thumbnails, and Facebook headers.\n• 4:3 - Traditional photo print and television aspect ratio.'
    },
    {
      question: 'Is my resized image compressed?',
      answer: 'No, our resizer outputs high-quality images directly. If you want further compression, you can adjust output settings or use optimized formats.'
    }
  ],
  'circle-crop': [
    {
      question: 'Why crop an image into a circle?',
      answer: 'Circular images are extremely common for user interfaces, such as round profile pictures, contact list avatars, team pages, or custom button graphics. Rounding the image client-side saves you from writing complex CSS masks.'
    },
    {
      question: 'Is the cropped image background transparent?',
      answer: 'Yes. The Circle Crop tool exports the cropped image as a transparent PNG. The area outside the circle will be completely transparent, allowing the avatar to sit cleanly on any dark, light, or patterned website background.'
    },
    {
      question: 'How do I center my face or object?',
      answer: 'Simply click and drag (or touch and drag on mobile) to reposition the image within the circle grid. You can also use the Zoom slider to focus closely on a particular face, object, or icon.'
    }
  ],
  'remove-exif-data': [
    {
      question: 'What is EXIF metadata?',
      answer: 'EXIF (Exchangeable Image File Format) is a metadata standard embedded within images (like JPEGs) when taken by a digital camera or phone. It can contain camera models, exposure settings, exact dates, and crucial privacy details like GPS latitude and longitude.'
    },
    {
      question: 'Why should I remove EXIF data?',
      answer: 'When you share pictures online, anyone can download them and read the embedded metadata. This can reveal where you live, where your children go to school, or when you are away from home. Stripping EXIF metadata preserves your physical and digital privacy.'
    },
    {
      question: 'How does FastImage.tools strip this metadata?',
      answer: 'When you upload an image, we redraw the pixels onto a clean HTML5 canvas and re-encode it, leaving behind all non-pixel data, including EXIF, GPS, and custom camera segments. This creates a completely clean copy of the image.'
    },
    {
      question: 'Does stripping EXIF data lower the image quality?',
      answer: 'By redrawing on the canvas, we do a high-fidelity export. You won\'t see any visual difference in your image, but the files will actually be slightly smaller because the bloated text segments have been removed.'
    }
  ],
  'dpi-checker': [
    {
      question: 'What is DPI in an image?',
      answer: 'DPI stands for "Dots Per Inch". In digital imaging, it refers to metadata embedded in the file headers instructing a printer on how many pixels to print per physical inch. It does not affect how the image displays on screens, but it is critical for physical print quality.'
    },
    {
      question: 'Why is 300 DPI important?',
      answer: '300 DPI is the universal standard for high-quality professional printing. At 300 DPI, individual pixels are invisible to the human eye at standard viewing distances, making prints appear razor-sharp.'
    },
    {
      question: 'What if my image has no DPI metadata?',
      answer: 'Many screenshots, web images, and smartphone photos do not have any DPI metadata embedded—they rely entirely on pixel dimensions. If no metadata is found, we will display a clear explanation and show how your pixels translate to physical inches at standard densities like 72 DPI, 150 DPI, and 300 DPI.'
    },
    {
      question: 'How do I calculate print size from pixels?',
      answer: 'Physical size = (Pixel dimension) / (DPI). For example, a 3000 x 2400 pixel photo printed at 300 DPI will have a physical size of 10 x 8 inches.'
    }
  ],
  'image-color-extractor': [
    {
      question: 'How does the color extractor find colors?',
      answer: 'The extractor takes the pixel data of your image, filters them through a quantization algorithm, and ranks them by frequency and vibrancy. This highlights the dominant and supporting tones that give the image its unique color scheme.'
    },
    {
      question: 'Can I copy the hex codes?',
      answer: 'Yes! Simply click any color swatch or hex value displayed in the extracted palette, and the HEX or RGB string is immediately copied to your clipboard.'
    },
    {
      question: 'How can this palette be used?',
      answer: 'Designers use color extractions to build matching web pages, find contrasting text colors for graphics, establish cohesive product branding, or pair photographs with matching typography color palettes.'
    }
  ]
};
