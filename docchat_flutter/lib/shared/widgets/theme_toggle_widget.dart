import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/theme_provider.dart';

/// Theme toggle widget - can be used in app bar or settings
class ThemeToggleWidget extends ConsumerWidget {
  final bool showLabel;
  final bool isIconButton;

  const ThemeToggleWidget({
    super.key,
    this.showLabel = false,
    this.isIconButton = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentTheme = ref.watch(themeProvider);

    if (isIconButton) {
      return IconButton(
        icon: Icon(_getIcon(currentTheme)),
        tooltip: _getTooltip(currentTheme),
        onPressed: () => _cycleTheme(ref),
      );
    }

    return ListTile(
      leading: Icon(_getIcon(currentTheme)),
      title: const Text('Theme'),
      subtitle: Text(currentTheme.displayName),
      trailing: SegmentedButton<AppThemeMode>(
        segments: AppThemeMode.values
            .map(
              (mode) => ButtonSegment<AppThemeMode>(
                value: mode,
                icon: Icon(mode.icon, size: 18),
                label: showLabel ? Text(mode.displayName) : null,
              ),
            )
            .toList(),
        selected: {currentTheme},
        onSelectionChanged: (Set<AppThemeMode> selected) {
          ref.read(themeProvider.notifier).setThemeMode(selected.first);
        },
      ),
    );
  }

  IconData _getIcon(AppThemeMode mode) {
    return mode.icon;
  }

  String _getTooltip(AppThemeMode mode) {
    return 'Theme: ${mode.displayName}';
  }

  void _cycleTheme(WidgetRef ref) {
    final currentTheme = ref.read(themeProvider);
    final currentIndex = AppThemeMode.values.indexOf(currentTheme);
    final nextIndex = (currentIndex + 1) % AppThemeMode.values.length;
    ref.read(themeProvider.notifier).setThemeMode(AppThemeMode.values[nextIndex]);
  }
}
