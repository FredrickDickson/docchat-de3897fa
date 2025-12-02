/**
 * Vercel Serverless Function: Upload PDF
 * Handles PDF file uploads to Supabase Storage
 * 
 * Deploy to: /api/upload
 * Note: For large files, consider using direct Supabase Storage upload from client
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header or request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract user ID from JWT token (simplified - in production, verify token)
    // For now, we'll get it from the request body
    const { userId, fileData, fileName } = req.body;

    if (!userId || !fileData || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    const filePath = `${userId}/${Date.now()}-${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('pdf-uploads')
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    return res.status(200).json({
      fileId: data.path,
      message: 'File uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to upload file',
    });
  }
}

