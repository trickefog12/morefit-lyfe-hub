import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Content-Security-Policy': "default-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Allowed analytics types
const ALLOWED_TYPES = new Set(['event', 'page_view']);
const ALLOWED_EVENT_TYPES = new Set(['interaction', 'navigation', 'conversion', 'error', 'performance', 'custom']);
const MAX_PROPERTIES_SIZE = 4096; // 4KB max for properties JSON
const MAX_PROPERTIES_KEYS = 20;

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_EVENTS_PER_WINDOW = 30;
const MAX_PAGE_VIEWS_PER_WINDOW = 20;

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

function sanitizeProperties(input: unknown): Record<string, unknown> | null {
  if (input == null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) return {};
  
  const json = JSON.stringify(input);
  if (json.length > MAX_PROPERTIES_SIZE) return {};
  
  const obj = input as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length > MAX_PROPERTIES_KEYS) {
    // Truncate to max keys
    const truncated: Record<string, unknown> = {};
    for (const key of keys.slice(0, MAX_PROPERTIES_KEYS)) {
      truncated[sanitizeString(key, 100) || key] = typeof obj[key] === 'string' 
        ? sanitizeString(obj[key] as string, 500) 
        : obj[key];
    }
    return truncated;
  }
  
  // Sanitize string values within properties
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = sanitizeString(key, 100) || key;
    sanitized[safeKey] = typeof value === 'string' ? sanitizeString(value, 500) : value;
  }
  return sanitized;
}

function validateDuration(input: unknown): number | null {
  if (input == null) return null;
  const num = Number(input);
  if (isNaN(num) || num < 0 || num > 86400) return null; // max 24 hours
  return Math.round(num);
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
    
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return new Response(
        JSON.stringify({ error: 'Request body must be an object' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type, data } = body as { type: unknown; data: unknown };

    if (typeof type !== 'string' || !ALLOWED_TYPES.has(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid analytics type. Allowed: event, page_view' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return new Response(
        JSON.stringify({ error: 'Data must be an object' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const d = data as Record<string, unknown>;

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
      // Validate required fields with type checks
      if (typeof d.event_type !== 'string' || typeof d.event_name !== 'string') {
        return new Response(
          JSON.stringify({ error: 'event_type and event_name must be strings' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!ALLOWED_EVENT_TYPES.has(d.event_type)) {
        return new Response(
          JSON.stringify({ error: `Invalid event_type. Allowed: ${[...ALLOWED_EVENT_TYPES].join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await serviceClient.from('analytics_events').insert({
        event_type: sanitizeString(d.event_type, 100),
        event_name: sanitizeString(d.event_name, 200),
        user_id: userId,
        session_id: sanitizeString(d.session_id as string, 100),
        properties: sanitizeProperties(d.properties),
        page_path: sanitizeUrl(d.page_path as string, 500),
        referrer: sanitizeUrl(d.referrer as string, 2000),
        user_agent: sanitizeString(d.user_agent as string, 500),
        device_type: sanitizeString(d.device_type as string, 50),
      });

      if (error) {
        console.error('Failed to insert analytics event');
        return new Response(
          JSON.stringify({ error: 'Failed to track event' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (type === 'page_view') {
      if (typeof d.page_path !== 'string' || !d.page_path) {
        return new Response(
          JSON.stringify({ error: 'page_path must be a non-empty string' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await serviceClient.from('analytics_page_views').insert({
        page_path: sanitizeUrl(d.page_path, 500),
        page_title: sanitizeString(d.page_title as string, 200),
        user_id: userId,
        session_id: sanitizeString(d.session_id as string, 100),
        referrer: sanitizeUrl(d.referrer as string, 2000),
        duration_seconds: validateDuration(d.duration_seconds),
      });

      if (error) {
        console.error('Failed to insert page view');
        return new Response(
          JSON.stringify({ error: 'Failed to track page view' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
