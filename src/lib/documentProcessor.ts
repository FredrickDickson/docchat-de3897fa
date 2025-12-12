/**
 * Document Processor
 * Handles text extraction from multiple file formats
 */

import * as pdfjsLib from "pdfjs-dist";

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessedDocument {
  text: string;
  fileType: string;
  pageCount?: number;
  isOCR?: boolean;
}

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

/**
 * Extract text from plain text file
 */
export const extractTextFromTXT = async (file: File): Promise<string> => {
  return await file.text();
};

/**
 * Extract text from image using OCR via Puter.js
 */
export const extractTextFromImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataURL = reader.result as string;
        
        // Check if Puter.js is available
        if (typeof window !== 'undefined' && (window as any).puter?.ai?.img2txt) {
          const text = await (window as any).puter.ai.img2txt(dataURL);
          resolve(text || "No text detected in image");
        } else {
          // Fallback message if Puter.js isn't loaded
          resolve("[OCR not available - Puter.js not loaded. Image uploaded: " + file.name + "]");
        }
      } catch (error) {
        console.error("OCR error:", error);
        reject(new Error("Failed to extract text from image"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Extract text from DOCX file
 * Note: Full DOCX parsing would require mammoth.js library
 * This is a basic implementation that extracts raw text
 */
export const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // DOCX files are ZIP archives containing XML
    // We'll try to extract text from the document.xml file
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(uint8Array);
    
    const documentXml = await zip.file('word/document.xml')?.async('text');
    if (!documentXml) {
      throw new Error('Could not find document.xml in DOCX file');
    }
    
    // Extract text content from XML (basic parsing)
    const textContent = documentXml
      .replace(/<[^>]+>/g, ' ')  // Remove XML tags
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
    
    return textContent || "No text content found in document";
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return `[Unable to fully parse DOCX file: ${file.name}. The document has been uploaded but text extraction failed.]`;
  }
};

/**
 * Extract text from PPTX file
 * Note: Full PPTX parsing would require additional libraries
 */
export const extractTextFromPPTX = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(uint8Array);
    
    let allText = "";
    let slideNum = 1;
    
    // PPTX slides are in ppt/slides/slide1.xml, slide2.xml, etc.
    const slideFiles = Object.keys(zip.files).filter(name => 
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    ).sort();
    
    for (const slideFile of slideFiles) {
      const slideXml = await zip.file(slideFile)?.async('text');
      if (slideXml) {
        const textContent = slideXml
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (textContent) {
          allText += `--- Slide ${slideNum} ---\n${textContent}\n\n`;
        }
        slideNum++;
      }
    }
    
    return allText.trim() || "No text content found in presentation";
  } catch (error) {
    console.error("Error extracting text from PPTX:", error);
    return `[Unable to fully parse PPTX file: ${file.name}. The presentation has been uploaded but text extraction failed.]`;
  }
};

/**
 * Get supported file types
 */
export const getSupportedFileTypes = () => ({
  pdf: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    label: 'PDF'
  },
  docx: {
    extensions: ['.docx', '.doc'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ],
    label: 'Word'
  },
  pptx: {
    extensions: ['.pptx', '.ppt'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ],
    label: 'PowerPoint'
  },
  txt: {
    extensions: ['.txt', '.md', '.csv', '.html', '.rtf'],
    mimeTypes: ['text/plain', 'text/markdown', 'text/csv', 'text/html', 'application/rtf'],
    label: 'Text'
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'],
    label: 'Image (OCR)'
  }
});

/**
 * Check if file type is supported
 */
export const isFileSupported = (file: File): boolean => {
  const types = getSupportedFileTypes();
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  
  for (const category of Object.values(types)) {
    if (category.mimeTypes.includes(fileType)) return true;
    if (category.extensions.some(ext => fileName.endsWith(ext))) return true;
  }
  
  return false;
};

/**
 * Get file category
 */
export const getFileCategory = (file: File): string => {
  const types = getSupportedFileTypes();
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  
  for (const [key, category] of Object.entries(types)) {
    if (category.mimeTypes.includes(fileType)) return key;
    if (category.extensions.some(ext => fileName.endsWith(ext))) return key;
  }
  
  return 'unknown';
};

/**
 * Process any supported document and extract text
 */
export const processDocument = async (
  file: File,
  onProgress?: (message: string) => void
): Promise<ProcessedDocument> => {
  const category = getFileCategory(file);
  
  onProgress?.(`Processing ${file.name}...`);
  
  let text = "";
  let isOCR = false;
  
  switch (category) {
    case 'pdf':
      onProgress?.("Extracting text from PDF...");
      text = await extractTextFromPDF(file);
      break;
      
    case 'txt':
      onProgress?.("Reading text file...");
      text = await extractTextFromTXT(file);
      break;
      
    case 'docx':
      onProgress?.("Extracting text from Word document...");
      text = await extractTextFromDOCX(file);
      break;
      
    case 'pptx':
      onProgress?.("Extracting text from presentation...");
      text = await extractTextFromPPTX(file);
      break;
      
    case 'image':
      onProgress?.("Running OCR on image...");
      text = await extractTextFromImage(file);
      isOCR = true;
      break;
      
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
  
  // Check if we got meaningful text
  if (!text || text.trim().length < 10) {
    throw new Error("Could not extract meaningful text from document");
  }
  
  onProgress?.("Processing complete!");
  
  return {
    text: text.trim(),
    fileType: category,
    isOCR
  };
};

/**
 * Get accept string for file input
 */
export const getAcceptString = (): string => {
  const types = getSupportedFileTypes();
  const extensions: string[] = [];
  const mimeTypes: string[] = [];
  
  for (const category of Object.values(types)) {
    extensions.push(...category.extensions);
    mimeTypes.push(...category.mimeTypes);
  }
  
  return [...extensions, ...mimeTypes].join(',');
};
