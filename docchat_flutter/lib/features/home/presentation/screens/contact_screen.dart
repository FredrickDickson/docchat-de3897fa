import 'package:flutter/material.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    String? email;
    String? message;

    return Scaffold(
      appBar: AppBar(title: const Text('Contact')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                onSaved: (v) => email = v,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Message'),
                maxLines: 4,
                onSaved: (v) => message = v,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () {
                  formKey.currentState?.save();
                  // TODO: wire to backend/email service if desired.
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Message sent (mock).')),
                  );
                },
                child: const Text('Send'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}


