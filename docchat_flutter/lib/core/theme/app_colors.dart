import 'package:flutter/material.dart';

/// Application color palette inspired by UI screenshots
class AppColors {
  // Primary Colors - Blue theme from screenshots
  static const Color primary = Color(0xFF2563EB); // Blue-600
  static const Color primaryDark = Color(0xFF1D4ED8); // Blue-700
  static const Color primaryLight = Color(0xFF3B82F6); // Blue-500
  
  // Secondary Colors - Complementary purple
  static const Color secondary = Color(0xFF8B5CF6); // Purple-500
  static const Color secondaryDark = Color(0xFF7C3AED); // Purple-600
  static const Color secondaryLight = Color(0xFFA78BFA); // Purple-400
  
  // Accent Colors - Light blue for document icons
  static const Color accent = Color(0xFF60A5FA); // Blue-400
  static const Color accentDark = Color(0xFF3B82F6); // Blue-500
  static const Color accentLight = Color(0xFF93C5FD); // Blue-300
  
  // Icon Background - Light blue for document cards
  static const Color iconBackground = Color(0xFFDBEAFE); // Blue-100
  static const Color iconBackgroundDark = Color(0xFF1E3A8A); // Blue-900
  
  // Semantic Colors
  static const Color success = Color(0xFF10B981); // Green-500
  static const Color warning = Color(0xFFF59E0B); // Amber-500
  static const Color error = Color(0xFFEF4444); // Red-500
  static const Color info = Color(0xFF3B82F6); // Blue-500
  
  // Neutral Colors (Light Mode) - From screenshots
  static const Color background = Color(0xFFF5F5F5); // Gray-100
  static const Color surface = Color(0xFFFFFFFF); // White
  static const Color surfaceVariant = Color(0xFFF9FAFB); // Gray-50
  static const Color outline = Color(0xFFE5E7EB); // Gray-200
  static const Color outlineVariant = Color(0xFFD1D5DB); // Gray-300
  
  // Text Colors (Light Mode)
  static const Color textPrimary = Color(0xFF111827); // Gray-900
  static const Color textSecondary = Color(0xFF6B7280); // Gray-500
  static const Color textTertiary = Color(0xFF9CA3AF); // Gray-400
  static const Color textDisabled = Color(0xFFD1D5DB); // Gray-300
  
  // Dark Mode Colors
  static const Color backgroundDark = Color(0xFF0F172A); // Slate-900
  static const Color surfaceDark = Color(0xFF1E293B); // Slate-800
  static const Color surfaceVariantDark = Color(0xFF334155); // Slate-700
  static const Color outlineDark = Color(0xFF475569); // Slate-600
  static const Color outlineVariantDark = Color(0xFF64748B); // Slate-500
  
  // Text Colors (Dark Mode)
  static const Color textPrimaryDark = Color(0xFFF8FAFC); // Slate-50
  static const Color textSecondaryDark = Color(0xFFCBD5E1); // Slate-300
  static const Color textTertiaryDark = Color(0xFF94A3B8); // Slate-400
  static const Color textDisabledDark = Color(0xFF64748B); // Slate-500
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient accentGradient = LinearGradient(
    colors: [accent, primary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Shadow Colors
  static const Color shadowLight = Color(0x1A000000);
  static const Color shadowMedium = Color(0x33000000);
  static const Color shadowDark = Color(0x4D000000);
}
