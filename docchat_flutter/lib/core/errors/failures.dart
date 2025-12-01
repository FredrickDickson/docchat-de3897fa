/// Base class for all failures in the application
abstract class Failure {
  final String message;
  final Object? error;

  const Failure(this.message, [this.error]);

  @override
  String toString() => message;
}

class ServerFailure extends Failure {
  final int? statusCode;

  const ServerFailure(super.message, [this.statusCode, super.error]);

  @override
  String toString() =>
      'ServerFailure: $message${statusCode != null ? ' (Status: $statusCode)' : ''}';
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message, [super.error]);

  @override
  String toString() => 'NetworkFailure: $message';
}

class AuthenticationFailure extends Failure {
  const AuthenticationFailure(super.message, [super.error]);

  @override
  String toString() => 'AuthenticationFailure: $message';
}

class ValidationFailure extends Failure {
  final Map<String, String>? errors;

  const ValidationFailure(super.message, [this.errors, super.error]);

  @override
  String toString() => 'ValidationFailure: $message';
}

class StorageFailure extends Failure {
  const StorageFailure(super.message, [super.error]);

  @override
  String toString() => 'StorageFailure: $message';
}

class NotFoundFailure extends Failure {
  const NotFoundFailure(super.message, [super.error]);

  @override
  String toString() => 'NotFoundFailure: $message';
}

class PermissionFailure extends Failure {
  const PermissionFailure(super.message, [super.error]);

  @override
  String toString() => 'PermissionFailure: $message';
}

class UnknownFailure extends Failure {
  const UnknownFailure(super.message, [super.error]);

  @override
  String toString() => 'UnknownFailure: $message';
}
