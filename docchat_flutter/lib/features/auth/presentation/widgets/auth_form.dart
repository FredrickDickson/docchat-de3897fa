import 'package:flutter/material.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../core/utils/validators.dart';
import '../../../../shared/widgets/custom_text_field.dart';

/// Authentication form widget
class AuthForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController? confirmPasswordController;
  final bool isSignUp;

  const AuthForm({
    super.key,
    required this.formKey,
    required this.emailController,
    required this.passwordController,
    this.confirmPasswordController,
    this.isSignUp = false,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        children: [
          // Email field
          CustomTextField(
            label: 'Email',
            hint: 'Enter your email',
            controller: emailController,
            keyboardType: TextInputType.emailAddress,
            prefixIcon: Icons.email_outlined,
            validator: Validators.email,
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: AppDimensions.spacing16),
          
          // Password field
          CustomTextField(
            label: 'Password',
            hint: 'Enter your password',
            controller: passwordController,
            obscureText: true,
            prefixIcon: Icons.lock_outlined,
            validator: isSignUp
                ? (value) => Validators.password(value, minLength: 8)
                : (value) => Validators.required(value, fieldName: 'Password'),
            textInputAction: isSignUp ? TextInputAction.next : TextInputAction.done,
          ),
          
          // Confirm password field (only for sign up)
          if (isSignUp && confirmPasswordController != null) ...[
            const SizedBox(height: AppDimensions.spacing16),
            CustomTextField(
              label: 'Confirm Password',
              hint: 'Re-enter your password',
              controller: confirmPasswordController,
              obscureText: true,
              prefixIcon: Icons.lock_outlined,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please confirm your password';
                }
                if (value != passwordController.text) {
                  return 'Passwords do not match';
                }
                return null;
              },
              textInputAction: TextInputAction.done,
            ),
          ],
        ],
      ),
    );
  }
}
