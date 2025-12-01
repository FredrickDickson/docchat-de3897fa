import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/hero_section.dart';
import '../widgets/features_section.dart';
import '../widgets/how_it_works_section.dart';
import '../widgets/pricing_section.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('DocChat'),
        actions: [
          TextButton(
            onPressed: () => context.go('/login'),
            child: Text(
              'Log in',
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.onPrimaryContainer,
              ),
            ),
          ),
          const SizedBox(width: 8),
          FilledButton.tonal(
            onPressed: () => context.go('/signup'),
            child: const Text('Sign up'),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: const [
            HeroSection(),
            FeaturesSection(),
            HowItWorksSection(),
            PricingSection(),
          ],
        ),
      ),
    );
  }
}


