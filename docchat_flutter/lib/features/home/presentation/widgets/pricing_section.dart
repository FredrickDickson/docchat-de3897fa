import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PricingSection extends StatelessWidget {
  const PricingSection({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMobile = MediaQuery.of(context).size.width < 768;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          'Choose Your Plan',
          style: theme.textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        if (isMobile)
          _buildMobilePricing(context, theme)
        else
          _buildDesktopPricing(context, theme),
      ],
    );
  }

  Widget _buildMobilePricing(BuildContext context, ThemeData theme) {
    return Column(
      children: _buildPricingCards(context, theme),
    );
  }

  Widget _buildDesktopPricing(BuildContext context, ThemeData theme) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: _buildPricingCards(context, theme)
          .map((card) => Expanded(child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: card,
              )))
          .toList(),
    );
  }

  List<Widget> _buildPricingCards(BuildContext context, ThemeData theme) {
    return [
      _buildPlanCard(
        context,
        theme,
        title: 'Free',
        price: '\$0',
        period: '/month',
        description: 'For casual users getting started.',
        features: [
          '3 documents per month',
          '50 pages per document',
          'Standard Q&A model',
        ],
        buttonText: 'Get Started',
        isPopular: false,
      ),
      _buildPlanCard(
        context,
        theme,
        title: 'Pro',
        price: '\$10',
        period: '/month',
        description: 'For power users and professionals.',
        features: [
          'Unlimited documents',
          '2000 pages per document',
          'Advanced AI model',
          'Priority support',
        ],
        buttonText: 'Choose Pro',
        isPopular: true,
      ),
    ];
  }

  Widget _buildPlanCard(
    BuildContext context,
    ThemeData theme, {
    required String title,
    required String price,
    required String period,
    required String description,
    required List<String> features,
    required String buttonText,
    required bool isPopular,
  }) {
    return Card(
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isPopular)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'MOST POPULAR',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.onPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            if (isPopular) const SizedBox(height: 12),
            Text(
              title,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  price,
                  style: theme.textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    period,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            ...features.map((feature) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Icon(
                        Icons.check_circle,
                        color: Colors.green,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          feature,
                          style: theme.textTheme.bodyMedium,
                        ),
                      ),
                    ],
                  ),
                )),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: isPopular
                  ? FilledButton(
                      onPressed: () => context.go('/signup'),
                      child: Text(buttonText),
                    )
                  : OutlinedButton(
                      onPressed: () => context.go('/signup'),
                      child: Text(buttonText),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
