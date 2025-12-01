import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../../core/config/supabase_config.dart';
import '../../../../core/errors/exceptions.dart';
import '../../../../core/utils/logger.dart';
import '../models/user_model.dart';

/// Remote data source for authentication using Supabase
class AuthRemoteDatasource {
  final SupabaseClient _supabase;
  final GoogleSignIn _googleSignIn;

  AuthRemoteDatasource({
    SupabaseClient? supabase,
    GoogleSignIn? googleSignIn,
  })  : _supabase = supabase ?? SupabaseConfig.client,
        _googleSignIn = googleSignIn ?? GoogleSignIn();

  /// Get current user
  UserModel? getCurrentUser() {
    final supabaseUser = _supabase.auth.currentUser;
    if (supabaseUser == null) return null;
    return UserModel.fromSupabaseUser(supabaseUser);
  }

  /// Sign in with email and password
  Future<UserModel> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      AppLogger.info('Attempting sign in with email: $email');
      
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user == null) {
        throw AuthenticationException('Sign in failed: No user returned');
      }

      AppLogger.info('Sign in successful for user: ${response.user!.id}');
      return UserModel.fromSupabaseUser(response.user!);
    } on AuthException catch (e) {
      AppLogger.error('Supabase auth error during sign in', e);
      throw AuthenticationException(e.message);
    } catch (e) {
      AppLogger.error('Unexpected error during sign in', e);
      throw AuthenticationException('An unexpected error occurred during sign in');
    }
  }

  /// Sign up with email and password
  Future<UserModel> signUpWithEmail({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      AppLogger.info('Attempting sign up with email: $email');
      
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: displayName != null ? {'display_name': displayName} : null,
      );

      if (response.user == null) {
        throw AuthenticationException('Sign up failed: No user returned');
      }

      AppLogger.info('Sign up successful for user: ${response.user!.id}');
      return UserModel.fromSupabaseUser(response.user!);
    } on AuthException catch (e) {
      AppLogger.error('Supabase auth error during sign up', e);
      throw AuthenticationException(e.message);
    } catch (e) {
      AppLogger.error('Unexpected error during sign up', e);
      throw AuthenticationException('An unexpected error occurred during sign up');
    }
  }

  /// Sign in with Google
  Future<UserModel> signInWithGoogle() async {
    try {
      AppLogger.info('Attempting Google sign in');

      // Trigger Google Sign In flow
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw AuthenticationException('Google sign in was cancelled');
      }

      // Get Google Auth tokens
      final googleAuth = await googleUser.authentication;
      final accessToken = googleAuth.accessToken;
      final idToken = googleAuth.idToken;

      if (accessToken == null || idToken == null) {
        throw AuthenticationException('Failed to get Google auth tokens');
      }

      // Sign in to Supabase with Google tokens
      final response = await _supabase.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      if (response.user == null) {
        throw AuthenticationException('Google sign in failed: No user returned');
      }

      AppLogger.info('Google sign in successful for user: ${response.user!.id}');
      return UserModel.fromSupabaseUser(response.user!);
    } on AuthException catch (e) {
      AppLogger.error('Supabase auth error during Google sign in', e);
      throw AuthenticationException(e.message);
    } catch (e) {
      AppLogger.error('Unexpected error during Google sign in', e);
      throw AuthenticationException('An unexpected error occurred during Google sign in');
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      AppLogger.info('Attempting sign out');
      
      // Sign out from Google if signed in
      if (await _googleSignIn.isSignedIn()) {
        await _googleSignIn.signOut();
      }
      
      // Sign out from Supabase
      await _supabase.auth.signOut();
      
      AppLogger.info('Sign out successful');
    } on AuthException catch (e) {
      AppLogger.error('Supabase auth error during sign out', e);
      throw AuthenticationException(e.message);
    } catch (e) {
      AppLogger.error('Unexpected error during sign out', e);
      throw AuthenticationException('An unexpected error occurred during sign out');
    }
  }

  /// Get auth state changes stream
  Stream<UserModel?> authStateChanges() {
    return _supabase.auth.onAuthStateChange.map((event) {
      final user = event.session?.user;
      return user != null ? UserModel.fromSupabaseUser(user) : null;
    });
  }

  /// Check if user is authenticated
  bool get isAuthenticated => _supabase.auth.currentUser != null;
}
