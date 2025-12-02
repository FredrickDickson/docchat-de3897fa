import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

/// Router refresh notifier that listens to auth state changes
class RouterRefreshNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterRefreshNotifier(this._ref) {
    // Listen to auth state changes and notify router
    _ref.listen(authProvider, (previous, next) {
      notifyListeners();
    });
  }
}

/// Provider for router refresh notifier
final routerRefreshNotifierProvider = Provider<RouterRefreshNotifier>((ref) {
  return RouterRefreshNotifier(ref);
});
