import { OCRProcessor } from '@/components/ocr/OCRProcessor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const OCR = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">OCR - Text Extraction</h1>
              <p className="text-sm text-muted-foreground">Extract text from images using AI</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <OCRProcessor />
        </div>
      </main>
    </div>
  );
};

export default OCR;
