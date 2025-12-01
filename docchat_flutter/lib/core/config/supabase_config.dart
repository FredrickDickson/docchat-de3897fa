import 'package:supabase_flutter/supabase_flutter.dart';
import 'env_config.dart';

/// Supabase configuration and initialization
class SupabaseConfig {
  static SupabaseClient? _client;

  /// Get the Supabase client instance
  static SupabaseClient get client {
    if (_client == null) {
      throw Exception('Supabase has not been initialized. Call initialize() first.');
    }
    return _client!;
  }

  /// Initialize Supabase
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: EnvConfig.supabaseUrl,
      anonKey: EnvConfig.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
        autoRefreshToken: true,
      ),
      storageOptions: const StorageClientOptions(
        retryAttempts: 3,
      ),
    );

    _client = Supabase.instance.client;
  }

  /// Get current user
  static User? get currentUser => client.auth.currentUser;

  /// Check if user is authenticated
  static bool get isAuthenticated => currentUser != null;

  /// Get auth state stream
  static Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;

  // ---------------------------------------------------------------------------
  // Convenience helpers for Storage buckets wired to the SQL setup:
  // - pdf-uploads
  // - extracted-text
  // - public-assets
  // - documents
  // ---------------------------------------------------------------------------

  static StorageFileApi get pdfUploadsBucket =>
      client.storage.from('pdf-uploads');

  static StorageFileApi get extractedTextBucket =>
      client.storage.from('extracted-text');

  static StorageFileApi get publicAssetsBucket =>
      client.storage.from('public-assets');

  static StorageFileApi get documentsBucket =>
      client.storage.from('documents');
}
