import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSummaryGeneration, SummaryType } from '@/hooks/useSummaryGeneration';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, AlertCircle, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SummaryGeneratorProps {
  documentId: string;
  documentName: string;
}

const FREE_DAILY_SUMMARY_LIMIT = 5;

export const SummaryGenerator = ({ documentId, documentName }: SummaryGeneratorProps) => {
  const navigate = useNavigate();
  const { isGenerating, error, summary, generateSummary, clearSummary } = useSummaryGeneration();
  const { plan, dailyUsage, incrementUsage } = useSubscription();
  const [summaryType, setSummaryType] = useState<SummaryType>('standard');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const creditCosts = {
    brief: 5,
    standard: 10,
    detailed: 25
  };

  const handleGenerate = async () => {
    // Check if free user has exceeded daily limit
    if (plan === 'free' && dailyUsage >= FREE_DAILY_SUMMARY_LIMIT) {
      toast({
        title: 'Daily limit reached',
        description: 'You have used all your free daily summaries. Upgrade to continue.',
        variant: 'destructive',
      });
      navigate('/pricing');
      return;
    }

    try {
      await generateSummary(documentId, summaryType);
      await incrementUsage();
      toast({
        title: 'Summary Generated',
        description: `Used ${creditCosts[summaryType]} credits`,
      });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    
    await navigator.clipboard.writeText(summary.summary);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      description: 'Summary copied successfully',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generate Summary
        </CardTitle>
        <CardDescription>
          AI-powered summary of: {documentName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!summary ? (
          <>
            {/* Summary Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Summary Type</Label>
              
              <RadioGroup value={summaryType} onValueChange={(value) => setSummaryType(value as SummaryType)}>
                <div className="space-y-3">
                  {/* Brief */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="brief" id="brief" />
                    <Label htmlFor="brief" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Brief Summary</div>
                          <div className="text-sm text-muted-foreground">2-3 sentences, main points only</div>
                        </div>
                        <Badge variant="secondary">{creditCosts.brief} credits</Badge>
                      </div>
                    </Label>
                  </div>

                  {/* Standard */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Standard Summary</div>
                          <div className="text-sm text-muted-foreground">Comprehensive overview with key points</div>
                        </div>
                        <Badge variant="secondary">{creditCosts.standard} credits</Badge>
                      </div>
                    </Label>
                  </div>

                  {/* Detailed */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <Label htmlFor="detailed" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Detailed Summary</div>
                          <div className="text-sm text-muted-foreground">In-depth analysis with evidence and conclusions</div>
                        </div>
                        <Badge variant="secondary">{creditCosts.detailed} credits</Badge>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
                  <Badge variant="outline" className="ml-2">{creditCosts[summaryType]} credits</Badge>
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Summary Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="default" className="mb-2">
                    {summary.summaryType.charAt(0).toUpperCase() + summary.summaryType.slice(1)} Summary
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Used {summary.creditsUsed} credits
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSummary}
                  >
                    New Summary
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="whitespace-pre-wrap leading-relaxed">{summary.summary}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
