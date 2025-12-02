import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/utils/logger.dart';
import '../../domain/entities/chat_session.dart';
import '../../domain/entities/message.dart';
import '../../domain/repositories/chat_repository_interface.dart';
import '../models/chat_session_model.dart';
import '../models/message_model.dart';
import '../../../../core/config/supabase_config.dart';

class ChatRepository implements ChatRepositoryInterface {
  final SupabaseClient _client;

  ChatRepository({SupabaseClient? client})
      : _client = client ?? SupabaseConfig.client;

  @override
  Future<ChatSession> createSession({
    String? documentId,
    String? title,
  }) async {
    try {
      final user = SupabaseConfig.currentUser;
      if (user == null) {
        throw const AuthenticationFailure('User not authenticated');
      }

      final response = await _client
          .from('chat_sessions')
          .insert(<String, dynamic>{
            'user_id': user.id,
            'document_id': documentId,
            'title': title,
          })
          .select()
          .single();

      final session = ChatSessionModel.fromMap(response).toDomain();
      return session;
    } catch (e, st) {
      AppLogger.error('createSession failed', e, st);
      throw UnknownFailure('Failed to create chat session', e);
    }
  }

  @override
  Future<List<ChatSession>> listSessions() async {
    try {
      final user = SupabaseConfig.currentUser;
      if (user == null) {
        throw const AuthenticationFailure('User not authenticated');
      }

      final response = await _client
          .from('chat_sessions')
          .select()
          .eq('user_id', user.id)
          .order('updated_at', ascending: false);

      final sessions = (response as List<dynamic>)
          .map(
            (e) => ChatSessionModel.fromMap(
              e as Map<String, dynamic>,
            ).toDomain(),
          )
          .toList();

      return sessions;
    } catch (e, st) {
      AppLogger.error('listSessions failed', e, st);
      throw UnknownFailure('Failed to load chat sessions', e);
    }
  }

  @override
  Future<List<Message>> listMessages(
    String chatSessionId,
  ) async {
    try {
      final user = SupabaseConfig.currentUser;
      if (user == null) {
        throw const AuthenticationFailure('User not authenticated');
      }

      final response = await _client
          .from('messages')
          .select()
          .eq('chat_session_id', chatSessionId)
          .eq('user_id', user.id)
          .order('created_at', ascending: true);

      final messages = (response as List<dynamic>)
          .map(
            (e) => MessageModel.fromMap(
              e as Map<String, dynamic>,
            ).toDomain(),
          )
          .toList();

      return messages;
    } catch (e, st) {
      AppLogger.error('listMessages failed', e, st);
      throw UnknownFailure('Failed to load messages', e);
    }
  }

  @override
  Future<Message> sendMessage({
    required String chatSessionId,
    required String content,
    String role = 'user',
  }) async {
    try {
      final user = SupabaseConfig.currentUser;
      if (user == null) {
        throw const AuthenticationFailure('User not authenticated');
      }

      final response = await _client
          .from('messages')
          .insert(<String, dynamic>{
            'chat_session_id': chatSessionId,
            'user_id': user.id,
            'role': role,
            'content': content,
          })
          .select()
          .single();

      final message = MessageModel.fromMap(response).toDomain();
      return message;
    } catch (e, st) {
      AppLogger.error('sendMessage failed', e, st);
      throw UnknownFailure('Failed to send message', e);
    }
  }
}


