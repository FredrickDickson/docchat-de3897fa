import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../shared/widgets/theme_toggle_widget.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Dashboard screen with theme toggle
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          const ThemeToggleWidget(),
          const SizedBox(width: AppDimensions.spacing8),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).signOut();
            },
            tooltip: 'Sign Out',
          ),
          const SizedBox(width: AppDimensions.spacing8),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingLG),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.check_circle_outline,
                size: AppDimensions.iconXXL,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: AppDimensions.spacing24),
              Text(
                'Welcome to DocChat!',
                style: Theme.of(context).textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppDimensions.spacing16),
              if (user != null) ...[
                Text(
                  user.email,
                  style: Theme.of(context).textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                if (user.displayName != null) ...[
                  const SizedBox(height: AppDimensions.spacing8),
                  Text(
                    user.displayName!,
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
              const SizedBox(height: AppDimensions.spacing48),
              Text(
                'You are successfully authenticated!',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppDimensions.spacing8),
              Text(
                'Try switching between light and dark themes using the button above.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
