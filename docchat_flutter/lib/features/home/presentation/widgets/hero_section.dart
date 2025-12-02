import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMobile = MediaQuery.of(context).size.width < 768;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Main headline
        Text(
          'Chat with Your Documents,\nInstantly.',
          textAlign: TextAlign.center,
          style: theme.textTheme.displayMedium?.copyWith(
            fontWeight: FontWeight.bold,
            fontSize: isMobile ? 32 : 48,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 16),
        // Subtitle
        Text(
          'Unlock insights from any PDF. Summarize, ask questions, and get answers in seconds with our AI.',
          textAlign: TextAlign.center,
          style: theme.textTheme.bodyLarge?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            fontSize: isMobile ? 16 : 18,
          ),
        ),
        const SizedBox(height: 32),
        // CTA Button
        FilledButton(
          onPressed: () => context.go('/signup'),
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            minimumSize: const Size(200, 56),
          ),
          child: const Text(
            'Try DocChat Free',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}
