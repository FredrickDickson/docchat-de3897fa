import 'package:flutter/material.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../shared/widgets/custom_button.dart';

/// Social authentication buttons widget
class SocialAuthButtons extends StatelessWidget {
  final VoidCallback onGoogleSignIn;
  final bool isLoading;

  const SocialAuthButtons({
    super.key,
    required this.onGoogleSignIn,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Divider with "OR"
        Row(
          children: [
            const Expanded(child: Divider()),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.paddingMD,
              ),
              child: Text(
                'OR',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            const Expanded(child: Divider()),
          ],
        ),
        const SizedBox(height: AppDimensions.spacing24),
        
        // Google Sign In Button
        CustomButton(
          text: 'Continue with Google',
          onPressed: isLoading ? null : onGoogleSignIn,
          variant: ButtonVariant.secondary,
          icon: Icons.g_mobiledata,
          width: double.infinity,
          isLoading: isLoading,
        ),
      ],
    );
  }
}
