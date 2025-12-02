import 'package:dio/dio.dart';
import '../config/env_config.dart';
import '../constants/api_constants.dart';
import '../utils/logger.dart';

/// Service to interact with AI APIs (DeepSeek)
class AIService {
  late final Dio _dio;

  AIService() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.deepSeekBaseUrl,
      headers: {
        'Authorization': 'Bearer ${EnvConfig.deepSeekApiKey}',
        'Content-Type': 'application/json',
      },
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 60),
    ));
    
    // Add logging interceptor in debug mode
    if (EnvConfig.isDevelopment) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => AppLogger.debug(obj.toString()),
      ));
    }
  }

  /// Send a chat message to the AI
  /// [messages] is a list of message objects with 'role' and 'content'
  Future<String> chat(List<Map<String, dynamic>> messages, {double temperature = 0.7}) async {
    try {
      AppLogger.info('Sending request to DeepSeek API');
      
      final response = await _dio.post(
        ApiConstants.chatCompletionsEndpoint,
        data: {
          'model': ApiConstants.deepSeekChatModel,
          'messages': messages,
          'temperature': temperature,
        },
      );

      if (response.statusCode == 200) {
        final content = response.data['choices'][0]['message']['content'];
        return content;
      } else {
        throw Exception('Failed to get response: ${response.statusCode}');
      }
    } on DioException catch (e) {
      AppLogger.error('DeepSeek API Error: ${e.message}', e);
      if (e.response != null) {
        AppLogger.error('Response data: ${e.response?.data}');
      }
      rethrow;
    } catch (e) {
      AppLogger.error('Unexpected error in AIService', e);
      rethrow;
    }
  }
  
  /// Summarize text
  Future<String> summarize(String text) async {
    final messages = [
      {'role': 'system', 'content': 'You are a helpful assistant that summarizes documents.'},
      {'role': 'user', 'content': 'Please summarize the following text:\n\n$text'},
    ];
    
    return chat(messages);
  }
}
