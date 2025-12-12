import { useState } from "react";
import { Upload, X, Loader2, FileText, Image, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  processDocument, 
  isFileSupported, 
  getAcceptString,
  getFileCategory 
} from "@/lib/documentProcessor";

interface DocumentUploadProps {
  onUploadComplete: () => void;
  onCancel?: () => void;
}

const DocumentUpload = ({ onUploadComplete, onCancel }: DocumentUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const validateFile = (file: File) => {
    if (!isFileSupported(file)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, Word, PowerPoint, Text, or Image file",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
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
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const uploadFile = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    setUploadStatus("Processing document...");

    try {
      // Extract text from document
      const processedDoc = await processDocument(file, (status) => {
        setUploadStatus(status);
      });

      const fileExt = file.name.split(".").pop();
      const documentId = crypto.randomUUID();
      const filePath = `${user.id}/${documentId}.${fileExt}`;

      setUploadStatus("Uploading file...");

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase.from("documents").insert({
        id: documentId,
        user_id: user.id,
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type || getFileCategory(file),
        status: "processing",
      });

      if (dbError) throw dbError;

      // Process and store chunks for AI chat
      if (processedDoc.text) {
        setUploadStatus("Preparing document for AI chat...");
        const { error: processError } = await supabase.functions.invoke("process-pdf", {
          body: {
            text: processedDoc.text,
            pdfId: documentId,
            userId: user.id,
          },
        });

        if (processError) {
          console.error("Error processing document:", processError);
        }
      }

      // Update status to ready
      await supabase
        .from("documents")
        .update({ status: "ready" })
        .eq("id", documentId);

      toast({
        title: "Document uploaded",
        description: processedDoc.isOCR 
          ? "Text extracted via OCR. Document ready for chatting!"
          : "Your document is ready for chatting",
      });

      onUploadComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-5 h-5 text-primary" />;
    const category = getFileCategory(file);
    if (category === 'image') return <Image className="w-5 h-5 text-primary" />;
    if (category === 'pptx') return <FileSpreadsheet className="w-5 h-5 text-primary" />;
    return <FileText className="w-5 h-5 text-primary" />;
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
            type="file"
            accept={getAcceptString()}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>

          <p className="font-medium mb-1">
            {isDragging ? "Drop your document here" : "Upload your document"}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            All major formats supported, up to 100MB
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <span className="px-2 py-0.5 bg-muted rounded text-xs">PDF</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">DOCX</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">PPTX</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">TXT</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">MD</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">CSV</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">HTML</span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">JPG/PNG</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isUploading}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {uploadStatus && (
        <p className="text-sm text-muted-foreground text-center">{uploadStatus}</p>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
        )}
        <Button
          variant="hero"
          onClick={uploadFile}
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;
