import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimensions.dart';

/// Document card widget matching screenshot design
class DocumentCard extends StatelessWidget {
  final String fileName;
  final String fileSize;
  final String timeAgo;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;

  const DocumentCard({
    super.key,
    required this.fileName,
    required this.fileSize,
    required this.timeAgo,
    this.onTap,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Card(
      elevation: 1,
      margin: const EdgeInsets.symmetric(
        horizontal: AppDimensions.paddingMD,
        vertical: AppDimensions.spacing8,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMD),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppDimensions.radiusMD),
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingMD),
          child: Row(
            children: [
              // Document icon with background
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: isDark 
                      ? AppColors.iconBackgroundDark.withOpacity(0.3)
                      : AppColors.iconBackground,
                  borderRadius: BorderRadius.circular(AppDimensions.radiusSM),
                ),
                child: Icon(
                  Icons.description,
                  color: isDark ? AppColors.primaryLight : AppColors.primary,
                  size: AppDimensions.iconLG,
                ),
              ),
              const SizedBox(width: AppDimensions.spacing16),
              
              // Document info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fileName,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppDimensions.spacing4),
                    Text(
                      '$fileSize • $timeAgo',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: isDark 
                            ? AppColors.textSecondaryDark 
                            : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Chevron icon
              Icon(
                Icons.chevron_right,
                color: isDark 
                    ? AppColors.textTertiaryDark 
                    : AppColors.textTertiary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
