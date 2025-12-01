import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/chat_provider.dart';
import '../widgets/chat_input.dart';
import '../widgets/message_bubble.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({
    super.key,
    this.initialSessionId,
    this.documentId,
    this.title,
  });

  final String? initialSessionId;
  final String? documentId;
  final String? title;

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      _initialized = true;
      final notifier = ref.read(chatProvider.notifier);
      notifier.loadSessions().then((_) {
        notifier.openSession(
          existingSessionId: widget.initialSessionId,
          documentId: widget.documentId,
          title: widget.title,
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chatProvider);
    final notifier = ref.read(chatProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: Text(state.activeSession?.title ?? 'Chat'),
      ),
      body: Column(
        children: [
          if (state.errorMessage != null)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                state.errorMessage!,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                ),
              ),
            ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(bottom: 8),
              itemCount: state.messages.length,
              itemBuilder: (context, index) {
                final message = state.messages[index];
                return MessageBubble(message: message);
              },
            ),
          ),
          ChatInput(
            isSending: state.isSending,
            onSend: notifier.sendMessage,
          ),
        ],
      ),
    );
  }
}


