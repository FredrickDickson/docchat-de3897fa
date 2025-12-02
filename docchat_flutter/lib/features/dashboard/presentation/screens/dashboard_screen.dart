import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../shared/widgets/theme_toggle_widget.dart';
import '../../../../shared/widgets/bottom_nav_bar.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../documents/presentation/providers/documents_provider.dart';
import '../../../documents/presentation/widgets/document_list.dart';

/// Dashboard screen showing documents list
class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentNavIndex = 1; // Documents tab

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Documents'),
        actions: [
          const ThemeToggleWidget(),
          const SizedBox(width: AppDimensions.spacing8),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).signOut();
            },
            tooltip: 'Sign Out',
          ),
          const SizedBox(width: AppDimensions.spacing8),
        ],
      ),
      body: DocumentList(),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _handleUpload(),
        child: const Icon(Icons.add),
        tooltip: 'Upload Document',
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentNavIndex,
        onTap: _onNavTap,
      ),
    );
  }

  void _onNavTap(int index) {
    setState(() {
      _currentNavIndex = index;
    });

    // Navigate to different screens based on index
    switch (index) {
      case 0: // Home
        // TODO: Navigate to home
        break;
      case 1: // Documents
        // Already here
        break;
      case 2: // Upload
        _handleUpload();
        break;
      case 3: // Settings
        // TODO: Navigate to settings
        break;
    }
  }

  Future<void> _handleUpload() async {
    try {
      await ref.read(documentsProvider.notifier).uploadDocument();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document uploaded successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
