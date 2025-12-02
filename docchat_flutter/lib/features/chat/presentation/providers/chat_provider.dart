import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/chat_repository.dart';
import '../../domain/repositories/chat_repository_interface.dart';
import '../../../../core/services/ai_service.dart';
import '../../../../core/providers/ai_provider.dart';
import 'chat_state.dart';

final chatRepositoryProvider = Provider<ChatRepositoryInterface>((ref) {
  return ChatRepository();
});

final chatProvider =
    StateNotifierProvider<ChatNotifier, ChatState>((ref) => ChatNotifier(
          repository: ref.watch(chatRepositoryProvider),
          aiService: ref.watch(aiServiceProvider),
        ));

class ChatNotifier extends StateNotifier<ChatState> {
  ChatNotifier({
    required ChatRepositoryInterface repository,
    required AIService aiService,
  })  : _repository = repository,
        _aiService = aiService,
        super(const ChatState());

  final ChatRepositoryInterface _repository;
  final AIService _aiService;

  Future<void> loadSessions() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final sessions = await _repository.listSessions();
      state = state.copyWith(
        isLoading: false,
        sessions: sessions,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> openSession({
    String? existingSessionId,
    String? documentId,
    String? title,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    if (existingSessionId != null) {
      try {
        final messages = await _repository.listMessages(existingSessionId);
        final active = state.sessions.firstWhere(
          (s) => s.id == existingSessionId,
          orElse: () => state.activeSession ?? state.sessions.first,
        );
        state = state.copyWith(
          isLoading: false,
          activeSession: active,
          messages: messages,
        );
      } catch (e) {
        state = state.copyWith(
          isLoading: false,
          errorMessage: e.toString(),
        );
      }
      return;
    }

    try {
      final session =
          await _repository.createSession(documentId: documentId, title: title);
      final updatedSessions = [session, ...state.sessions];
      final messages = await _repository.listMessages(session.id);
      state = state.copyWith(
        isLoading: false,
        sessions: updatedSessions,
        activeSession: session,
        messages: messages,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> sendMessage(String content) async {
    final session = state.activeSession;
    if (session == null || content.trim().isEmpty) return;

    state = state.copyWith(isSending: true, errorMessage: null);
    try {
      // 1. Save user message
      final userMessage = await _repository.sendMessage(
        chatSessionId: session.id,
        content: content.trim(),
        role: 'user',
      );
      
      // Update state with user message immediately
      var updatedMessages = [...state.messages, userMessage];
      state = state.copyWith(
        messages: updatedMessages,
      );

      // 2. Prepare context for AI
      final history = updatedMessages.map((m) => {
        'role': m.role,
        'content': m.content,
      }).toList();
      
      // Add system prompt if needed (can be customized based on document)
      // history.insert(0, {'role': 'system', 'content': 'You are a helpful assistant.'});

      // 3. Call AI Service
      final aiResponseContent = await _aiService.chat(history);

      // 4. Save AI response
      final aiMessage = await _repository.sendMessage(
        chatSessionId: session.id,
        content: aiResponseContent,
        role: 'assistant',
      );

      // 5. Update state with AI message
      updatedMessages = [...updatedMessages, aiMessage];
      state = state.copyWith(
        isSending: false,
        messages: updatedMessages,
      );
    } catch (e) {
      state = state.copyWith(
        isSending: false,
        errorMessage: e.toString(),
      );
    }
  }
}


