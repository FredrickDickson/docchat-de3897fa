import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/config/env_config.dart';
import 'core/config/supabase_config.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/utils/logger.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Initialize environment configuration
    await EnvConfig.initialize();
    AppLogger.info('Environment configuration initialized');
    
    // Initialize Supabase
    await SupabaseConfig.initialize();
    AppLogger.info('Supabase initialized successfully');
    
    runApp(
      const ProviderScope(
        child: DocChatApp(),
      ),
    );
  } catch (e, stackTrace) {
    AppLogger.error('Failed to initialize app', e, stackTrace);
    rethrow;
  }
}

class DocChatApp extends ConsumerWidget {
  const DocChatApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);
    
    return MaterialApp.router(
      title: 'DocChat',
      debugShowCheckedModeBanner: false,
      
      // Theme
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      
      // Router
      routerConfig: router,
    );
  }
}
