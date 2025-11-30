import { useState } from "react";
import { Copy, Download, Check, FileText, List, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SummaryResultProps {
  summary: string;
  fileName: string;
  onReset: () => void;
}

type FormatType = "paragraph" | "bullets";

const SummaryResult = ({ summary, fileName, onReset }: SummaryResultProps) => {
  const [format, setFormat] = useState<FormatType>("paragraph");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatSummary = (text: string, formatType: FormatType) => {
    if (formatType === "bullets") {
      const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      return sentences.map(s => `• ${s.trim()}`).join("\n");
    }
    return text;
  };

  const handleCopy = async () => {
    const textToCopy = formatSummary(summary, format);
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Summary has been copied",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = formatSummary(summary, format);
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${fileName.replace(".pdf", "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download started",
      description: "Your summary is being downloaded",
    });
  };

  const displayText = formatSummary(summary, format);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Summary complete</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif mb-2">
              Your summary is ready
            </h2>
            <p className="text-muted-foreground">
              From: {fileName}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden animate-scale-in">
            {/* Format toggle */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-medium">Summary</span>
              </div>
              
              <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                <button
                  onClick={() => setFormat("paragraph")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                    format === "paragraph"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                  Paragraph
                </button>
                <button
                  onClick={() => setFormat("bullets")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                    format === "bullets"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                  Bullets
                </button>
              </div>
            </div>

            {/* Summary content */}
            <div className="p-6">
              <div className="whitespace-pre-line text-foreground leading-relaxed">
                {displayText}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 p-4 border-t border-border bg-muted/30">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4" />
                Download TXT
              </Button>
              <div className="flex-1" />
              <Button variant="hero" onClick={onReset}>
                Summarize another
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummaryResult;
