import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/theme_provider.dart';
import '../widgets/hero_section.dart';
import '../widgets/features_section.dart';
import '../widgets/how_it_works_section.dart';
import '../widgets/pricing_section.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final themeMode = ref.watch(themeProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.chat_bubble_outline,
                color: theme.colorScheme.onPrimary,
                size: 20,
              ),
            ),
            const SizedBox(width: 8),
            const Text('DocChat'),
          ],
        ),
        actions: [
          // Theme toggle
          IconButton(
            icon: Icon(
              isDark ? Icons.light_mode : Icons.dark_mode,
            ),
            onPressed: () {
              ref.read(themeProvider.notifier).toggleTheme();
            },
            tooltip: isDark ? 'Switch to light mode' : 'Switch to dark mode',
          ),
          const SizedBox(width: 8),
          // Log in button
          TextButton(
            onPressed: () => context.go('/login'),
            child: const Text('Log In'),
          ),
          const SizedBox(width: 8),
          // Sign up button
          FilledButton(
            onPressed: () => context.go('/signup'),
            child: const Text('Sign Up'),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 768;
          final isTablet = constraints.maxWidth >= 768 && constraints.maxWidth < 1024;
          
          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Hero Section - responsive padding
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 24 : isTablet ? 48 : 120,
                    vertical: isMobile ? 48 : 80,
                  ),
                  child: const HeroSection(),
                ),
                // Features Section
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 24 : isTablet ? 48 : 120,
                    vertical: isMobile ? 32 : 64,
                  ),
                  child: const FeaturesSection(),
                ),
                // How It Works Section
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 24 : isTablet ? 48 : 120,
                    vertical: isMobile ? 32 : 64,
                  ),
                  child: const HowItWorksSection(),
                ),
                // Pricing Section
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 24 : isTablet ? 48 : 120,
                    vertical: isMobile ? 32 : 64,
                  ),
                  child: const PricingSection(),
                ),
                const SizedBox(height: 48),
              ],
            ),
          );
        },
      ),
    );
  }
}
