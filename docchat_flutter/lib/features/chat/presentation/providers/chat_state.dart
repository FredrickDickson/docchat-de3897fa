import '../../domain/entities/chat_session.dart';
import '../../domain/entities/message.dart';

class ChatState {
  final bool isLoading;
  final bool isSending;
  final List<ChatSession> sessions;
  final ChatSession? activeSession;
  final List<Message> messages;
  final String? errorMessage;

  const ChatState({
    this.isLoading = false,
    this.isSending = false,
    this.sessions = const [],
    this.activeSession,
    this.messages = const [],
    this.errorMessage,
  });

  ChatState copyWith({
    bool? isLoading,
    bool? isSending,
    List<ChatSession>? sessions,
    ChatSession? activeSession,
    List<Message>? messages,
    String? errorMessage,
  }) {
    return ChatState(
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      sessions: sessions ?? this.sessions,
      activeSession: activeSession ?? this.activeSession,
      messages: messages ?? this.messages,
      errorMessage: errorMessage,
    );
  }
}


