import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_EVENTS_PER_WINDOW = 30; // 30 events per minute per user
const MAX_PAGE_VIEWS_PER_WINDOW = 20; // 20 page views per minute per user

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory rate limit store (resets on function restart, which is fine for this use case)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Input sanitization to prevent XSS in stored data
function sanitizeString(input: string | null | undefined, maxLength: number = 500): string | null {
  if (input == null) return null;
  // Remove potential XSS characters and limit length
  return String(input)
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[char] || char;
    });
}

function sanitizeUrl(input: string | null | undefined, maxLength: number = 2000): string | null {
  if (input == null) return null;
  const sanitized = String(input).slice(0, maxLength);
  // Only allow http, https protocols or relative paths
  if (sanitized.startsWith('http://') || sanitized.startsWith('https://') || sanitized.startsWith('/')) {
    return sanitized.replace(/[<>"']/g, '');
  }
  return null;
}

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // Start new window
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= maxRequests) {
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  const resetIn = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
  return { allowed: true, remaining: maxRequests - entry.count, resetIn };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.log('Analytics request rejected: missing authorization');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's JWT to get their ID
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.log('Analytics request rejected: invalid user');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing type or data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Apply rate limiting based on event type
    const rateLimitKey = `${userId}_${type}`;
    const maxRequests = type === 'page_view' ? MAX_PAGE_VIEWS_PER_WINDOW : MAX_EVENTS_PER_WINDOW;
    const rateLimit = checkRateLimit(rateLimitKey, maxRequests);

    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user analytics: ${type}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
          } 
        }
      );
    }

    // Use service role client for inserting data
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    if (type === 'event') {
      // Validate required fields
      if (!data.event_type || !data.event_name) {
        return new Response(
          JSON.stringify({ error: 'Missing required event fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await serviceClient.from('analytics_events').insert({
        event_type: sanitizeString(data.event_type, 100),
        event_name: sanitizeString(data.event_name, 200),
        user_id: userId,
        session_id: sanitizeString(data.session_id, 100),
        properties: data.properties || {},
        page_path: sanitizeUrl(data.page_path, 500),
        referrer: sanitizeUrl(data.referrer, 2000),
        user_agent: sanitizeString(data.user_agent, 500),
        device_type: sanitizeString(data.device_type, 50),
      });

      if (error) {
        console.error('Failed to insert analytics event');
        return new Response(
          JSON.stringify({ error: 'Failed to track event' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (type === 'page_view') {
      // Validate required fields
      if (!data.page_path) {
        return new Response(
          JSON.stringify({ error: 'Missing required page_path' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await serviceClient.from('analytics_page_views').insert({
        page_path: sanitizeUrl(data.page_path, 500),
        page_title: sanitizeString(data.page_title, 200),
        user_id: userId,
        session_id: sanitizeString(data.session_id, 100),
        referrer: sanitizeUrl(data.referrer, 2000),
      });

      if (error) {
        console.error('Failed to insert page view');
        return new Response(
          JSON.stringify({ error: 'Failed to track page view' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid analytics type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetIn: Math.ceil(rateLimit.resetIn / 1000)
        }
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
        } 
      }
    );
  } catch (error) {
    console.error('Analytics edge function error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
