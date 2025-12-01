/// API endpoint constants
class ApiConstants {
  // Supabase Tables
  static const String profilesTable = 'profiles';
  static const String documentsTable = 'documents';
  
  // Supabase Storage Buckets
  static const String documentsBucket = 'documents';
  
  // AI Service Endpoints (for future OpenAI integration)
  static const String openAiBaseUrl = 'https://api.openai.com/v1';
  static const String chatCompletionsEndpoint = '/chat/completions';
  
  // Document Status
  static const String statusProcessing = 'processing';
  static const String statusReady = 'ready';
  static const String statusFailed = 'failed';
}
