/// Domain entity for a user document, matching the `public.documents` table.
class Document {
  final String id;
  final String userId;
  final String name;
  final String filePath;
  final int fileSize;
  final String fileType;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Document({
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

  factory Document.fromMap(Map<String, dynamic> map) {
    return Document(
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

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'file_path': filePath,
      'file_size': fileSize,
      'file_type': fileType,
      'status': status,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}



