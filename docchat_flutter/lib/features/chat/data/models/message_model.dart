import '../../domain/entities/message.dart';

class MessageModel {
  final String id;
  final String chatSessionId;
  final String userId;
  final String role;
  final String content;
  final int? tokensUsed;
  final double? costUsd;
  final DateTime? createdAt;

  const MessageModel({
    required this.id,
    required this.chatSessionId,
    required this.userId,
    required this.role,
    required this.content,
    this.tokensUsed,
    this.costUsd,
    this.createdAt,
  });

  factory MessageModel.fromMap(Map<String, dynamic> map) {
    return MessageModel(
      id: map['id'] as String,
      chatSessionId: map['chat_session_id'] as String,
      userId: map['user_id'] as String,
      role: map['role'] as String,
      content: map['content'] as String,
      tokensUsed:
          map['tokens_used'] != null ? (map['tokens_used'] as num).toInt() : null,
      costUsd: map['cost_usd'] != null
          ? (map['cost_usd'] as num).toDouble()
          : null,
      createdAt: map['created_at'] != null
          ? DateTime.parse(map['created_at'] as String)
          : null,
    );
  }

  Message toDomain() => Message(
        id: id,
        chatSessionId: chatSessionId,
        userId: userId,
        role: role,
        content: content,
        tokensUsed: tokensUsed,
        costUsd: costUsd,
        createdAt: createdAt,
      );
}


