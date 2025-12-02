import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_dimensions.dart';
import '../../../../shared/widgets/bottom_nav_bar.dart';
import '../providers/documents_provider.dart';
import '../widgets/upload_dropzone.dart';

/// Document upload screen
class DocumentUploadScreen extends ConsumerStatefulWidget {
  const DocumentUploadScreen({super.key});

  @override
  ConsumerState<DocumentUploadScreen> createState() => _DocumentUploadScreenState();
}

class _DocumentUploadScreenState extends ConsumerState<DocumentUploadScreen> {
  int _currentNavIndex = 2; // Upload tab
  bool _isUploading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Document'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () {
              _showHelpDialog();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: AppDimensions.spacing16),
            UploadDropzone(
              onTap: _handleUpload,
              isUploading: _isUploading,
            ),
            const SizedBox(height: AppDimensions.spacing24),
            // TODO: Add upload progress list here
          ],
        ),
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

    switch (index) {
      case 0: // Home
        // TODO: Navigate to home
        Navigator.of(context).pop();
        break;
      case 1: // Documents
        Navigator.of(context).pop();
        break;
      case 2: // Upload
        // Already here
        break;
      case 3: // Settings
        // TODO: Navigate to settings
        break;
    }
  }

  Future<void> _handleUpload() async {
    setState(() {
      _isUploading = true;
    });

    try {
      await ref.read(documentsProvider.notifier).uploadDocument();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document uploaded successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Navigate back to documents list
        Navigator.of(context).pop();
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
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  void _showHelpDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Upload Help'),
        content: const Text(
          'You can upload PDF, DOCX, and PPTX files up to 100MB in size. '
          'Once uploaded, you can chat with your documents using AI.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }
}
