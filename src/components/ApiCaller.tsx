import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, XCircle, Code } from 'lucide-react';

interface ApiResponse {
  success: boolean;
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
}

export const ApiCaller: React.FC = () => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{\n  "title": "Test Post",\n  "body": "This is a test",\n  "userId": 1\n}');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Parse headers
      let parsedHeaders = {};
      if (headers.trim()) {
        try {
          parsedHeaders = JSON.parse(headers);
        } catch (err) {
          throw new Error('Invalid JSON in headers');
        }
      }

      // Parse body for non-GET requests
      let parsedBody;
      if (method !== 'GET' && body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch (err) {
          // If it's not valid JSON, send as string
          parsedBody = body;
        }
      }

      // Call our Edge Function
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-caller`;
      
      const requestPayload = {
        url,
        method,
        headers: parsedHeaders,
        body: parsedBody
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      const result = await response.json();
      setResponse(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40 bg-white/10 backdrop-blur-md border border-white/20 
                    rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Send className="w-5 h-5 text-white" />
        <h3 className="text-white font-semibold">API Caller</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-white/80 text-sm mb-1">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg 
                       text-white placeholder-white/50 focus:outline-none focus:ring-2 
                       focus:ring-blue-400/50 text-sm"
            placeholder="https://api.example.com/endpoint"
            required
          />
        </div>

        {/* Method Select */}
        <div>
          <label className="block text-white/80 text-sm mb-1">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg 
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        {/* Headers */}
        <div>
          <label className="block text-white/80 text-sm mb-1">Headers (JSON)</label>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg 
                       text-white placeholder-white/50 focus:outline-none focus:ring-2 
                       focus:ring-blue-400/50 text-sm font-mono"
            rows={3}
            placeholder='{"Content-Type": "application/json"}'
          />
        </div>

        {/* Body (for non-GET requests) */}
        {method !== 'GET' && (
          <div>
            <label className="block text-white/80 text-sm mb-1">Body (JSON)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg 
                         text-white placeholder-white/50 focus:outline-none focus:ring-2 
                         focus:ring-blue-400/50 text-sm font-mono"
              rows={4}
              placeholder='{"key": "value"}'
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg 
                     transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Request
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-200">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-red-100 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            {response.success ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-white font-medium text-sm">
              {response.status} {response.statusText}
            </span>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-white/60" />
              <span className="text-white/80 text-sm font-medium">Response</span>
            </div>
            <pre className="text-xs text-white/70 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};