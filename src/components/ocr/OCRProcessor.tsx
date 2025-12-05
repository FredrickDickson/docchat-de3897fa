import { useState, useRef } from 'react';
import { useOCR } from '@/hooks/useOCR';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, FileImage, Copy, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OCRProcessor = () => {
  const { isProcessing, error, result, processImage, clearResult } = useOCR();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    
    // Clear previous result
    clearResult();
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    try {
      await processImage(selectedFile);
      toast({
        title: 'OCR Complete',
        description: 'Text extracted successfully',
      });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      description: 'Extracted text copied successfully',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    clearResult();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="w-5 h-5" />
          OCR - Extract Text from Images
        </CardTitle>
        <CardDescription>
          Upload an image to extract text using AI-powered OCR
          <Badge variant="secondary" className="ml-2">2 credits per image</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!result ? (
          <>
            {/* File Upload */}
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-accent transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Click to upload image</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="relative border rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full max-h-96 object-contain bg-muted"
                      />
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileImage className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{selectedFile.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Process Button */}
            {selectedFile && (
              <Button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Image...
                  </>
                ) : (
                  <>
                    <FileImage className="w-4 h-4 mr-2" />
                    Extract Text
                    <Badge variant="outline" className="ml-2">2 credits</Badge>
                  </>
                )}
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Result Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="default" className="mb-2">
                    OCR Complete
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {result.creditsUsed} credits used • {result.text.length} characters extracted
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    New Image
                  </Button>
                </div>
              </div>

              <Textarea
                value={result.text}
                readOnly
                className="min-h-[300px] font-mono text-sm"
                placeholder="Extracted text will appear here..."
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
