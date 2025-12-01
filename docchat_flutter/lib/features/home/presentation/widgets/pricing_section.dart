import 'package:flutter/material.dart';

class PricingSection extends StatelessWidget {
  const PricingSection({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pricing',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: const [
              Expanded(
                child: _PricingCard(
                  title: 'Free',
                  price: '\$0',
                  description: '3 summaries per day. Great for quick checks.',
                  features: [
                    'Up to 3 summaries/day',
                    'Basic chat with documents',
                    'Email support',
                  ],
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: _PricingCard(
                  title: 'Pro',
                  price: '\$19/mo',
                  description: 'Unlimited summaries for power users.',
                  features: [
                    'Unlimited summaries',
                    'Priority AI models',
                    'Priority support',
                  ],
                  highlight: true,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PricingCard extends StatelessWidget {
  const _PricingCard({
    required this.title,
    required this.price,
    required this.description,
    required this.features,
    this.highlight = false,
  });

  final String title;
  final String price;
  final String description;
  final List<String> features;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    return Card(
      color: highlight ? colorScheme.primaryContainer : null,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              price,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 12),
            for (final f in features)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  children: [
                    const Icon(Icons.check, size: 18),
                    const SizedBox(width: 6),
                    Expanded(child: Text(f)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}


