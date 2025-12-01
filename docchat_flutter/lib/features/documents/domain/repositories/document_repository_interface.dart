import '../entities/document.dart';

abstract class DocumentRepositoryInterface {
  Future<List<Document>> listDocuments({
    int limit = 20,
    String? startingAfterId,
  });

  Future<Document> uploadDocument();

  Future<void> deleteDocument(String documentId);
}



