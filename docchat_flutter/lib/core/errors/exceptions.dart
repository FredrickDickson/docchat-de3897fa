/// Custom exceptions for the application
class AppException implements Exception {
  final String message;
  final dynamic error;

  AppException(this.message, [this.error]);

  @override
  String toString() => 'AppException: $message${error != null ? ' ($error)' : ''}';
}

class ServerException extends AppException {
  final int? statusCode;

  ServerException(super.message, [this.statusCode, super.error]);

  @override
  String toString() =>
      'ServerException: $message${statusCode != null ? ' (Status: $statusCode)' : ''}';
}

class NetworkException extends AppException {
  NetworkException(super.message, [super.error]);

  @override
  String toString() => 'NetworkException: $message';
}

class AuthenticationException extends AppException {
  AuthenticationException(super.message, [super.error]);

  @override
  String toString() => 'AuthenticationException: $message';
}

class ValidationException extends AppException {
  final Map<String, String>? errors;

  ValidationException(super.message, [this.errors, super.error]);

  @override
  String toString() => 'ValidationException: $message';
}

class StorageException extends AppException {
  StorageException(super.message, [super.error]);

  @override
  String toString() => 'StorageException: $message';
}

class NotFoundException extends AppException {
  NotFoundException(super.message, [super.error]);

  @override
  String toString() => 'NotFoundException: $message';
}

class PermissionException extends AppException {
  PermissionException(super.message, [super.error]);

  @override
  String toString() => 'PermissionException: $message';
}
