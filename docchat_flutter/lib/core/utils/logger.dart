import 'package:logger/logger.dart';
import '../config/env_config.dart';

/// Application logger utility
class AppLogger {
  static Logger? _instance;
  
  /// Get logger instance
  static Logger get instance {
    _instance ??= Logger(
      filter: _LogFilter(),
      printer: PrettyPrinter(
        methodCount: 2,
        errorMethodCount: 8,
        lineLength: 120,
        colors: true,
        printEmojis: true,
        dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
      ),
      level: EnvConfig.isDevelopment ? Level.debug : Level.warning,
    );
    return _instance!;
  }
  
  /// Log debug message
  static void debug(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.d(message, error: error, stackTrace: stackTrace);
  }
  
  /// Log info message
  static void info(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.i(message, error: error, stackTrace: stackTrace);
  }
  
  /// Log warning message
  static void warning(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.w(message, error: error, stackTrace: stackTrace);
  }
  
  /// Log error message
  static void error(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.e(message, error: error, stackTrace: stackTrace);
  }
  
  /// Log fatal message
  static void fatal(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.f(message, error: error, stackTrace: stackTrace);
  }
}

/// Custom log filter
class _LogFilter extends LogFilter {
  @override
  bool shouldLog(LogEvent event) {
    // In production, only log warnings and above
    if (EnvConfig.isProduction) {
      return event.level.index >= Level.warning.index;
    }
    // In development, log everything
    return true;
  }
}
