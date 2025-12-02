import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';

/// Upload dropzone widget with dashed border
class UploadDropzone extends StatelessWidget {
  final VoidCallback onTap;
  final bool isUploading;

  const UploadDropzone({
    super.key,
    required this.onTap,
    this.isUploading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: isUploading ? null : onTap,
      child: Container(
        margin: const EdgeInsets.all(AppDimensions.paddingMD),
        padding: const EdgeInsets.all(AppDimensions.paddingXL * 2),
        decoration: BoxDecoration(
          color: isDark
              ? AppColors.surfaceVariantDark.withOpacity(0.3)
              : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppDimensions.radiusMD),
          border: Border.all(
            color: isDark ? AppColors.outlineDark : AppColors.outline,
            width: 2,
            strokeAlign: BorderSide.strokeAlignInside,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.cloud_upload_outlined,
              size: 64,
              color: isDark ? AppColors.primaryLight : AppColors.primary,
            ),
            const SizedBox(height: AppDimensions.spacing24),
            Text(
              'Tap to select a file from your device.',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.spacing12),
            Text(
              'Supported formats: PDF, DOCX, PPTX.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.spacing4),
            Text(
              'Maximum file size: 100MB.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.spacing24),
            ElevatedButton.icon(
              onPressed: isUploading ? null : onTap,
              icon: const Icon(Icons.add),
              label: const Text('Select Document'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.paddingXL,
                  vertical: AppDimensions.paddingMD,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
