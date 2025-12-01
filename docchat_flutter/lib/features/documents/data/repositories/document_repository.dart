import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/utils/logger.dart';
import '../../../../shared/services/supabase_storage_service.dart';
import '../../../../core/config/supabase_config.dart';
import '../../domain/entities/document.dart';
import '../../domain/repositories/document_repository_interface.dart';
import '../models/document_model.dart';

class DocumentRepository implements DocumentRepositoryInterface {
  final SupabaseClient _client;

  DocumentRepository({SupabaseClient? client})
      : _client = client ?? SupabaseConfig.client;

  @override
  Future<List<Document>> listDocuments({
    int limit = 20,
    String? startingAfterId,
  }) async {
    final user = SupabaseConfig.currentUser;
    if (user == null) {
      throw const AuthenticationFailure('User not authenticated');
    }

    try {
      var query = _client
          .from('documents')
          .select()
          .eq('user_id', user.id)
          .order('created_at', ascending: false)
          .limit(limit);

      // Note: For pagination, we would typically use created_at timestamp
      // instead of id comparison. This is a simplified version.
      // In production, you might want to pass a timestamp instead.

      final response = await query;

      final docs = (response as List<dynamic>)
          .map(
            (e) => DocumentModel.fromMap(e as Map<String, dynamic>).toDomain(),
          )
          .toList();

      return docs;
    } catch (e, s) {
      AppLogger.error('Error listing documents', e, s);
      throw UnknownFailure('Failed to load documents', e);
    }
  }

  @override
  Future<Document> uploadDocument() async {
    final user = SupabaseConfig.currentUser;
    if (user == null) {
      throw const AuthenticationFailure('User not authenticated');
    }

    final pickedFile = await SupabaseStorageService.pickDocumentFile();
    if (pickedFile == null) {
      throw const ValidationFailure('No file selected');
    }

    try {
      final storagePath =
          await SupabaseStorageService.uploadDocumentToDocumentsBucket(
        pickedFile,
      );

      final insertPayload = {
        'user_id': user.id,
        'name': pickedFile.name,
        'file_path': storagePath,
        'file_size': pickedFile.size,
        'file_type': pickedFile.extension ?? 'application/octet-stream',
        'status': 'ready',
      };

      final response = await _client
          .from('documents')
          .insert(insertPayload)
          .select()
          .single();

      final model =
          DocumentModel.fromMap(response as Map<String, dynamic>).toDomain();

      return model;
    } on StorageException catch (e, s) {
      AppLogger.error('Storage error uploading document', e, s);
      throw StorageFailure(e.message);
    } on PostgrestException catch (e, s) {
      AppLogger.error('Postgrest error inserting document', e, s);
      throw ServerFailure(e.message);
    } catch (e, s) {
      AppLogger.error('Unknown error uploading document', e, s);
      throw UnknownFailure('Failed to upload document', e);
    }
  }

  @override
  Future<void> deleteDocument(String documentId) async {
    final user = SupabaseConfig.currentUser;
    if (user == null) {
      throw const AuthenticationFailure('User not authenticated');
    }

    try {
      final response = await _client
          .from('documents')
          .select()
          .eq('id', documentId)
          .eq('user_id', user.id)
          .maybeSingle();

      if (response == null) {
        throw const NotFoundFailure('Document not found');
      }

      final model =
          DocumentModel.fromMap(response as Map<String, dynamic>).toDomain();

      try {
        await SupabaseConfig.documentsBucket.remove([model.filePath]);
      } catch (e, s) {
        AppLogger.error('Failed to delete storage object for document', e, s);
      }

      await _client.from('documents').delete().eq('id', documentId);
    } on PostgrestException catch (e, s) {
      AppLogger.error('Postgrest error deleting document', e, s);
      throw ServerFailure(e.message);
    } catch (e, s) {
      AppLogger.error('Unknown error deleting document', e, s);
      throw UnknownFailure('Failed to delete document', e);
    }
  }
}
