import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export default function Diagnostics() {
  const { user } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newResults: DiagnosticResult[] = [];

    // 1. Check Environment Variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    newResults.push({
      name: 'Supabase URL',
      status: supabaseUrl ? 'pass' : 'fail',
      message: supabaseUrl ? 'Configured' : 'Missing VITE_SUPABASE_URL',
      details: supabaseUrl || 'Not set'
    });

    newResults.push({
      name: 'Supabase Key',
      status: supabaseKey ? 'pass' : 'fail',
      message: supabaseKey ? 'Configured' : 'Missing VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY',
      details: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not set'
    });

    newResults.push({
      name: 'Paystack Public Key',
      status: paystackKey ? 'pass' : 'warning',
      message: paystackKey ? 'Configured' : 'Missing VITE_PAYSTACK_PUBLIC_KEY',
      details: paystackKey ? `${paystackKey.substring(0, 20)}...` : 'Not set (payment features will not work)'
    });

    // 2. Test Supabase Connection
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      newResults.push({
        name: 'Supabase Connection',
        status: error ? 'fail' : 'pass',
        message: error ? 'Connection failed' : 'Connected successfully',
        details: error?.message || 'Database accessible'
      });
    } catch (err: any) {
      newResults.push({
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Connection error',
        details: err.message
      });
    }

    // 3. Test Authentication
    if (user) {
      newResults.push({
        name: 'User Authentication',
        status: 'pass',
        message: 'User authenticated',
        details: `User ID: ${user.id.substring(0, 8)}...`
      });
    } else {
      newResults.push({
        name: 'User Authentication',
        status: 'warning',
        message: 'Not authenticated',
        details: 'Please log in to test authenticated features'
      });
    }

    // 4. Test Edge Functions
    const edgeFunctions = ['query-document', 'summarize-pdf', 'process-pdf', 'paystack-initialize'];
    
    for (const funcName of edgeFunctions) {
      try {
        const { error } = await supabase.functions.invoke(funcName, {
          body: { test: true }
        });
        
        // If we get an error but it's not a "function not found" error, the function exists
        const exists = error?.message?.includes('Missing required') || 
                      error?.message?.includes('Not authenticated') ||
                      error?.message?.includes('test');
        
        newResults.push({
          name: `Edge Function: ${funcName}`,
          status: exists ? 'pass' : 'fail',
          message: exists ? 'Function exists' : 'Function not found or not deployed',
          details: error?.message || 'Function accessible'
        });
      } catch (err: any) {
        newResults.push({
          name: `Edge Function: ${funcName}`,
          status: 'fail',
          message: 'Function error',
          details: err.message
        });
      }
    }

    // 5. Test Storage Buckets
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      const documentsBucket = buckets?.find(b => b.name === 'documents');
      
      newResults.push({
        name: 'Storage: documents bucket',
        status: documentsBucket ? 'pass' : 'fail',
        message: documentsBucket ? 'Bucket exists' : 'Bucket not found',
        details: documentsBucket ? 'Accessible' : 'Create a "documents" bucket in Supabase Storage'
      });
    } catch (err: any) {
      newResults.push({
        name: 'Storage: documents bucket',
        status: 'fail',
        message: 'Storage error',
        details: err.message
      });
    }

    // 6. Test Database Tables
    const requiredTables = ['users', 'documents', 'pdf_chunks', 'chat_messages', 'summaries'] as const;
    
    for (const tableName of requiredTables) {
      try {
        // Use type-safe table names
        const { error } = await supabase.from(tableName).select('id').limit(1);
        newResults.push({
          name: `Database Table: ${tableName}`,
          status: error ? 'fail' : 'pass',
          message: error ? 'Table not found' : 'Table exists',
          details: error?.message || 'Accessible'
        });
      } catch (err: unknown) {
        newResults.push({
          name: `Database Table: ${tableName}`,
          status: 'fail',
          message: 'Table error',
          details: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    setResults(newResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">WARNING</Badge>;
    }
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Diagnostics</CardTitle>
            <CardDescription>
              Check system configuration and connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-500">{passCount}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">{warningCount}</div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{failCount}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
              <Button onClick={runDiagnostics} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  'Run Diagnostics'
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{result.name}</h3>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {result.message}
                          </p>
                          {result.details && (
                            <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded mt-2">
                              {result.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {results.length === 0 && !isRunning && (
              <div className="text-center py-8 text-muted-foreground">
                Click "Run Diagnostics" to start
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

