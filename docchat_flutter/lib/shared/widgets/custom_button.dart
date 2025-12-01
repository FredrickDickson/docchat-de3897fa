import 'package:flutter/material.dart';
import '../../core/theme/app_dimensions.dart';

/// Custom button widget
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final ButtonVariant variant;
  final IconData? icon;
  final double? width;
  final double? height;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.variant = ButtonVariant.primary,
    this.icon,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null || isLoading;

    Widget buttonChild = isLoading
        ? const SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: AppDimensions.iconSM),
                const SizedBox(width: AppDimensions.spacing8),
              ],
              Text(text),
            ],
          );

    return SizedBox(
      width: width,
      height: height ?? AppDimensions.buttonHeightMD,
      child: _buildButton(context, buttonChild, isDisabled),
    );
  }

  Widget _buildButton(BuildContext context, Widget child, bool isDisabled) {
    switch (variant) {
      case ButtonVariant.primary:
        return ElevatedButton(
          onPressed: isDisabled ? null : onPressed,
          child: child,
        );
      case ButtonVariant.secondary:
        return OutlinedButton(
          onPressed: isDisabled ? null : onPressed,
          child: child,
        );
      case ButtonVariant.text:
        return TextButton(
          onPressed: isDisabled ? null : onPressed,
          child: child,
        );
    }
  }
}

/// Button variant enum
enum ButtonVariant {
  primary,
  secondary,
  text,
}
