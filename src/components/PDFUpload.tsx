/**
 * PDF Upload Component for PDF Summarizer
 * Handles PDF upload, validation, and processing
 */

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { processPDF, ProcessingProgress } from "@/lib/pdfProcessor";

interface PDFUploadProps {
  onUploadComplete: (fileId: string, extractedText: string) => void;
  onCancel?: () => void;
}

const PDFUpload = ({ onUploadComplete, onCancel }: PDFUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [processedText, setProcessedText] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setProcessedText(null);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setProcessedText(null);
      }
    }
  };

  const processPDFFile = async () => {
    if (!file || !user) return;

    setIsProcessing(true);
    setProgress({
      stage: 'parsing',
      current: 0,
      total: 100,
      message: 'Starting PDF processing...',
    });

    try {
      // Process PDF (extract text + OCR if needed)
      const result = await processPDF(file, (prog) => {
        setProgress(prog);
      });

      setProcessedText(result.text);
      setIsProcessing(false);
      
      toast({
        title: "PDF processed successfully",
        description: result.isScanned
          ? `Extracted text from ${result.numPages} pages using OCR`
          : `Extracted text from ${result.numPages} pages`,
      });
    } catch (error: any) {
      console.error('PDF processing error:', error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process PDF",
        variant: "destructive",
      });
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const uploadToStorage = async () => {
    if (!file || !user || !processedText) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileId = crypto.randomUUID();
      const filePath = `${user.id}/${fileId}.${fileExt}`;

      // Upload PDF to storage
      const { error: uploadError } = await supabase.storage
        .from("pdf-uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Store extracted text in files table
      const { error: fileError } = await supabase
        .from("files")
        .insert({
          user_id: user.id,
          pdf_url: filePath,
          extracted_text: processedText,
          ocr_used: processedText.length > 0, // Simple check
        });

      if (fileError) throw fileError;

      toast({
        title: "PDF uploaded successfully",
        description: "Your PDF is ready for summarization",
      });

      onUploadComplete(fileId, processedText);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center
            transition-all duration-300 cursor-pointer
            ${isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>

          <p className="font-medium mb-1">
            {isDragging ? "Drop your PDF here" : "Upload PDF for summarization"}
          </p>
          <p className="text-sm text-muted-foreground">
            PDF files up to 100MB • Supports text and scanned PDFs
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            {!isProcessing && !processedText && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFile(null);
                  setProcessedText(null);
                  setProgress(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Processing Progress */}
          {isProcessing && progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progress.message}</span>
                <span className="font-medium">{progress.current}%</span>
              </div>
              <Progress value={progress.current} className="h-2" />
            </div>
          )}

          {/* Processed Status */}
          {processedText && !isProcessing && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  PDF processed successfully
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {processedText.length.toLocaleString()} characters extracted
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={isProcessing || isUploading}>
                Cancel
              </Button>
            )}
            {!processedText && (
              <Button
                variant="hero"
                onClick={processPDFFile}
                disabled={isProcessing || isUploading}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Process PDF
                  </>
                )}
              </Button>
            )}
            {processedText && (
              <Button
                variant="hero"
                onClick={uploadToStorage}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Continue
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUpload;

