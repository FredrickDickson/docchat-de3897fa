import '../entities/user.dart';

/// Authentication repository interface
abstract class AuthRepositoryInterface {
  /// Get current authenticated user
  Future<User?> getCurrentUser();

  /// Sign in with email and password
  Future<User> signInWithEmail({
    required String email,
    required String password,
  });

  /// Sign up with email and password
  Future<User> signUpWithEmail({
    required String email,
    required String password,
    String? displayName,
  });

  /// Sign in with Google
  Future<User> signInWithGoogle();

  /// Sign out
  Future<void> signOut();

  /// Get auth state changes stream
  Stream<User?> authStateChanges();

  /// Check if user is authenticated
  bool get isAuthenticated;
}
