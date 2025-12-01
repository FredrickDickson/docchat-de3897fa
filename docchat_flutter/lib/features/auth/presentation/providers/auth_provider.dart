import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/logger.dart';
import '../../data/repositories/auth_repository.dart';
import '../../domain/repositories/auth_repository_interface.dart';
import 'auth_state.dart';

/// Auth repository provider
final authRepositoryProvider = Provider<AuthRepositoryInterface>((ref) {
  return AuthRepository();
});

/// Auth state notifier provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(repository);
});

/// Auth state notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepositoryInterface _repository;

  AuthNotifier(this._repository) : super(const AuthState.initial()) {
    _init();
  }

  /// Initialize auth state
  void _init() {
    // Listen to auth state changes
    _repository.authStateChanges().listen(
      (user) {
        if (user != null) {
          state = AuthState.authenticated(user);
          AppLogger.info('User authenticated: ${user.email}');
        } else {
          state = const AuthState.unauthenticated();
          AppLogger.info('User unauthenticated');
        }
      },
      onError: (error) {
        AppLogger.error('Auth state change error', error);
        state = AuthState.error(error.toString());
      },
    );

    // Check current user
    _checkCurrentUser();
  }

  /// Check current user
  Future<void> _checkCurrentUser() async {
    try {
      final user = await _repository.getCurrentUser();
      if (user != null) {
        state = AuthState.authenticated(user);
      } else {
        state = const AuthState.unauthenticated();
      }
    } catch (e) {
      AppLogger.error('Error checking current user', e);
      state = const AuthState.unauthenticated();
    }
  }

  /// Sign in with email and password
  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      state = const AuthState.loading();
      AppLogger.info('Signing in with email: $email');

      final user = await _repository.signInWithEmail(
        email: email,
        password: password,
      );

      state = AuthState.authenticated(user);
      AppLogger.info('Sign in successful');
    } catch (e) {
      AppLogger.error('Sign in failed', e);
      state = AuthState.error(_getErrorMessage(e));
    }
  }

  /// Sign up with email and password
  Future<void> signUpWithEmail({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      state = const AuthState.loading();
      AppLogger.info('Signing up with email: $email');

      final user = await _repository.signUpWithEmail(
        email: email,
        password: password,
        displayName: displayName,
      );

      state = AuthState.authenticated(user);
      AppLogger.info('Sign up successful');
    } catch (e) {
      AppLogger.error('Sign up failed', e);
      state = AuthState.error(_getErrorMessage(e));
    }
  }

  /// Sign in with Google
  Future<void> signInWithGoogle() async {
    try {
      state = const AuthState.loading();
      AppLogger.info('Signing in with Google');

      final user = await _repository.signInWithGoogle();

      state = AuthState.authenticated(user);
      AppLogger.info('Google sign in successful');
    } catch (e) {
      AppLogger.error('Google sign in failed', e);
      state = AuthState.error(_getErrorMessage(e));
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      state = const AuthState.loading();
      AppLogger.info('Signing out');

      await _repository.signOut();

      state = const AuthState.unauthenticated();
      AppLogger.info('Sign out successful');
    } catch (e) {
      AppLogger.error('Sign out failed', e);
      state = AuthState.error(_getErrorMessage(e));
    }
  }

  /// Clear error
  void clearError() {
    if (state.status == AuthStatus.error) {
      state = const AuthState.unauthenticated();
    }
  }

  /// Get user-friendly error message
  String _getErrorMessage(dynamic error) {
    if (error.toString().contains('Invalid login credentials')) {
      return 'Invalid email or password';
    } else if (error.toString().contains('Email not confirmed')) {
      return 'Please confirm your email address';
    } else if (error.toString().contains('User already registered')) {
      return 'An account with this email already exists';
    } else if (error.toString().contains('cancelled')) {
      return 'Sign in was cancelled';
    } else if (error.toString().contains('network')) {
      return 'Network error. Please check your connection';
    }
    return 'An error occurred. Please try again';
  }
}
