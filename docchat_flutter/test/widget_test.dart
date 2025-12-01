import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:docchat_flutter/main.dart';
import 'package:docchat_flutter/features/home/presentation/widgets/hero_section.dart';

void main() {
  group('App smoke tests', () {
    testWidgets('DocChatApp builds and shows a MaterialApp.router',
        (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: DocChatApp(),
        ),
      );

      // The root widget should be a MaterialApp.router
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('HeroSection shows main marketing copy', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: HeroSection(),
          ),
        ),
      );

      expect(
        find.text('Chat with your documents.\nGet instant AI summaries.'),
        findsOneWidget,
      );
      expect(find.text('Get Started Free'), findsOneWidget);
      expect(find.text('View Pricing'), findsOneWidget);
    });
  });
}
