import '../../domain/entities/chat_session.dart';

class ChatSessionModel {
  final String id;
  final String userId;
  final String? documentId;
  final String? title;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ChatSessionModel({
    required this.id,
    required this.userId,
    this.documentId,
    this.title,
    this.createdAt,
    this.updatedAt,
  });

  factory ChatSessionModel.fromMap(Map<String, dynamic> map) {
    return ChatSessionModel(
      id: map['id'] as String,
      userId: map['user_id'] as String,
      documentId: map['document_id'] as String?,
      title: map['title'] as String?,
      createdAt: map['created_at'] != null
          ? DateTime.parse(map['created_at'] as String)
          : null,
      updatedAt: map['updated_at'] != null
          ? DateTime.parse(map['updated_at'] as String)
          : null,
    );
  }

  ChatSession toDomain() => ChatSession(
        id: id,
        userId: userId,
        documentId: documentId,
        title: title,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );
}


