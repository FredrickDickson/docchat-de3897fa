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
  
  // DeepSeek API
  static const String deepSeekBaseUrl = 'https://api.deepseek.com';
  static const String deepSeekChatModel = 'deepseek-chat';
  static const String deepSeekCoderModel = 'deepseek-coder';
  
  // Document Status
  static const String statusProcessing = 'processing';
  static const String statusReady = 'ready';
  static const String statusFailed = 'failed';
}
