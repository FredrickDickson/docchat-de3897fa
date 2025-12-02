import '../entities/chat_session.dart';
import '../entities/message.dart';

abstract class ChatRepositoryInterface {
  Future<ChatSession> createSession({
    String? documentId,
    String? title,
  });

  Future<List<ChatSession>> listSessions();

  Future<List<Message>> listMessages(String chatSessionId);

  Future<Message> sendMessage({
    required String chatSessionId,
    required String content,
    String role = 'user',
  });
}


