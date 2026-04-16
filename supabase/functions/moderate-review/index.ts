import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Content-Security-Policy': "default-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Constants
const MAX_COMMENT_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

// Rate limit store
interface RateLimitEntry {
  count: number;
  windowStart: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  const resetIn = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count, resetIn };
}

function sanitizeString(input: string, maxLength: number): string {
  return String(input)
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;',
      };
      return entities[char] || char;
    });
}

// English profanity list
const englishProfanity = [
  'fuck', 'shit', 'ass', 'bitch', 'bastard', 'damn', 'crap', 'dick', 'cock', 
  'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger', 'nigga', 'retard', 
  'idiot', 'moron', 'stupid', 'dumb', 'kill', 'die', 'hate', 'racist',
  'asshole', 'motherfucker', 'bullshit', 'piss', 'prick', 'wanker',
  'twat', 'bollocks', 'arse', 'bugger', 'bloody', 'scam', 'fraud', 'fake'
];

// Greek profanity list
const greekProfanity = [
  'γαμώ', 'γαμω', 'γαμημένο', 'γαμημενο', 'γαμημένη', 'γαμημενη', 'γάμα', 'γαμα', 'γαμήσου', 'γαμησου',
  'σκατά', 'σκατα', 'σκατό', 'σκατο', 'σκατένιος', 'σκατενιος',
  'μαλάκας', 'μαλακας', 'μαλάκα', 'μαλακα', 'μαλακία', 'μαλακια', 'μαλακίες', 'μαλακιες', 'μαλακισμένος', 'μαλακισμενος',
  'πουτάνα', 'πουτανα', 'πουτάνας', 'πουτανας', 'πουτανιά', 'πουτανια',
  'πούστης', 'πουστης', 'πούστη', 'πουστη', 'πουστιά', 'πουστια',
  'καριόλης', 'καριολης', 'καριόλα', 'καριολα', 'καριόλι', 'καριολι',
  'μουνί', 'μουνι', 'μουνάρα', 'μουναρα',
  'πούτσα', 'πουτσα', 'πούτσο', 'πουτσο',
  'αρχίδι', 'αρχιδι', 'αρχίδια', 'αρχιδια', 'αρχιδάτος', 'αρχιδατος',
  'βλάκας', 'βλακας', 'βλακεία', 'βλακεια',
  'ηλίθιος', 'ηλιθιος', 'ηλίθια', 'ηλιθια', 'ηλιθιότητα', 'ηλιθιοτητα',
  'κερατάς', 'κερατας', 'κέρατο', 'κερατο',
  'παλιο', 'παλιά', 'παλια', 'παλιόμουνο', 'παλιομουνο', 'παλιοπούστης', 'παλιοπουστης',
  'βρωμιάρη', 'βρωμιαρη', 'βρωμιάρης', 'βρωμιαρης', 'βρωμιά', 'βρωμια',
  'σιχαμένος', 'σιχαμενος', 'σιχαμένη', 'σιχαμενη', 'σιχαμάρα', 'σιχαμαρα',
  'άχρηστος', 'αχρηστος', 'άχρηστη', 'αχρηστη',
  'χαζός', 'χαζος', 'χαζή', 'χαζη', 'χαζομάρα', 'χαζομαρα',
  'βλαμμένος', 'βλαμμενος', 'βλαμμένη', 'βλαμμενη',
  'τρελός', 'τρελος', 'τρελή', 'τρελη',
  'ψυχοπαθής', 'ψυχοπαθης', 'ψυχάκιας', 'ψυχακιας',
  'απατεώνας', 'απατεωνας', 'απάτη', 'απατη',
  'κλέφτης', 'κλεφτης', 'κλέφτρα', 'κλεφτρα',
  'κωλο', 'κώλος', 'κωλος', 'κωλόπαιδο', 'κωλοπαιδο',
  'μπάσταρδος', 'μπασταρδος', 'μπαστάρδα', 'μπασταρδα',
  'ζώο', 'ζωο', 'ζώα', 'ζωα',
  'κοπρίτης', 'κοπριτης', 'κοπριά', 'κοπρια',
  'βρομιάρη', 'βρομιαρη', 'βρόμα', 'βρομα'
];

const leetSubstitutions: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', 
  '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i'
};

function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  for (const [leet, char] of Object.entries(leetSubstitutions)) {
    normalized = normalized.split(leet).join(char);
  }
  normalized = normalized.replace(/\s+/g, '');
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  return normalized;
}

function hasSpamPatterns(text: string): boolean {
  const alphaChars = text.replace(/[^a-zA-Zα-ωΑ-Ω]/g, '');
  if (alphaChars.length > 10) {
    const upperCount = (alphaChars.match(/[A-ZΑ-Ω]/g) || []).length;
    if (upperCount / alphaChars.length > 0.7) return true;
  }
  if (/(.)\1{5,}/i.test(text)) return true;
  return false;
}

function containsProfanity(text: string): { found: boolean; reason?: string } {
  const normalized = normalizeText(text);
  const originalLower = text.toLowerCase();
  
  for (const word of englishProfanity) {
    if (normalized.includes(word) || originalLower.includes(word)) {
      return { found: true, reason: 'inappropriate_language' };
    }
  }
  for (const word of greekProfanity) {
    if (normalized.includes(word) || originalLower.includes(word)) {
      return { found: true, reason: 'inappropriate_language' };
    }
  }
  if (hasSpamPatterns(text)) {
    return { found: true, reason: 'spam_pattern' };
  }
  return { found: false };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ approved: false, reason: 'unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ approved: false, reason: 'unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting per user
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      console.log('Rate limit exceeded for review moderation');
      return new Response(
        JSON.stringify({ approved: false, reason: 'rate_limit_exceeded' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
          } 
        }
      );
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ approved: false, reason: 'invalid_json' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return new Response(
        JSON.stringify({ approved: false, reason: 'invalid_input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { comment, rating } = body as { comment: unknown; rating: unknown };
    
    if (!comment || typeof comment !== 'string') {
      return new Response(
        JSON.stringify({ approved: false, reason: 'invalid_input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ approved: false, reason: 'invalid_rating' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enforce length limit
    if (comment.length > MAX_COMMENT_LENGTH) {
      return new Response(
        JSON.stringify({ approved: false, reason: 'comment_too_long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize before moderation check
    const sanitizedComment = sanitizeString(comment, MAX_COMMENT_LENGTH);
    const result = containsProfanity(sanitizedComment);
    
    if (result.found) {
      return new Response(
        JSON.stringify({ approved: false, reason: result.reason }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Content passed moderation — insert as approved using service role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: insertError } = await adminClient.from('reviews').insert({
      user_id: user.id,
      rating,
      comment: sanitizedComment,
      approved: true,
    });

    if (insertError) {
      console.error('Review insert failed');
      return new Response(
        JSON.stringify({ approved: false, reason: 'server_error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ approved: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Review moderation error');
    return new Response(
      JSON.stringify({ approved: false, reason: 'server_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
