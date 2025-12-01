import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Environment configuration class
class EnvConfig {
  // Supabase
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  static String get supabaseProjectId => dotenv.env['SUPABASE_PROJECT_ID'] ?? '';

  // AI Service
  static String get openAiApiKey => dotenv.env['OPENAI_API_KEY'] ?? '';

  // App
  static String get appName => dotenv.env['APP_NAME'] ?? 'DocChat';
  static String get appVersion => dotenv.env['APP_VERSION'] ?? '1.0.0';
  static String get environment => dotenv.env['ENVIRONMENT'] ?? 'development';

  // Computed properties
  static bool get isDevelopment => environment == 'development';
  static bool get isProduction => environment == 'production';
  static bool get isStaging => environment == 'staging';

  /// Initialize environment variables
  static Future<void> initialize() async {
    await dotenv.load(fileName: '.env');
  }
}
