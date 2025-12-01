import '../../domain/entities/user.dart';

/// Authentication state
class AuthState {
  final AuthStatus status;
  final User? user;
  final String? errorMessage;

  const AuthState({
    required this.status,
    this.user,
    this.errorMessage,
  });

  /// Initial state
  const AuthState.initial()
      : status = AuthStatus.initial,
        user = null,
        errorMessage = null;

  /// Loading state
  const AuthState.loading()
      : status = AuthStatus.loading,
        user = null,
        errorMessage = null;

  /// Authenticated state
  const AuthState.authenticated(User this.user)
      : status = AuthStatus.authenticated,
        errorMessage = null;

  /// Unauthenticated state
  const AuthState.unauthenticated()
      : status = AuthStatus.unauthenticated,
        user = null,
        errorMessage = null;

  /// Error state
  const AuthState.error(String this.errorMessage)
      : status = AuthStatus.error,
        user = null;

  /// Copy with
  AuthState copyWith({
    AuthStatus? status,
    User? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuthState &&
        other.status == status &&
        other.user == user &&
        other.errorMessage == errorMessage;
  }

  @override
  int get hashCode => Object.hash(status, user, errorMessage);
}

/// Authentication status enum
enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}
