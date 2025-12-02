import 'package:flutter/material.dart';

class HowItWorksSection extends StatelessWidget {
  const HowItWorksSection({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMobile = MediaQuery.of(context).size.width < 768;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'GET STARTED IN THREE EASY STEPS',
          style: theme.textTheme.labelLarge?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 32),
        if (isMobile)
          _buildMobileSteps(context, theme)
        else
          _buildDesktopSteps(context, theme),
      ],
    );
  }

  Widget _buildMobileSteps(BuildContext context, ThemeData theme) {
    return Column(
      children: _buildStepCards(context, theme),
    );
  }

  Widget _buildDesktopSteps(BuildContext context, ThemeData theme) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: _buildStepCards(context, theme)
          .map((card) => Expanded(child: card))
          .toList(),
    );
  }

  List<Widget> _buildStepCards(BuildContext context, ThemeData theme) {
    final steps = [
      {
        'number': '1',
        'icon': Icons.upload_file,
        'title': 'Upload Your PDF',
        'description': 'Drag and drop any PDF file into the app.',
      },
      {
        'number': '2',
        'icon': Icons.chat_bubble_outline,
        'title': 'Ask Any Question',
        'description': 'Use the chat interface to start a conversation.',
      },
      {
        'number': '3',
        'icon': Icons.lightbulb_outline,
        'title': 'Receive Instant Answers',
        'description': 'Get AI-powered insights in real-time.',
      },
    ];

    return steps.map((step) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: Column(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                step['icon'] as IconData,
                color: theme.colorScheme.onPrimaryContainer,
                size: 32,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              step['title'] as String,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              step['description'] as String,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }).toList();
  }
}
