/// Application-wide configuration constants
class AppConfig {
  // App Information
  static const String appName = 'DocChat';
  static const String appTagline = 'Chat with your documents using AI';
  
  // File Upload Constraints
  static const int maxFileSize = 100 * 1024 * 1024; // 100MB
  static const List<String> supportedFileTypes = [
    'pdf',
    'ppt',
    'pptx',
    'doc',
    'docx',
  ];
  
  static const List<String> supportedMimeTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  // Pagination
  static const int documentsPerPage = 20;
  static const int messagesPerPage = 50;
  
  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration uploadTimeout = Duration(minutes: 5);
  static const Duration chatTimeout = Duration(seconds: 60);
  
  // Cache
  static const Duration cacheExpiration = Duration(hours: 24);
  static const int maxCachedDocuments = 100;
  
  // UI
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration toastDuration = Duration(seconds: 3);
  
  // Chat
  static const int maxMessageLength = 2000;
  static const List<String> suggestedQuestions = [
    'Summarize this document in 3 bullet points',
    'What are the key findings?',
    'What are the main recommendations?',
    'Explain this in simple terms',
  ];
}
