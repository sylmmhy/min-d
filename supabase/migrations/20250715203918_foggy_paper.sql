/*
  # Create spline_event_logs table for debugging Spline events

  1. New Tables
    - `spline_event_logs`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `event_type` (text) - Type of event (e.g., spline_goals_trigger)
      - `source_webhook` (text) - Which webhook received the event
      - `raw_payload` (jsonb) - Original payload from Spline
      - `broadcast_payload` (jsonb) - Data prepared for Realtime broadcast
      - `status` (text) - Processing status (received, broadcasted, error)
      - `error_message` (text) - Error details if processing failed

  2. Security
    - Enable RLS on `spline_event_logs` table
    - Add policy for read access to help with debugging
*/

CREATE TABLE IF NOT EXISTS public.spline_event_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  event_type text,
  source_webhook text,
  raw_payload jsonb,
  broadcast_payload jsonb,
  status text DEFAULT 'received',
  error_message text
);

ALTER TABLE public.spline_event_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for debugging" 
  ON public.spline_event_logs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for service role" 
  ON public.spline_event_logs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for service role" 
  ON public.spline_event_logs 
  FOR UPDATE 
  USING (true);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_spline_event_logs_created_at 
  ON public.spline_event_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spline_event_logs_status 
  ON public.spline_event_logs (status);

CREATE INDEX IF NOT EXISTS idx_spline_event_logs_source 
  ON public.spline_event_logs (source_webhook);