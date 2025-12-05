-- Migration: 14_usage_analytics.sql
-- Create user analytics table for tracking usage and credit consumption

CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'chat', 'summary', 'ocr', 'upload', 'download'
  credits_used INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX idx_user_analytics_user_created ON user_analytics(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analytics"
  ON user_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert analytics"
  ON user_analytics FOR INSERT
  WITH CHECK (true);

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  event_type TEXT,
  total_events BIGINT,
  total_credits BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.event_type,
    COUNT(*) as total_events,
    SUM(ua.credits_used) as total_credits
  FROM user_analytics ua
  WHERE ua.user_id = p_user_id
    AND ua.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY ua.event_type
  ORDER BY total_credits DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily usage stats
CREATE OR REPLACE FUNCTION get_daily_usage(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  total_events BIGINT,
  total_credits BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(ua.created_at) as date,
    COUNT(*) as total_events,
    SUM(ua.credits_used) as total_credits
  FROM user_analytics ua
  WHERE ua.user_id = p_user_id
    AND ua.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(ua.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top documents by usage
CREATE OR REPLACE FUNCTION get_top_documents(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  document_id UUID,
  document_name TEXT,
  total_interactions BIGINT,
  total_credits BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (ua.metadata->>'document_id')::UUID as document_id,
    d.name as document_name,
    COUNT(*) as total_interactions,
    SUM(ua.credits_used) as total_credits
  FROM user_analytics ua
  LEFT JOIN documents d ON (ua.metadata->>'document_id')::UUID = d.id
  WHERE ua.user_id = p_user_id
    AND ua.metadata->>'document_id' IS NOT NULL
  GROUP BY (ua.metadata->>'document_id')::UUID, d.name
  ORDER BY total_interactions DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON user_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_documents TO authenticated;
