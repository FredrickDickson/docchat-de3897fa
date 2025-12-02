import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/utils/logger.dart';
import '../../data/repositories/document_repository.dart';
import '../../domain/entities/document.dart';
import '../../domain/repositories/document_repository_interface.dart';

/// Document repository provider
final documentRepositoryProvider = Provider<DocumentRepositoryInterface>((ref) {
  return DocumentRepository();
});

/// Documents list state
class DocumentsState {
  final List<Document> documents;
  final bool isLoading;
  final String? error;
  final bool hasMore;

  const DocumentsState({
    this.documents = const [],
    this.isLoading = false,
    this.error,
    this.hasMore = true,
  });

  DocumentsState copyWith({
    List<Document>? documents,
    bool? isLoading,
    String? error,
    bool? hasMore,
  }) {
    return DocumentsState(
      documents: documents ?? this.documents,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

/// Documents provider
class DocumentsNotifier extends StateNotifier<DocumentsState> {
  final DocumentRepositoryInterface _repository;

  DocumentsNotifier(this._repository) : super(const DocumentsState()) {
    loadDocuments();
  }

  /// Load documents
  Future<void> loadDocuments() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final documents = await _repository.listDocuments(limit: 20);
      state = state.copyWith(
        documents: documents,
        isLoading: false,
        hasMore: documents.length >= 20,
      );
      AppLogger.info('Loaded ${documents.length} documents');
    } catch (e) {
      AppLogger.error('Error loading documents', e);
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Refresh documents
  Future<void> refresh() async {
    await loadDocuments();
  }

  /// Upload document
  Future<void> uploadDocument() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final document = await _repository.uploadDocument();
      
      // Add to beginning of list
      final updatedDocs = [document, ...state.documents];
      state = state.copyWith(
        documents: updatedDocs,
        isLoading: false,
      );
      
      AppLogger.info('Document uploaded: ${document.name}');
    } catch (e) {
      AppLogger.error('Error uploading document', e);
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Delete document
  Future<void> deleteDocument(String documentId) async {
    try {
      await _repository.deleteDocument(documentId);
      
      // Remove from list
      final updatedDocs = state.documents
          .where((doc) => doc.id != documentId)
          .toList();
      
      state = state.copyWith(documents: updatedDocs);
      AppLogger.info('Document deleted: $documentId');
    } catch (e) {
      AppLogger.error('Error deleting document', e);
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Load more documents (pagination)
  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoading) return;

    try {
      final lastDoc = state.documents.isEmpty ? null : state.documents.last;
      if (lastDoc == null) return;

      final moreDocs = await _repository.listDocuments(
        limit: 20,
        startingAfterId: lastDoc.id,
      );

      final updatedDocs = [...state.documents, ...moreDocs];
      state = state.copyWith(
        documents: updatedDocs,
        hasMore: moreDocs.length >= 20,
      );

      AppLogger.info('Loaded ${moreDocs.length} more documents');
    } catch (e) {
      AppLogger.error('Error loading more documents', e);
    }
  }
}

/// Documents provider
final documentsProvider =
    StateNotifierProvider<DocumentsNotifier, DocumentsState>((ref) {
  final repository = ref.watch(documentRepositoryProvider);
  return DocumentsNotifier(repository);
});
