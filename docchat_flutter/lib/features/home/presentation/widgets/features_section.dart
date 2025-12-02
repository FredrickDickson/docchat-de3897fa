import 'package:flutter/material.dart';

class FeaturesSection extends StatelessWidget {
  const FeaturesSection({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMobile = MediaQuery.of(context).size.width < 768;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'UNLOCK SUPERPOWERS FOR YOUR DOCUMENTS',
          style: theme.textTheme.labelLarge?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 24),
        if (isMobile)
          _buildMobileFeatures(context, theme)
        else
          _buildDesktopFeatures(context, theme),
      ],
    );
  }

  Widget _buildMobileFeatures(BuildContext context, ThemeData theme) {
    return Column(
      children: _buildFeatureCards(context, theme),
    );
  }

  Widget _buildDesktopFeatures(BuildContext context, ThemeData theme) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 24,
      mainAxisSpacing: 24,
      childAspectRatio: 2.5,
      children: _buildFeatureCards(context, theme),
    );
  }

  List<Widget> _buildFeatureCards(BuildContext context, ThemeData theme) {
    final features = [
      {
        'icon': Icons.summarize,
        'title': 'Instant Summaries',
        'description': 'Get the key points of any document in seconds.',
      },
      {
        'icon': Icons.question_answer,
        'title': 'Interactive Q&A',
        'description': 'Ask specific questions and get precise answers from your files.',
      },
      {
        'icon': Icons.folder,
        'title': 'Multi-Document Support',
        'description': 'Analyze information across multiple documents at once.',
      },
      {
        'icon': Icons.shield,
        'title': 'Secure & Private',
        'description': 'Your data is encrypted and never shared.',
      },
    ];

    return features.map((feature) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  feature['icon'] as IconData,
                  color: theme.colorScheme.onPrimaryContainer,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      feature['title'] as String,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      feature['description'] as String,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }).toList();
  }
}
