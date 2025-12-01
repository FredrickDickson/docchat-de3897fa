import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:mime/mime.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:docchat_flutter/core/config/supabase_config.dart';

/// High-level helpers around Supabase Storage buckets defined in the SQL schema:
/// - documents       (DocChat document uploads)
/// - pdf-uploads     (raw PDFs for summarizer)
/// - extracted-text  (parsed / OCR text per document)
/// - public-assets   (public marketing assets)
///
/// These helpers respect the RLS conventions used in `database/03_storage.sql`.
class SupabaseStorageService {
  const SupabaseStorageService._();

  /// Pick a file from the device using `file_picker`.
  static Future<PlatformFile?> pickDocumentFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
      withData: true,
    );

    if (result == null || result.files.isEmpty) {
      return null;
    }
    return result.files.single;
  }

  // ---------------------------------------------------------------------------
  // documents bucket: main DocChat user documents
  // ---------------------------------------------------------------------------

  /// Uploads a document into the `documents` bucket using the RLS convention:
  /// `<user_id>/<file_name>`.
  ///
  /// Returns the storage path that was used.
  static Future<String> uploadDocumentToDocumentsBucket(
    PlatformFile file,
  ) async {
    final user = SupabaseConfig.currentUser;
    if (user == null) {
      throw Exception('User must be logged in to upload documents.');
    }

    final bytes = file.bytes;
    if (bytes == null) {
      throw Exception('File bytes are null. Make sure withData: true is set.');
    }

    final fileName = file.name;
    final path = '${user.id}/$fileName';
    final mimeType = lookupMimeType(fileName) ?? 'application/octet-stream';

    final res = await SupabaseConfig.documentsBucket.uploadBinary(
      path,
      bytes,
      fileOptions: FileOptions(
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      ),
    );

    if (res.isEmpty) {
      throw Exception('Failed to upload document to $path');
    }

    return path;
  }

  /// Downloads a document from the `documents` bucket for the current user.
  /// `fileName` should be the original filename; the path is derived using
  /// the same `<user_id>/<file_name>` convention.
  static Future<Uint8List> downloadDocumentFromDocumentsBucket(
    String fileName,
  ) async {
    final user = SupabaseConfig.currentUser;
    if (user == null) {
      throw Exception('User must be logged in to download documents.');
    }

    final path = '${user.id}/$fileName';
    return SupabaseConfig.documentsBucket.download(path);
  }

  // ---------------------------------------------------------------------------
  // pdf-uploads bucket: raw PDFs for summarizer
  // ---------------------------------------------------------------------------

  /// Upload a raw PDF to `pdf-uploads` bucket for summarization.
  /// Returns the storage path `<user_id>/<file_name>` so it can be linked
  /// from `summaries` / `files` tables.
  static Future<String> uploadPdfForSummarizer(PlatformFile file) async {
    final user = SupabaseConfig.currentUser;
    if (user == null) {
      throw Exception('User must be logged in to upload PDFs.');
    }

    final bytes = file.bytes;
    if (bytes == null) {
      throw Exception('File bytes are null. Make sure withData: true is set.');
    }

    final fileName = file.name;
    final path = '${user.id}/$fileName';
    final mimeType = lookupMimeType(fileName) ?? 'application/pdf';

    final res = await SupabaseConfig.pdfUploadsBucket.uploadBinary(
      path,
      bytes,
      fileOptions: FileOptions(
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      ),
    );

    if (res.isEmpty) {
      throw Exception('Failed to upload PDF to $path');
    }

    return path;
  }

  /// Downloads a PDF from `pdf-uploads` given its storage path.
  static Future<Uint8List> downloadPdfForSummarizer(String path) async {
    return SupabaseConfig.pdfUploadsBucket.download(path);
  }

  // ---------------------------------------------------------------------------
  // extracted-text bucket: parsed / OCR text
  // ---------------------------------------------------------------------------

  /// Saves extracted text for a document to the `extracted-text` bucket.
  ///
  /// Uses the key `<user_id>/<document_id>.txt`.
  static Future<String> saveExtractedText({
   required String documentId,
    required String text,
  }) async {
    final user = SupabaseConfig.currentUser;
    if (user == null) {
      throw Exception('User must be logged in to save extracted text.');
    }

    final path = '${user.id}/$documentId.txt';
    final bytes = Uint8List.fromList(text.codeUnits);

    final res = await SupabaseConfig.extractedTextBucket.uploadBinary(
      path,
      bytes,
      fileOptions: const FileOptions(
        cacheControl: '3600',
        upsert: true,
        contentType: 'text/plain; charset=utf-8',
      ),
    );

    if (res.isEmpty) {
      throw Exception('Failed to save extracted text to $path');
    }

    return path;
  }

  /// Loads previously saved extracted text from `extracted-text`.
  static Future<String> loadExtractedText(String documentId) async {
    final user = SupabaseConfig.currentUser;
    if (user == null) {
      throw Exception('User must be logged in to load extracted text.');
    }

    final path = '${user.id}/$documentId.txt';
    final data = await SupabaseConfig.extractedTextBucket.download(path);
    return String.fromCharCodes(data);
  }

  // ---------------------------------------------------------------------------
  // public-assets bucket: public marketing assets
  // ---------------------------------------------------------------------------

  /// Returns a public URL for an asset stored in `public-assets`.
  static String getPublicAssetUrl(String filePath) {
    return SupabaseConfig.publicAssetsBucket.getPublicUrl(filePath);
  }
}


