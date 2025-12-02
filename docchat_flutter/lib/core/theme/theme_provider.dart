import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/logger.dart';

/// Theme mode state
enum AppThemeMode {
  light,
  dark,
  system,
}

/// Extension to convert AppThemeMode to ThemeMode
extension AppThemeModeExtension on AppThemeMode {
  ThemeMode get themeMode {
    switch (this) {
      case AppThemeMode.light:
        return ThemeMode.light;
      case AppThemeMode.dark:
        return ThemeMode.dark;
      case AppThemeMode.system:
        return ThemeMode.system;
    }
  }

  String get displayName {
    switch (this) {
      case AppThemeMode.light:
        return 'Light';
      case AppThemeMode.dark:
        return 'Dark';
      case AppThemeMode.system:
        return 'System';
    }
  }

  IconData get icon {
    switch (this) {
      case AppThemeMode.light:
        return Icons.light_mode;
      case AppThemeMode.dark:
        return Icons.dark_mode;
      case AppThemeMode.system:
        return Icons.brightness_auto;
    }
  }
}

/// Theme state notifier
class ThemeNotifier extends StateNotifier<AppThemeMode> {
  static const String _themeKey = 'app_theme_mode';

  ThemeNotifier() : super(AppThemeMode.system) {
    _loadTheme();
  }

  /// Load theme from shared preferences
  Future<void> _loadTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final themeIndex = prefs.getInt(_themeKey);
      
      if (themeIndex != null && themeIndex < AppThemeMode.values.length) {
        state = AppThemeMode.values[themeIndex];
        AppLogger.info('Loaded theme: ${state.displayName}');
      } else {
        state = AppThemeMode.system;
        AppLogger.info('No saved theme, using system default');
      }
    } catch (e) {
      AppLogger.error('Error loading theme', e);
      state = AppThemeMode.system;
    }
  }

  /// Save theme to shared preferences
  Future<void> _saveTheme(AppThemeMode mode) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_themeKey, mode.index);
      AppLogger.info('Saved theme: ${mode.displayName}');
    } catch (e) {
      AppLogger.error('Error saving theme', e);
    }
  }

  /// Set theme mode
  Future<void> setThemeMode(AppThemeMode mode) async {
    state = mode;
    await _saveTheme(mode);
  }

  /// Toggle between light and dark (ignores system)
  Future<void> toggleTheme() async {
    final newMode = state == AppThemeMode.light 
        ? AppThemeMode.dark 
        : AppThemeMode.light;
    await setThemeMode(newMode);
  }
}

/// Theme provider
final themeProvider = StateNotifierProvider<ThemeNotifier, AppThemeMode>((ref) {
  return ThemeNotifier();
});

/// Computed theme mode provider (converts AppThemeMode to ThemeMode)
final themeModeProvider = Provider<ThemeMode>((ref) {
  final appThemeMode = ref.watch(themeProvider);
  return appThemeMode.themeMode;
});
