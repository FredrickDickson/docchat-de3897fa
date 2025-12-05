import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import PDFSummarizer from "./pages/PDFSummarizer";
import IntegrationSettings from "./pages/IntegrationSettings";
import Pricing from "./pages/Pricing";
import ChatPage from "./pages/ChatPage";
import DocumentDetail from "./pages/DocumentDetail";
import Analytics from "./pages/Analytics";
import OCR from "./pages/OCR";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutFailure from "./pages/CheckoutFailure";
import Diagnostics from "./pages/Diagnostics";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/summarizer" 
              element={
                <ProtectedRoute>
                  <PDFSummarizer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/integrations" 
              element={
                <ProtectedRoute>
                  <IntegrationSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pricing" 
              element={
                <ProtectedRoute>
                  <Pricing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:id" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/document/:id" 
              element={
                <ProtectedRoute>
                  <DocumentDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ocr" 
              element={
                <ProtectedRoute>
                  <OCR />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/diagnostics" 
              element={<Diagnostics />} 
            />
            <Route 
              path="/checkout/success" 
              element={
                <ProtectedRoute>
                  <CheckoutSuccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout/failure" 
              element={
                <ProtectedRoute>
                  <CheckoutFailure />
                </ProtectedRoute>
              } 
            />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/faq" element={<FAQ />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
