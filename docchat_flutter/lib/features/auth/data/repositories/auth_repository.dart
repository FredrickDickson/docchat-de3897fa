import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/logger.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository_interface.dart';
import '../datasources/auth_remote_datasource.dart';

/// Authentication repository implementation
class AuthRepository implements AuthRepositoryInterface {
  final AuthRemoteDatasource _remoteDatasource;

  AuthRepository({
    AuthRemoteDatasource? remoteDatasource,
  }) : _remoteDatasource = remoteDatasource ?? AuthRemoteDatasource();

  @override
  Future<User?> getCurrentUser() async {
    try {
      final userModel = _remoteDatasource.getCurrentUser();
      return userModel?.toEntity();
    } catch (e) {
      AppLogger.error('Error getting current user', e);
      return null;
    }
  }

  @override
  Future<User> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final userModel = await _remoteDatasource.signInWithEmail(
        email: email,
        password: password,
      );
      return userModel.toEntity();
    } on AuthenticationException catch (e) {
      throw AuthenticationFailure(e.message);
    } on NetworkException catch (e) {
      throw NetworkFailure(e.message);
    } catch (e) {
      AppLogger.error('Unexpected error during sign in', e);
      throw UnknownFailure('An unexpected error occurred during sign in', e);
    }
  }

  @override
  Future<User> signUpWithEmail({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      final userModel = await _remoteDatasource.signUpWithEmail(
        email: email,
        password: password,
        displayName: displayName,
      );
      return userModel.toEntity();
    } on AuthenticationException catch (e) {
      throw AuthenticationFailure(e.message);
    } on NetworkException catch (e) {
      throw NetworkFailure(e.message);
    } catch (e) {
      AppLogger.error('Unexpected error during sign up', e);
      throw UnknownFailure('An unexpected error occurred during sign up', e);
    }
  }

  @override
  Future<User> signInWithGoogle() async {
    try {
      final userModel = await _remoteDatasource.signInWithGoogle();
      return userModel.toEntity();
    } on AuthenticationException catch (e) {
      throw AuthenticationFailure(e.message);
    } on NetworkException catch (e) {
      throw NetworkFailure(e.message);
    } catch (e) {
      AppLogger.error('Unexpected error during Google sign in', e);
      throw UnknownFailure('An unexpected error occurred during Google sign in', e);
    }
  }

  @override
  Future<void> signOut() async {
    try {
      await _remoteDatasource.signOut();
    } on AuthenticationException catch (e) {
      throw AuthenticationFailure(e.message);
    } catch (e) {
      AppLogger.error('Unexpected error during sign out', e);
      throw UnknownFailure('An unexpected error occurred during sign out', e);
    }
  }

  @override
  Stream<User?> authStateChanges() {
    return _remoteDatasource.authStateChanges().map((userModel) {
      return userModel?.toEntity();
    });
  }

  @override
  bool get isAuthenticated => _remoteDatasource.isAuthenticated;
}
