import '../../domain/entities/document.dart';

/// Data model for mapping Supabase rows to the domain [Document] entity.
class DocumentModel {
  final String id;
  final String userId;
  final String name;
  final String filePath;
  final int fileSize;
  final String fileType;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const DocumentModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.filePath,
    required this.fileSize,
    required this.fileType,
    required this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory DocumentModel.fromMap(Map<String, dynamic> map) {
    return DocumentModel(
      id: map['id'] as String,
      userId: map['user_id'] as String,
      name: map['name'] as String,
      filePath: map['file_path'] as String,
      fileSize: (map['file_size'] as num).toInt(),
      fileType: map['file_type'] as String,
      status: map['status'] as String,
      createdAt: map['created_at'] != null
          ? DateTime.parse(map['created_at'] as String)
          : null,
      updatedAt: map['updated_at'] != null
          ? DateTime.parse(map['updated_at'] as String)
          : null,
    );
  }

  Document toDomain() => Document(
        id: id,
        userId: userId,
        name: name,
        filePath: filePath,
        fileSize: fileSize,
        fileType: fileType,
        status: status,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );
}



