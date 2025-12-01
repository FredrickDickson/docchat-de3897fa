import 'package:flutter/material.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Chat with your documents.\nGet instant AI summaries.',
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Upload PDFs, Word, or PowerPoint files and ask questions in plain language. '
            'DocChat summarizes and explains your content in seconds.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              FilledButton(
                onPressed: () {
                  // Navigation to signup or dashboard is handled by the caller.
                },
                child: const Text('Get Started Free'),
              ),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: () {},
                child: const Text('View Pricing'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}


