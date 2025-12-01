import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/providers/auth_state.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/signup_screen.dart';
import '../../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/home/presentation/screens/privacy_screen.dart';
import '../../features/home/presentation/screens/terms_screen.dart';
import '../../features/home/presentation/screens/contact_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';

/// App router provider
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuthenticated = authState.status == AuthStatus.authenticated;
      final location = state.matchedLocation;

      final isPublicRoute = location == '/' ||
          location == '/login' ||
          location == '/signup' ||
          location == '/privacy' ||
          location == '/terms' ||
          location == '/contact';

      final isAuthRoute = location == '/login' || location == '/signup';

      // If authenticated and trying to access auth routes, redirect to dashboard
      if (isAuthenticated && isAuthRoute) {
        return '/dashboard';
      }

      // If not authenticated and trying to access a protected route, send to login
      if (!isAuthenticated && !isPublicRoute) {
        return '/login';
      }

      // No redirect needed
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        pageBuilder: (context, state) => MaterialPage(
          key: state.pageKey,
          child: const HomeScreen(),
        ),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        pageBuilder: (context, state) => MaterialPage(
          key: state.pageKey,
          child: const LoginScreen(),
        ),
      ),
      GoRoute(
        path: '/signup',
        name: 'signup',
        pageBuilder: (context, state) => MaterialPage(
          key: state.pageKey,
          child: const SignupScreen(),
        ),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        pageBuilder: (context, state) => MaterialPage(
          key: state.pageKey,
          child: const DashboardScreen(),
        ),
      ),
      GoRoute(
        path: '/privacy',
        name: 'privacy',
        pageBuilder: (context, state) => MaterialPage(
          key: state.pageKey,
          child: const PrivacyScreen(),
        ),
      ),
      GoRoute(
        path: '/terms',
        name: 'terms',
        pageBuilder: (context, state) => MaterialPage(
          key: state.pageKey,
          child: const TermsScreen(),
        ),
      ),
      GoRoute(
        path: '/contact',
        name: 'contact',
        pageBuilder: (context, state) => MaterialPage(
          key: state.pageKey,
          child: const ContactScreen(),
        ),
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        pageBuilder: (context, state) => MaterialPage(
          key: state.pageKey,
          child: const ProfileScreen(),
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
});
